const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Briefcase, Heart, User, Calendar, BookOpen, Lock, ThumbsUp, ThumbsDown, Phone, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getProfilePhoto } from '@/lib/profileHelpers';
import { checkAndCreateMatch } from '@/lib/matching';

export default function ProfileDetail() {
  const profileId = window.location.pathname.split('/').pop();
  const { lang, t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => db.entities.Profile.filter({ id: profileId }),
    enabled: !!profileId,
  });

  // আমার নিজের প্রোফাইল
  const { data: myProfiles = [] } = useQuery({
    queryKey: ['my-profiles'],
    queryFn: () => db.entities.Profile.list('-created_date', 1),
  });

  const myProfile = myProfiles[0];

  // আমি এই প্রোফাইলে like দিয়েছি কিনা
  const { data: sentLike = [] } = useQuery({
    queryKey: ['like-check', myProfile?.id, profileId],
    queryFn: () => db.entities.Like.filter({ from_profile_id: myProfile.id, to_profile_id: profileId }),
    enabled: !!myProfile && !!profileId,
  });

  const isLiked = sentLike.some(l => l.status === 'pending' || l.status === 'accepted');
  const isDisliked = sentLike.some(l => l.status === 'rejected');

  // Check if there's a match between these two profiles
  const { data: matchCheck = [] } = useQuery({
    queryKey: ['match-check', myProfile?.id, profileId],
    queryFn: async () => {
      const m1 = await db.entities.Match.filter({ profile_a_id: myProfile.id, profile_b_id: profileId });
      const m2 = await db.entities.Match.filter({ profile_a_id: profileId, profile_b_id: myProfile.id });
      return [...m1, ...m2];
    },
    enabled: !!myProfile && !!profileId,
  });

  const profile = profiles[0];
  const isSelf = myProfile?.id === profileId;
  const isMatched = matchCheck.length > 0;
  const bothPremium = myProfile?.membership === 'premium' && profile?.membership === 'premium';
  const canSeeContact = isMatched || bothPremium;

  const handleLike = async () => {
    if (!myProfile) { toast.error('Dashboard থেকে প্রথমে প্রোফাইল তৈরি করুন'); return; }
    if (isSelf) return;

    if (isLiked) {
      // Dislike — like মুছো
      await db.entities.Like.delete(sentLike[0].id);
      toast.success('Like সরিয়ে নেওয়া হয়েছে');
    } else {
      await db.entities.Like.create({
        from_profile_id: myProfile.id,
        to_profile_id: profileId,
        from_profile_name: myProfile.name_english || myProfile.name_bangla,
        status: 'pending',
      });
      // Check for mutual like → auto-match if the other user already liked me
      const matched = await checkAndCreateMatch(myProfile, profile);
      if (matched) {
        toast.success('🎉 ম্যাচ সফল! উভয়ের বায়োডাটা ghotokbari@gmail.com-এ পাঠানো হয়েছে।');
      } else {
        // Notification পাঠাও opposite user-কে
        await db.entities.Notification.create({
          user_profile_id: profileId,
          type: 'like',
          message_bn: `${myProfile.name_bangla || myProfile.name_english} আপনাকে পছন্দ করেছেন! আপনিও লাইক দিলে ম্যাচ হবে।`,
          message_en: `${myProfile.name_english} liked you! Like them back to match.`,
          related_profile_id: myProfile.id,
          read: false,
        });
        toast.success('❤️ পছন্দ জানানো হয়েছে! প্রতিপক্ষও লাইক দিলে ম্যাচ হবে।');
      }
    }
    queryClient.invalidateQueries({ queryKey: ['like-check', myProfile?.id, profileId] });
    queryClient.invalidateQueries({ queryKey: ['sent-likes', myProfile?.id] });
    queryClient.invalidateQueries({ queryKey: ['match-check', myProfile?.id, profileId] });
    queryClient.invalidateQueries({ queryKey: ['my-notifications', myProfile?.id] });
  };

  const handleDislike = async () => {
    if (!myProfile) { toast.error('Dashboard থেকে প্রথমে প্রোফাইল তৈরি করুন'); return; }
    if (isSelf) return;

    if (isDisliked) {
      // Undo dislike — remove the rejected like record
      const disliked = sentLike.find(l => l.status === 'rejected');
      if (disliked) await db.entities.Like.delete(disliked.id);
      toast.success('Dislike সরানো হয়েছে');
    } else {
      // Remove any existing like first, then mark as rejected (not interested)
      for (const l of sentLike) {
        if (l.status !== 'rejected') await db.entities.Like.delete(l.id);
      }
      await db.entities.Like.create({
        from_profile_id: myProfile.id,
        to_profile_id: profileId,
        from_profile_name: myProfile.name_english || myProfile.name_bangla,
        status: 'rejected',
      });
      toast.success('প্রোফাইলটি পছন্দ নয় হিসেবে চিহ্নিত করা হয়েছে');
    }
    queryClient.invalidateQueries({ queryKey: ['like-check', myProfile?.id, profileId] });
    queryClient.invalidateQueries({ queryKey: ['sent-likes', myProfile?.id] });
    queryClient.invalidateQueries({ queryKey: ['match-check', myProfile?.id, profileId] });
  };

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  const name = lang === 'bn' ? profile.name_bangla : profile.name_english;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/profiles">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </Button>
      </Link>

      <div className="bg-card rounded-2xl border overflow-hidden shadow-sm">
        <div className="md:flex">
          {/* Photo */}
          <div className="md:w-1/3 aspect-square md:aspect-auto bg-muted relative">
            <img src={getProfilePhoto(profile)} alt={name} className="w-full h-full object-cover" />
            {profile.membership === 'premium' && (
              <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground border-0">⭐ Premium</Badge>
            )}
          </div>

          {/* Details */}
          <div className="md:w-2/3 p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display">{name}</h1>
                {profile.name_bangla && profile.name_english && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {lang === 'bn' ? profile.name_english : profile.name_bangla}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <InfoRow icon={Calendar} label={t('age')} value={profile.age} />
              <InfoRow icon={MapPin} label={t('district')} value={`${profile.district}, ${profile.division}`} />
              <InfoRow icon={Briefcase} label={t('occupation')} value={profile.occupation || '—'} />
              <InfoRow icon={BookOpen} label={t('religion')} value={t(profile.religion)} />
              <InfoRow icon={Heart} label={t('marital_status')} value={t(profile.marital_status)} />
              <InfoRow icon={User} label={t('gender')} value={t(profile.gender)} />
            </div>

            {profile.bio && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">{t('bio')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Match badge */}
            {isMatched && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-500 fill-green-500" />
                <p className="text-sm font-semibold text-green-700">🎉 ম্যাচ সফল! আপনারা একে অপরকে পছন্দ করেছেন।</p>
              </div>
            )}

            {/* Contact info: visible if both premium OR matched */}
            {canSeeContact ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 space-y-2">
                <p className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-1">
                  {bothPremium && !isMatched ? <Sparkles className="w-4 h-4" /> : <Heart className="w-4 h-4 fill-green-500 text-green-500" />}
                  {bothPremium && !isMatched ? 'Premium সুবিধা — যোগাযোগের তথ্য' : 'যোগাযোগের তথ্য (ম্যাচ সফল)'}
                </p>
                <p className="text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {profile.mobile || '—'}</p>
                <p className="text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {profile.email || '—'}</p>
                {profile.full_address && <p className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> {profile.full_address}</p>}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3 mb-5">
                <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t('contact_info')}</p>
                  <p className="text-xs text-muted-foreground">{t('premium_only')} — উভয়ের প্রিমিয়াম মেম্বারশিপ বা ম্যাচ সফল হলে দেখা যাবে।</p>
                </div>
              </div>
            )}

            {/* Like / Dislike buttons */}
            {!isSelf && myProfile?.status === 'approved' && (
              <div className="flex gap-3">
                <Button
                  onClick={handleLike}
                  className={`flex-1 gap-2 ${isLiked ? 'bg-primary/80 hover:bg-primary/90' : 'bg-primary hover:bg-primary/90'}`}
                  size="lg"
                >
                  <ThumbsUp className="w-5 h-5" /> {isLiked ? 'Liked করেছেন' : 'Like করুন ❤️'}
                </Button>
                <Button
                  onClick={handleDislike}
                  variant={isDisliked ? 'destructive' : 'outline'}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <ThumbsDown className="w-5 h-5" /> {isDisliked ? 'Disliked করেছেন' : 'Dislike করুন'}
                </Button>
              </div>
            )}

            {isSelf && (
              <p className="text-xs text-muted-foreground text-center">এটি আপনার নিজের প্রোফাইল</p>
            )}
            {!myProfile && (
              <Link to="/dashboard">
                <Button variant="outline" className="w-full gap-2">
                  <User className="w-4 h-4" /> প্রোফাইল তৈরি করে Like দিন
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
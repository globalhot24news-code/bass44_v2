const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RegistrationForm from '@/components/dashboard/RegistrationForm';
import { Heart, Check, X, ThumbsUp, ThumbsDown, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { acceptLikeAndMatch, rejectLike } from '@/lib/matching';
import { getProfilePhoto } from '@/lib/profileHelpers';

export default function Dashboard() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: myProfiles = [], isLoading } = useQuery({
    queryKey: ['my-profiles'],
    queryFn: () => db.entities.Profile.list('-created_date', 1),
  });

  const myProfile = myProfiles[0];
  const refetchProfiles = () => queryClient.invalidateQueries({ queryKey: ['my-profiles'] });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Heart className="w-7 h-7 text-primary fill-primary" />
          <h1 className="text-2xl md:text-3xl font-bold font-display">বায়োডাটা রেজিস্ট্রেশন</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          বাংলাদেশের সবচেয়ে বিশ্বস্ত ম্যাট্রিমনিয়াল প্ল্যাটফর্মে আপনার বায়োডাটা রেজিস্টার করুন
        </p>
      </div>

      {!myProfile && !isLoading ? (
        <RegistrationForm onSaved={refetchProfiles} />
      ) : myProfile?.status === 'pending' ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 mb-3">{t('pending')}</Badge>
            <p className="text-muted-foreground">{t('profile_pending')}</p>
          </CardContent>
        </Card>
      ) : myProfile?.status === 'rejected' ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Badge variant="destructive" className="mb-3">{t('rejected')}</Badge>
            <p className="text-muted-foreground">{t('profile_rejected')}</p>
            {myProfile.rejection_reason && <p className="text-sm text-destructive mt-2">{myProfile.rejection_reason}</p>}
          </CardContent>
        </Card>
      ) : myProfile?.status === 'approved' ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="py-8 text-center">
              <Badge className="bg-green-500 text-white border-0 mb-3">✓ অনুমোদিত</Badge>
              <p className="text-muted-foreground">আপনার বায়োডাটা ইতিমধ্যে রেজিস্টার করা আছে ও অনুমোদিত।</p>
            </CardContent>
          </Card>
          <LikesSection myProfile={myProfile} />
        </div>
      ) : (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function LikesSection({ myProfile }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(null);

  const { data: receivedLikes = [] } = useQuery({
    queryKey: ['received-likes', myProfile.id],
    queryFn: () => db.entities.Like.filter({ to_profile_id: myProfile.id }),
  });

  const { data: sentLikes = [] } = useQuery({
    queryKey: ['sent-likes', myProfile.id],
    queryFn: () => db.entities.Like.filter({ from_profile_id: myProfile.id }),
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['all-profiles-for-likes'],
    queryFn: () => db.entities.Profile.list('-created_date', 500),
  });

  const profileMap = {};
  allProfiles.forEach(p => { profileMap[p.id] = p; });

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications', myProfile.id],
    queryFn: () => db.entities.Notification.filter({ user_profile_id: myProfile.id }),
  });
  const unreadNotifications = notifications.filter(n => !n.read);

  const markRead = async (id) => {
    await db.entities.Notification.update(id, { read: true });
    queryClient.invalidateQueries({ queryKey: ['my-notifications', myProfile.id] });
  };

  const handleAccept = async (like) => {
    setProcessing(like.id);
    const fromProfile = profileMap[like.from_profile_id];
    if (!fromProfile) { toast.error('প্রোফাইল পাওয়া যায়নি'); setProcessing(null); return; }
    try {
      await acceptLikeAndMatch(like, fromProfile, myProfile);
      toast.success('🎉 ম্যাচ সফল! ইমেইল পাঠানো হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['received-likes', myProfile.id] });
      queryClient.invalidateQueries({ queryKey: ['sent-likes', myProfile.id] });
      queryClient.invalidateQueries({ queryKey: ['my-notifications', myProfile.id] });
    } catch (e) { toast.error('ত্রুটি হয়েছে'); }
    setProcessing(null);
  };

  const handleReject = async (like) => {
    setProcessing(like.id);
    const fromProfile = profileMap[like.from_profile_id];
    try {
      await rejectLike(like, fromProfile, myProfile);
      toast.success('রিজেক্ট করা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['received-likes', myProfile.id] });
    } catch (e) { toast.error('ত্রুটি'); }
    setProcessing(null);
  };

  const pendingReceived = receivedLikes.filter(l => l.status === 'pending');
  const matchedReceived = receivedLikes.filter(l => l.status === 'accepted');

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {unreadNotifications.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> নোটিফিকেশন ({unreadNotifications.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {unreadNotifications.slice(0, 5).map(n => (
              <div key={n.id} className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg p-2">
                <span>{n.message_bn || n.message_en}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6 ml-auto shrink-0" onClick={() => markRead(n.id)}><Check className="w-3 h-3" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Received likes — pending */}
      {pendingReceived.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="w-4 h-4 text-primary fill-primary" /> প্রাপ্ত লাইক ({pendingReceived.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pendingReceived.map(like => {
              const fromP = profileMap[like.from_profile_id];
              return (
                <div key={like.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                  {fromP && <img src={getProfilePhoto(fromP)} alt="" className="w-10 h-10 rounded-full object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{like.from_profile_name || fromP?.name_english}</p>
                    {fromP && <p className="text-xs text-muted-foreground">{fromP.age}, {fromP.district}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="h-8 gap-1 bg-green-500 hover:bg-green-600" disabled={processing === like.id} onClick={() => handleAccept(like)}>
                      <Check className="w-3.5 h-3.5" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive" disabled={processing === like.id} onClick={() => handleReject(like)}>
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Matched */}
      {matchedReceived.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="w-4 h-4 text-green-500 fill-green-500" /> ম্যাচড ({matchedReceived.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {matchedReceived.map(like => {
              const fromP = profileMap[like.from_profile_id];
              return (
                <div key={like.id} className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
                  {fromP && <img src={getProfilePhoto(fromP)} alt="" className="w-10 h-10 rounded-full object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{like.from_profile_name || fromP?.name_english}</p>
                    {fromP && <p className="text-xs text-muted-foreground">📞 {fromP.mobile || 'N/A'} • 📧 {fromP.email || 'N/A'}</p>}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Sent likes */}
      {sentLikes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-primary" /> প্রেরিত লাইক ({sentLikes.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sentLikes.map(like => {
              const toP = profileMap[like.to_profile_id];
              return (
                <div key={like.id} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  {toP && <img src={getProfilePhoto(toP)} alt="" className="w-10 h-10 rounded-full object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{toP?.name_english || 'Unknown'}</p>
                  </div>
                  {like.status === 'pending' && <Badge variant="outline" className="text-[10px] text-yellow-600 border-yellow-300">Pending</Badge>}
                  {like.status === 'accepted' && <Badge className="bg-green-500 text-white border-0 text-[10px]">Accepted</Badge>}
                  {like.status === 'rejected' && <Badge variant="destructive" className="text-[10px]">Rejected</Badge>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
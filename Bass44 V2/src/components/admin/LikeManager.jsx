const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { acceptLikeAndMatch, rejectLike } from '@/lib/matching';
import { getProfilePhoto } from '@/lib/profileHelpers';

export default function LikeManager() {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(null);

  const { data: likes = [] } = useQuery({
    queryKey: ['admin-all-likes'],
    queryFn: () => db.entities.Like.list('-created_date', 500),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-all-profiles-for-likes'],
    queryFn: () => db.entities.Profile.list('-created_date', 500),
  });

  const profileMap = {};
  profiles.forEach(p => { profileMap[p.id] = p; });

  const handleAccept = async (like) => {
    setProcessing(like.id);
    const fromProfile = profileMap[like.from_profile_id];
    const toProfile = profileMap[like.to_profile_id];
    if (!fromProfile || !toProfile) { toast.error('প্রোফাইল পাওয়া যায়নি'); setProcessing(null); return; }
    try {
      await acceptLikeAndMatch(like, fromProfile, toProfile);
      toast.success('ম্যাচ সফল! ইমেইল পাঠানো হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['admin-all-likes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-matches'] });
    } catch (e) { toast.error('ত্রুটি হয়েছে'); }
    setProcessing(null);
  };

  const handleReject = async (like) => {
    setProcessing(like.id);
    const fromProfile = profileMap[like.from_profile_id];
    const toProfile = profileMap[like.to_profile_id];
    try {
      await rejectLike(like, fromProfile, toProfile);
      toast.success('রিজেক্ট করা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['admin-all-likes'] });
    } catch (e) { toast.error('ত্রুটি হয়েছে'); }
    setProcessing(null);
  };

  const statusBadge = (status) => {
    if (status === 'accepted') return <Badge className="bg-green-500 text-white border-0 text-[10px]">Accepted</Badge>;
    if (status === 'rejected') return <Badge variant="destructive" className="text-[10px]">Rejected</Badge>;
    return <Badge variant="outline" className="text-[10px] text-yellow-600 border-yellow-300">Pending</Badge>;
  };

  return (
    <div className="space-y-2">
      {likes.length === 0 && <p className="text-center py-8 text-muted-foreground">কোন লাইক নেই</p>}
      {likes.map(like => {
        const fromP = profileMap[like.from_profile_id];
        const toP = profileMap[like.to_profile_id];
        return (
          <Card key={like.id}>
            <CardContent className="py-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  {fromP && <img src={getProfilePhoto(fromP)} alt="" className="w-8 h-8 rounded-full object-cover" />}
                  <span className="text-sm font-medium">{like.from_profile_name || fromP?.name_english || '—'}</span>
                </div>
                <Heart className="w-4 h-4 text-primary fill-primary" />
                <div className="flex items-center gap-2">
                  {toP && <img src={getProfilePhoto(toP)} alt="" className="w-8 h-8 rounded-full object-cover" />}
                  <span className="text-sm font-medium">{toP?.name_english || '—'}</span>
                </div>
                {statusBadge(like.status)}
                <div className="flex-1" />
                {like.status === 'pending' && (
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" disabled={processing === like.id} onClick={() => handleAccept(like)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" disabled={processing === like.id} onClick={() => handleReject(like)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
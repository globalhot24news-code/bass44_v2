const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, FileText, Heart, Clock, Check, Shield, Download, Globe, ThumbsUp, Settings } from 'lucide-react';
import { toast } from 'sonner';
import ProfileManager from '@/components/admin/ProfileManager';
import ServiceManager from '@/components/admin/ServiceManager';
import CountryPartnerManager from '@/components/admin/CountryPartnerManager';
import LikeManager from '@/components/admin/LikeManager';
import MatchTable from '@/components/admin/MatchTable';
import AdvertisementManager from '@/components/admin/AdvertisementManager';
import { getAdminEmail, setAdminEmail } from '@/lib/profileHelpers';

export default function Admin() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [adminEmailVal, setAdminEmailVal] = useState(getAdminEmail());

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: () => db.entities.Profile.list('-created_date', 500),
    enabled: authenticated,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => db.entities.Service.list('-created_date', 500),
    enabled: authenticated,
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: () => db.entities.Match.list('-created_date', 500),
    enabled: authenticated,
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['admin-all-likes'],
    queryFn: () => db.entities.Like.list('-created_date', 500),
    enabled: authenticated,
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['admin-country-partners'],
    queryFn: () => db.entities.CountryPartner.list('-created_date', 200),
    enabled: authenticated,
  });

  const { data: ads = [] } = useQuery({
    queryKey: ['admin-advertisements'],
    queryFn: () => db.entities.Advertisement.list('-created_date', 50),
    enabled: authenticated,
  });

  if (!authenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Shield className="w-10 h-10 mx-auto text-primary mb-2" />
            <CardTitle className="font-display">{t('admin_panel')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin Password"
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (adminKey === 'ghotokbari2024') setAuthenticated(true);
                  else toast.error('Invalid password');
                }
              }}
            />
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 flex items-start gap-2">
              <span className="text-base leading-none mt-0.5">🔑</span>
              <div>
                <p className="font-semibold">Temporary Password:</p>
                <p className="font-mono tracking-widest mt-0.5">ghotokbari2024</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => { if (adminKey === 'ghotokbari2024') setAuthenticated(true); else toast.error('Invalid password'); }}>
              {t('login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingProfiles = profiles.filter(p => p.status === 'pending');
  const pendingServices = services.filter(s => s.status === 'pending');
  const pendingLikes = likes.filter(l => l.status === 'pending');

  const exportCSV = () => {
    const headers = ['Name (EN)', 'Name (BN)', 'Age', 'Gender', 'District', 'Religion', 'Occupation', 'Mobile', 'Email', 'Status', 'Membership'];
    const rows = profiles.map(p => [p.name_english, p.name_bangla, p.age, p.gender, p.district, p.religion, p.occupation, p.mobile, p.email, p.status, p.membership]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const saveAdminEmail = () => {
    setAdminEmail(adminEmailVal);
    toast.success('এডমিন ইমেইল সংরক্ষিত হয়েছে');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-display">{t('admin_panel')}</h1>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: 'মোট ইউজার', value: profiles.length, icon: Users, color: 'text-blue-500' },
          { label: 'পেন্ডিং প্রোফাইল', value: pendingProfiles.length, icon: Clock, color: 'text-yellow-500' },
          { label: 'পেন্ডিং সেবা', value: pendingServices.length, icon: FileText, color: 'text-orange-500' },
          { label: 'ম্যাচ', value: matches.length, icon: Heart, color: 'text-red-500' },
          { label: 'লাইক', value: likes.length, icon: ThumbsUp, color: 'text-pink-500' },
          { label: 'পার্টনার', value: partners.length, icon: Globe, color: 'text-green-500' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending-profiles" className="space-y-4">
        <TabsList className="bg-muted flex-wrap h-auto">
          <TabsTrigger value="pending-profiles" className="text-xs">পেন্ডিং প্রোফাইল ({pendingProfiles.length})</TabsTrigger>
          <TabsTrigger value="all-profiles" className="text-xs">সকল প্রোফাইল ({profiles.length})</TabsTrigger>
          <TabsTrigger value="services" className="text-xs">সেবা ({services.length})</TabsTrigger>
          <TabsTrigger value="country-partners" className="text-xs">কান্ট্রি পার্টনার ({partners.length})</TabsTrigger>
          <TabsTrigger value="likes" className="text-xs">লাইক ({pendingLikes.length})</TabsTrigger>
          <TabsTrigger value="matches" className="text-xs">ম্যাচ ({matches.length})</TabsTrigger>
          <TabsTrigger value="advertisements" className="text-xs">বিজ্ঞাপন ({ads.filter(a => a.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">সেটিংস</TabsTrigger>
        </TabsList>

        <TabsContent value="pending-profiles"><ProfileManager filterStatus="pending" /></TabsContent>
        <TabsContent value="all-profiles"><ProfileManager /></TabsContent>
        <TabsContent value="services"><ServiceManager /></TabsContent>
        <TabsContent value="country-partners"><CountryPartnerManager /></TabsContent>
        <TabsContent value="likes"><LikeManager /></TabsContent>
        <TabsContent value="matches"><MatchTable matches={matches} /></TabsContent>
        <TabsContent value="advertisements"><AdvertisementManager /></TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle className="text-base">এডমিন সেটিংস</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>এডমিন ইমেইল (ম্যাচ নোটিফিকেশন পাবেন)</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={adminEmailVal} onChange={e => setAdminEmailVal(e.target.value)} placeholder="admin@email.com" />
                  <Button onClick={saveAdminEmail} className="gap-2"><Settings className="w-4 h-4" /> সংরক্ষণ</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">ম্যাচ সফল হলে এই ইমেইলে উভয় মেম্বারের পূর্ণ বায়োডাটা পাঠানো হবে।</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
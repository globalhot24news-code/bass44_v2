const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { useQuery } from '@tanstack/react-query';
import ProfileCard from '@/components/profiles/ProfileCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { divisions, districtsByDivision } from '@/lib/bangladeshData';

export default function Profiles() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    gender: 'all', religion: 'all', division: 'all', district: 'all',
    maritalStatus: 'all', search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => db.entities.Profile.filter({ status: 'approved' }, '-created_date', 100),
  });

  const filtered = profiles.filter(p => {
    if (filters.gender !== 'all' && p.gender !== filters.gender) return false;
    if (filters.religion !== 'all' && p.religion !== filters.religion) return false;
    if (filters.division !== 'all' && p.division !== filters.division) return false;
    if (filters.district !== 'all' && p.district !== filters.district) return false;
    if (filters.maritalStatus !== 'all' && p.marital_status !== filters.maritalStatus) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      return (p.name_bangla?.toLowerCase().includes(s) ||
        p.name_english?.toLowerCase().includes(s) ||
        p.district?.toLowerCase().includes(s) ||
        p.occupation?.toLowerCase().includes(s));
    }
    return true;
  });

  const districts = filters.division !== 'all' ? districtsByDivision[filters.division] || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-display">{t('profiles')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('browse_profiles')}</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('search') + '...'}
              className="pl-10"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{t('filter')}</span>
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-muted/50 rounded-xl">
            <Select value={filters.gender} onValueChange={v => setFilters({ ...filters, gender: v })}>
              <SelectTrigger className="text-xs"><SelectValue placeholder={t('gender')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="male">{t('male')}</SelectItem>
                <SelectItem value="female">{t('female')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.religion} onValueChange={v => setFilters({ ...filters, religion: v })}>
              <SelectTrigger className="text-xs"><SelectValue placeholder={t('religion')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                {['Islam', 'Hindu', 'Christian', 'Buddhist', 'Other'].map(r => (
                  <SelectItem key={r} value={r}>{t(r)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.maritalStatus} onValueChange={v => setFilters({ ...filters, maritalStatus: v })}>
              <SelectTrigger className="text-xs"><SelectValue placeholder={t('marital_status')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="never_married">{t('never_married')}</SelectItem>
                <SelectItem value="divorced">{t('divorced')}</SelectItem>
                <SelectItem value="widowed">{t('widowed')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.division} onValueChange={v => setFilters({ ...filters, division: v, district: 'all' })}>
              <SelectTrigger className="text-xs"><SelectValue placeholder={t('division')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                {divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            {districts.length > 0 && (
              <Select value={filters.district} onValueChange={v => setFilters({ ...filters, district: v })}>
                <SelectTrigger className="text-xs"><SelectValue placeholder={t('district')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((profile, i) => (
            <ProfileCard key={profile.id} profile={profile} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">{t('no_results')}</p>
        </div>
      )}
    </div>
  );
}
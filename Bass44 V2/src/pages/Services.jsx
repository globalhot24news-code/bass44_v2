const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { useQuery } from '@tanstack/react-query';
import ServiceCard from '@/components/services/ServiceCard';
import AdBox from '@/components/services/AdBox';
import { serviceCategories } from '@/lib/bangladeshData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const [activeCategory, setActiveCategory] = useState(urlParams.get('category') || 'all');
  const [search, setSearch] = useState('');

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => db.entities.Service.filter({ status: 'approved' }, '-created_date', 200),
  });

  const { data: ads = [] } = useQuery({
    queryKey: ['active-advertisements'],
    queryFn: () => db.entities.Advertisement.filter({ status: 'active' }, '-created_date', 4),
  });

  const adSlots = [0, 1, 2, 3].map(i => ads[i] || null);

  const filtered = services.filter(s => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.business_name?.toLowerCase().includes(q) ||
        s.district?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">{t('wedding_services')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('all_services')}</p>
        </div>
        <Link to="/submit-service">
          <Button className="gap-2 shrink-0"><Plus className="w-4 h-4" /> আপনার ব্যবসা যোগ করুন</Button>
        </Link>
      </div>

      {/* Advertisement Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {adSlots.map((ad, i) => <AdBox key={i} ad={ad} />)}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('search') + '...'}
          className="pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('all')}
          className="shrink-0 rounded-full text-xs"
        >
          {t('all')}
        </Button>
        {serviceCategories.map(cat => (
          <Button
            key={cat.value}
            variant={activeCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.value)}
            className="shrink-0 rounded-full text-xs gap-1"
          >
            <span>{cat.icon}</span>
            {t(cat.value)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl animate-pulse aspect-[4/3]" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
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
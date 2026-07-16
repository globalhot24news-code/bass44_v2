const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfileCard from '@/components/profiles/ProfileCard';
import { Heart, Users, Shield, Star, ArrowRight, Search } from 'lucide-react';
import { serviceCategories } from '@/lib/bangladeshData';
import { motion } from 'framer-motion';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');

  const { data: profiles = [] } = useQuery({
    queryKey: ['featured-profiles'],
    queryFn: () => db.entities.Profile.filter({ status: 'approved' }, '-created_date', 6),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <Heart className="w-4 h-4 fill-secondary text-secondary" />
              <span className="font-display">ঘটকবাড়ি.কম</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-4">
              {t('hero_title')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 font-display">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/profiles">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold rounded-xl shadow-lg">
                  <Search className="w-4 h-4 mr-2" />
                  {t('browse_profiles')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto">
            <path fill="hsl(var(--background))" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {[
            { icon: Users, label: t('trusted_platform'), value: '১০০০+' },
            { icon: Heart, label: t('total_matches'), value: '৫০০+' },
            { icon: Shield, label: t('all_services'), value: '১৫ ক্যাটাগরি' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card rounded-xl border shadow-sm p-4 md:p-6 text-center"
            >
              <stat.icon className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-xl md:text-2xl font-bold font-display text-primary">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Profiles */}
      {profiles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display">{t('featured_profiles')}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t('find_partner')}</p>
            </div>
            <Link to="/profiles">
              <Button variant="ghost" className="text-primary gap-1">
                {t('view_all')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {profiles.slice(0, 4).map((profile, i) => (
              <ProfileCard key={profile.id} profile={profile} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Service Categories */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display">{t('wedding_services')}</h2>
              <p className="text-muted-foreground text-sm mt-1">One-stop wedding solutions</p>
            </div>
            <Link to="/services">
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90 rounded-xl font-semibold gap-1">
                {t('all_services')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Service Search Box */}
          <div className="flex gap-2 mb-8 max-w-lg">
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="flex-1 bg-white rounded-xl border-2 border-primary/20 focus:border-primary h-11">
                <SelectValue placeholder="সেবা বেছে নিন..." />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="mr-2">{cat.icon}</span> {t(cat.value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="rounded-xl px-5 h-11"
              onClick={() => selectedService && navigate(`/services?category=${selectedService}`)}
            >
              <Search className="w-4 h-4 mr-1" /> অনুসন্ধান
            </Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
            {serviceCategories.map((cat, i) => (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/services?category=${cat.value}`}
                  className="flex flex-col items-center gap-2 p-4 md:p-6 bg-card rounded-xl border hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                >
                  <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs md:text-sm font-medium text-center leading-tight">{t(cat.value)}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
          <div className="relative">
            <Star className="w-10 h-10 mx-auto mb-4 text-secondary" />
            <h3 className="text-2xl md:text-3xl font-bold font-display mb-3">{t('create_profile')}</h3>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              আজই আপনার প্রোফাইল তৈরি করুন এবং আপনার জীবনসঙ্গী খুঁজে নিন
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl font-semibold">
                {t('create_profile')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
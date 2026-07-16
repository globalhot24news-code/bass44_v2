const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProfilePhoto } from '@/lib/profileHelpers';

export default function ProfileCard({ profile, onLike, isLiked, isMatched, index = 0 }) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const name = lang === 'bn' ? profile.name_bangla : profile.name_english;

  const handleViewProfile = async (e) => {
    e.preventDefault();
    const isLoggedIn = await db.auth.isAuthenticated();
    if (isLoggedIn) {
      navigate(`/profiles/${profile.id}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Photo */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={getProfilePhoto(profile)}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {profile.membership === 'premium' && (
          <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground border-0 text-[10px] font-semibold">
            ⭐ {t('premium')}
          </Badge>
        )}
        {isMatched && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0 text-[10px]">
            {t('matched')}
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-base font-display truncate">{name || profile.name_english}</h3>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{profile.district}</span>
            <span className="text-border">•</span>
            <span>{t('age')}: {profile.age}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="w-3 h-3 shrink-0" />
            <span className="truncate">{profile.occupation || '—'}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap mt-2">
            <Badge variant="outline" className="text-[10px] font-normal">{t(profile.religion)}</Badge>
            <Badge variant="outline" className="text-[10px] font-normal">{t(profile.marital_status)}</Badge>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleViewProfile}>
            {t('view_profile')}
          </Button>
          {onLike && (
            <Button
              size="sm"
              variant={isLiked ? "default" : "outline"}
              className={`px-3 ${isLiked ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => onLike(profile.id)}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
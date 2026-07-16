const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Clock, MessageCircle } from 'lucide-react';

export default function CountryPartners() {
  const { t } = useLanguage();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['country-partners'],
    queryFn: () => db.entities.CountryPartner.list('-created_date', 200),
  });

  const activePartners = partners.filter(p => p.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Globe className="w-7 h-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold font-display">কান্ট্রি পার্টনার</h1>
        </div>
        <p className="text-sm text-muted-foreground">বিদেশে অবস্থানরত আমাদের বিশ্বস্ত পার্টনারদের সাথে যোগাযোগ করুন</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : activePartners.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">কোন কান্ট্রি পার্টনার নেই</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePartners.map(p => (
            <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/10" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-4xl">{p.flag_emoji || '🌍'}</div>
                  )}
                  <span className="absolute -bottom-1 -right-1 text-3xl">{p.flag_emoji}</span>
                </div>
                <h3 className="font-bold text-lg font-display">{p.name}</h3>
                <Badge variant="outline" className="mt-1 mb-3 text-xs gap-1">
                  <span>{p.flag_emoji}</span> {p.country}
                </Badge>
                {p.available_time && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{p.available_time}</span>
                  </div>
                )}
                <a href={`https://wa.me/${p.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp: {p.whatsapp_number}
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
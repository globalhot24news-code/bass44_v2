const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Phone, User, Globe } from 'lucide-react';

export default function ServiceDetail() {
  const serviceId = window.location.pathname.split('/').pop();
  const { t } = useLanguage();

  const { data: services = [] } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => db.entities.Service.filter({ id: serviceId }),
    enabled: !!serviceId,
  });

  const service = services[0];

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/services">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </Button>
      </Link>

      <div className="bg-card rounded-2xl border overflow-hidden shadow-sm">
        {/* Images */}
        {service.images?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-96 overflow-hidden">
            {service.images.slice(0, 4).map((img, i) => (
              <img key={i} src={img} alt="" className={`w-full object-cover ${i === 0 && service.images.length === 1 ? 'col-span-full h-80' : 'h-48'}`} />
            ))}
          </div>
        )}

        <div className="p-6 md:p-8">
          <Badge className="bg-primary/10 text-primary border-0 mb-3">{t(service.category)}</Badge>
          <h1 className="text-2xl md:text-3xl font-bold font-display mb-4">{service.business_name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4 text-primary" />
              {service.contact_person}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4 text-primary" />
              {service.mobile}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              {service.upazila ? `${service.upazila}, ` : ''}{service.district}, {service.division}
            </div>
            {service.website_link && (
              <a href={service.website_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Globe className="w-4 h-4" />
                {t('website')}
              </a>
            )}
          </div>

          {service.description && (
            <div>
              <h3 className="font-semibold mb-2">{t('description')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
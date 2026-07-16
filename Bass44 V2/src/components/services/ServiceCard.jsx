import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ServiceCard({ service, index = 0 }) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/services/${service.id}`}
        className="block bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
      >
        <div className="aspect-video bg-muted overflow-hidden">
          {service.images?.[0] ? (
            <img
              src={service.images[0]}
              alt={service.business_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {getCategoryIcon(service.category)}
            </div>
          )}
        </div>
        <div className="p-4">
          <Badge className="bg-primary/10 text-primary border-0 text-[10px] mb-2">
            {t(service.category)}
          </Badge>
          <h3 className="font-semibold text-sm truncate">{service.business_name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
            <MapPin className="w-3 h-3" />
            <span>{service.district}, {service.division}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Phone className="w-3 h-3" />
            <span>{service.mobile}</span>
          </div>
          {service.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{service.description}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function getCategoryIcon(category) {
  const icons = {
    catering: '🍽️', makeup_artist: '💄', cosmetics: '✨', kazi_office: '📜',
    saree_shop: '👗', jewelry: '💍', photography: '📸', videography: '🎥',
    event_management: '🎪', decoration: '🎊', flower_shop: '💐', car_rental: '🚗',
    wedding_cards: '💌', salon: '💇', gift_shop: '🎁'
  };
  return icons[category] || '🎉';
}
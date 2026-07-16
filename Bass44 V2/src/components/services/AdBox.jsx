import React from 'react';
import { Megaphone } from 'lucide-react';

export default function AdBox({ ad }) {
  if (!ad) {
    return (
      <div className="relative rounded-xl border-2 border-dashed border-border bg-muted/30 aspect-[4/3] flex flex-col items-center justify-center text-center p-3">
        <Megaphone className="w-6 h-6 text-muted-foreground/50 mb-1" />
        <p className="text-[10px] text-muted-foreground/60">বিজ্ঞাপনের জন্য যোগাযোগ করুন</p>
      </div>
    );
  }

  return (
    <a
      href={ad.link_url || '#'}
      target={ad.link_url ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="group relative block rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow aspect-[4/3]"
    >
      {ad.image_url ? (
        <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <Megaphone className="w-8 h-8 text-primary/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <span className="inline-block text-[9px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-bold mb-1">বিজ্ঞাপন</span>
        <p className="font-semibold text-sm leading-tight line-clamp-2">{ad.title}</p>
        {ad.description && <p className="text-[10px] opacity-90 line-clamp-1 mt-0.5">{ad.description}</p>}
      </div>
    </a>
  );
}
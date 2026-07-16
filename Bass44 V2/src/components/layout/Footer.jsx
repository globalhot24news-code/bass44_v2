import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-6 h-6 text-primary fill-primary" />
              <span className="text-xl font-bold font-display">ঘটকবাড়ি.কম</span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed">
              বাংলাদেশের সবচেয়ে বিশ্বস্ত ম্যাট্রিমনিয়াল ও বিবাহ সেবা প্ল্যাটফর্ম।
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-secondary">লিঙ্ক</h4>
            <div className="space-y-2 text-sm text-background/60">
              <Link to="/profiles" className="block hover:text-background transition-colors">{t('profiles')}</Link>
              <Link to="/services" className="block hover:text-background transition-colors">{t('services')}</Link>
              <Link to="/submit-service" className="block hover:text-background transition-colors">{t('submit_service')}</Link>
              <Link to="/dashboard" className="block hover:text-background transition-colors">{t('dashboard')}</Link>
              <Link to="/register" className="block hover:text-background transition-colors">নিবন্ধন করুন</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-secondary">যোগাযোগ</h4>
            <div className="space-y-2 text-sm text-background/60">
              <p>ghotokbari@gmail.com</p>
              <p>ঢাকা, বাংলাদেশ</p>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 mt-8 pt-6 text-center text-sm text-background/40">
          © {new Date().getFullYear()} ঘটকবাড়ি.কম — সর্বস্বত্ব সংরক্ষিত
        </div>
      </div>
    </footer>
  );
}
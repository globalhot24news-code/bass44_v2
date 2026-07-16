const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Heart, Globe, LogIn, UserPlus } from 'lucide-react';

import { useEffect, useState as useStateAuth } from 'react';

export default function Navbar() {
  const { lang, toggleLang, t } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useStateAuth(false);

  useEffect(() => {
    db.auth.isAuthenticated().then(setIsLoggedIn);
  }, [location.pathname]);

  const links = [
    { to: '/', label: t('home') },
    { to: '/profiles', label: t('profiles') },
    { to: '/services', label: t('services') },
    { to: '/country-partners', label: 'পার্টনার' },
    { to: '/dashboard', label: 'রেজিস্ট্রেশন' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Heart className="w-7 h-7 text-primary fill-primary" />
            <div className="leading-tight">
              <span className="text-lg font-bold font-display text-primary tracking-tight">ঘটকবাড়ি</span>
              <span className="text-[10px] block text-muted-foreground -mt-1">GhotokBari.com</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/20 text-sm font-medium text-secondary-foreground hover:bg-secondary/30 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>

            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex text-xs gap-1.5"
                onClick={() => { db.auth.logout(); window.location.href = '/'; }}
              >
                {t('logout')}
              </Button>
            ) : (
              <Link to="/login" className="hidden sm:block">
                <Button size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground">
                  <LogIn className="w-3.5 h-3.5" />
                  {t('login')} / {t('register')}
                </Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary fill-primary" />
                      <span className="font-bold font-display text-primary">ঘটকবাড়ি</span>
                    </div>
                  </div>
                  <div className="flex flex-col p-4 gap-1">
                    {links.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive(link.to)
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground/70 hover:bg-muted'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      to="/submit-service"
                      onClick={() => setOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted"
                    >
                      {t('submit_service')}
                    </Link>
                    {isLoggedIn ? (
                      <button
                        onClick={() => { db.auth.logout(); window.location.href = '/'; }}
                        className="px-4 py-3 rounded-lg text-sm font-medium text-left text-foreground/70 hover:bg-muted"
                      >
                        {t('logout')}
                      </button>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-muted flex items-center gap-2">
                          <LogIn className="w-4 h-4" /> {t('login')}
                        </Link>
                        <Link to="/register" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted flex items-center gap-2">
                          <UserPlus className="w-4 h-4" /> {t('register')}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Heart, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('ইমেইল ও পাসওয়ার্ড দিন'); return; }
    setLoading(true);
    await db.auth.loginViaEmailPassword(form.email, form.password);
    window.location.href = '/dashboard';
  };

  const handleGoogle = () => {
    db.auth.loginWithProvider('google', '/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Heart className="w-9 h-9 text-primary fill-primary" />
            <div className="text-left leading-tight">
              <p className="text-2xl font-bold font-display text-primary">ঘটকবাড়ি</p>
              <p className="text-xs text-muted-foreground">GhotokBari.com</p>
            </div>
          </Link>
        </div>

        <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="w-full rounded-none border-b bg-muted/50 h-12">
              <TabsTrigger value="user" className="flex-1 gap-2 rounded-none data-[state=active]:bg-card">
                👤 ইউজার লগইন
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex-1 gap-2 rounded-none data-[state=active]:bg-card">
                <Shield className="w-3.5 h-3.5" /> এডমিন লগইন
              </TabsTrigger>
            </TabsList>

            {/* User Login */}
            <TabsContent value="user" className="p-6 space-y-5 mt-0">
              <div className="text-center">
                <h2 className="text-xl font-bold font-display">স্বাগতম!</h2>
                <p className="text-sm text-muted-foreground mt-1">আপনার একাউন্টে লগইন করুন</p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogle}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                Google দিয়ে লগইন
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">অথবা</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>ইমেইল</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>পাসওয়ার্ড</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      পাসওয়ার্ড ভুলে গেছেন?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                একাউন্ট নেই?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  নিবন্ধন করুন
                </Link>
              </p>
            </TabsContent>

            {/* Admin Login */}
            <TabsContent value="admin" className="p-6 space-y-5 mt-0">
              <div className="text-center">
                <Shield className="w-10 h-10 mx-auto text-primary mb-2" />
                <h2 className="text-xl font-bold font-display">এডমিন প্যানেল</h2>
                <p className="text-sm text-muted-foreground mt-1">শুধুমাত্র অনুমোদিত এডমিনদের জন্য</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">🔑</span>
                <div>
                  <p className="font-semibold">Temporary Password:</p>
                  <p className="font-mono tracking-widest mt-0.5">ghotokbari2024</p>
                </div>
              </div>
              <Button
                className="w-full gap-2"
                onClick={() => window.location.href = '/admin'}
              >
                <Shield className="w-4 h-4" />
                এডমিন প্যানেলে যান
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
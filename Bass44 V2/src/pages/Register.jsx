const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Heart, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Register() {
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });

  const handleGoogle = () => {
    db.auth.loginWithProvider('google', '/dashboard');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('সকল তথ্য পূরণ করুন'); return; }
    if (form.password.length < 8) { toast.error('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে'); return; }
    if (form.password !== form.confirm) { toast.error('পাসওয়ার্ড মিলছে না'); return; }
    setLoading(true);
    await db.auth.register({ email: form.email, password: form.password });
    setLoading(false);
    setStep(2);
    toast.success('OTP পাঠানো হয়েছে আপনার ইমেইলে');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) { toast.error('OTP দিন'); return; }
    setLoading(true);
    const res = await db.auth.verifyOtp({ email: form.email, otpCode: otp });
    db.auth.setToken(res.access_token);
    window.location.href = '/dashboard';
  };

  const handleResend = async () => {
    await db.auth.resendOtp(form.email);
    toast.success('OTP আবার পাঠানো হয়েছে');
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

        <div className="bg-card rounded-2xl border shadow-lg p-6 space-y-5">
          {step === 1 ? (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold font-display">নতুন একাউন্ট তৈরি করুন</h2>
                <p className="text-sm text-muted-foreground mt-1">বিনামূল্যে নিবন্ধন করুন</p>
              </div>

              <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogle}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                Google দিয়ে নিবন্ধন
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">অথবা</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label>ইমেইল *</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>পাসওয়ার্ড * (কমপক্ষে ৮ অক্ষর)</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>পাসওয়ার্ড নিশ্চিত করুন *</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirm}
                      onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন করুন'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-4xl mb-3">📧</div>
                <h2 className="text-xl font-bold font-display">OTP যাচাই করুন</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">{form.email}</span> এ OTP পাঠানো হয়েছে
                </p>
              </div>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <Label>OTP কোড</Label>
                  <Input
                    type="text"
                    placeholder="6 digit OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'যাচাই হচ্ছে...' : 'যাচাই করুন'}
                </Button>
                <button type="button" onClick={handleResend} className="w-full text-sm text-primary hover:underline">
                  OTP আবার পাঠান
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            একাউন্ট আছে?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
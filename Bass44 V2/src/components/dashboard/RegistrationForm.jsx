const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { divisions, districtsByDivision } from '@/lib/bangladeshData';
import { Save, Upload, CalendarIcon, ArrowRight, ArrowLeft, CheckCircle2, User, MapPin, Image } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { toast } from 'sonner';

const heightOptions = [
  "৪ ফুট ৬ ইঞ্চি","৪ ফুট ৭ ইঞ্চি","৪ ফুট ৮ ইঞ্চি","৪ ফুট ৯ ইঞ্চি","৪ ফুট ১০ ইঞ্চি","৪ ফুট ১১ ইঞ্চি",
  "৫ ফুট","৫ ফুট ১ ইঞ্চি","৫ ফুট ২ ইঞ্চি","৫ ফুট ৩ ইঞ্চি","৫ ফুট ৪ ইঞ্চি","৫ ফুট ৫ ইঞ্চি",
  "৫ ফুট ৬ ইঞ্চি","৫ ফুট ৭ ইঞ্চি","৫ ফুট ৮ ইঞ্চি","৫ ফুট ৯ ইঞ্চি","৫ ফুট ১০ ইঞ্চি","৫ ফুট ১১ ইঞ্চি",
  "৬ ফুট","৬ ফুট ১ ইঞ্চি","৬ ফুট ২ ইঞ্চি","৬ ফুট ৩ ইঞ্চি"
];
const bloodGroups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

const occupationOptions = [
  "ছাত্র/ছাত্রী", "শিক্ষক/শিক্ষিকা", "চিকিৎসক", "প্রকৌশলী", "আইনজীবী",
  "ব্যাংকার", "সরকারি চাকরিজীবী", "বেসরকারি চাকরিজীবী", "ব্যবসায়ী", "কৃষক",
  "আইটি প্রফেশনাল", "নার্স", "সাংবাদিক", "প্রতিরক্ষা বাহিনী", "পুলিশ",
  "কারিগর", "দিনমজুর", "গৃহিণী", "অন্যান্য"
];

const steps = [
  { key: 'personal', label: 'ব্যক্তিগত তথ্য', icon: User },
  { key: 'contact', label: 'ঠিকানা ও যোগাযোগ', icon: MapPin },
  { key: 'photo', label: 'ছবি ও বায়ো', icon: Image },
];

export default function RegistrationForm({ onSaved }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dob, setDob] = useState(null);
  const [form, setForm] = useState({
    name_bangla: '', name_english: '', mobile: '', email: '',
    full_address: '', division: '', district: '', gender: '', age: '',
    occupation: '', religion: '', marital_status: '', height: '', blood_group: '',
    bio: '', photo_url: '',
  });

  const districts = form.division ? districtsByDivision[form.division] || [] : [];
  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('File too large. Max 2MB.'); return; }
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name_english) { toast.error('ইংরেজি নাম আবশ্যক'); return false; }
      if (!form.gender) { toast.error('লিঙ্গ নির্বাচন করুন'); return false; }
      if (!form.age) { toast.error('জন্ম তারিখ নির্বাচন করুন'); return false; }
      if (!form.religion) { toast.error('ধর্ম নির্বাচন করুন'); return false; }
      if (!form.marital_status) { toast.error('বৈবাহিক অবস্থা নির্বাচন করুন'); return false; }
    }
    if (step === 1) {
      if (!form.district) { toast.error('জেলা নির্বাচন করুন'); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, steps.length - 1)); };
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const data = { ...form, age: Number(form.age), status: 'pending', membership: 'free' };
      await db.entities.Profile.create(data);
      toast.success('🎉 রেজিস্ট্রেশন সম্পন্ন! এডমিন অনুমোদনের পর প্রোফাইল দেখা যাবে।');
      onSaved?.();
    } catch (err) {
      toast.error('রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column — all form content */}
      <div className="space-y-8">
        {/* Stepper */}
        <div className="flex items-center justify-between px-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    done ? 'bg-green-500 text-white' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] sm:text-xs text-center font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 -mt-5 ${i < step ? 'bg-green-500' : 'bg-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">{steps[step].label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 0: Personal */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label>{t('name_bangla')}</Label>
                  <Input value={form.name_bangla} onChange={e => update('name_bangla', e.target.value)} placeholder="বাংলায় নাম" className="font-display" />
                </div>
                <div>
                  <Label>{t('name_english')} *</Label>
                  <Input value={form.name_english} onChange={e => update('name_english', e.target.value)} placeholder="English Name" />
                </div>
                <div>
                  <Label>{t('gender')} *</Label>
                  <Select value={form.gender} onValueChange={v => update('gender', v)}>
                    <SelectTrigger><SelectValue placeholder={t('gender')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('male')}</SelectItem>
                      <SelectItem value="female">{t('female')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('age')} * (জন্ম তারিখ)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {dob ? (
                          <span>{format(dob, 'dd/MM/yyyy')} — বয়স: {differenceInYears(new Date(), dob)} বছর</span>
                        ) : (
                          <span className="text-muted-foreground">জন্ম তারিখ বেছে নিন</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={(date) => { setDob(date); if (date) update('age', differenceInYears(new Date(), date)); }}
                        captionLayout="dropdown"
                        fromYear={1950}
                        toYear={new Date().getFullYear() - 18}
                        defaultMonth={dob || new Date(new Date().getFullYear() - 25, 0)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>{t('religion')} *</Label>
                  <Select value={form.religion} onValueChange={v => update('religion', v)}>
                    <SelectTrigger><SelectValue placeholder={t('religion')} /></SelectTrigger>
                    <SelectContent>
                      {['Islam', 'Hindu', 'Christian', 'Buddhist', 'Other'].map(r => (
                        <SelectItem key={r} value={r}>{t(r)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('marital_status')} *</Label>
                  <Select value={form.marital_status} onValueChange={v => update('marital_status', v)}>
                    <SelectTrigger><SelectValue placeholder={t('marital_status')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never_married">{t('never_married')}</SelectItem>
                      <SelectItem value="divorced">{t('divorced')}</SelectItem>
                      <SelectItem value="widowed">{t('widowed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>উচ্চতা</Label>
                  <Select value={form.height} onValueChange={v => update('height', v)}>
                    <SelectTrigger><SelectValue placeholder="উচ্চতা বেছে নিন" /></SelectTrigger>
                    <SelectContent className="max-h-48">
                      {heightOptions.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>রক্তের গ্রুপ</Label>
                  <Select value={form.blood_group} onValueChange={v => update('blood_group', v)}>
                    <SelectTrigger><SelectValue placeholder="গ্রুপ বেছে নিন" /></SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('occupation')}</Label>
                  <Select value={form.occupation} onValueChange={v => update('occupation', v)}>
                    <SelectTrigger><SelectValue placeholder="পেশা বেছে নিন" /></SelectTrigger>
                    <SelectContent className="max-h-48">
                      {occupationOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 1: Contact & Address */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>{t('division')}</Label>
                  <Select value={form.division} onValueChange={v => { update('division', v); update('district', ''); }}>
                    <SelectTrigger><SelectValue placeholder={t('division')} /></SelectTrigger>
                    <SelectContent>
                      {divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('district')} *</Label>
                  <Select value={form.district} onValueChange={v => update('district', v)}>
                    <SelectTrigger><SelectValue placeholder={t('district')} /></SelectTrigger>
                    <SelectContent>
                      {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('full_address')}</Label>
                  <Input value={form.full_address} onChange={e => update('full_address', e.target.value)} placeholder="পূর্ণ ঠিকানা (গোপনীয়)" />
                </div>
                <div>
                  <Label>{t('mobile')}</Label>
                  <Input value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="01XXXXXXXXX" />
                </div>
                <div>
                  <Label>{t('email')}</Label>
                  <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@example.com" />
                </div>
              </div>
            )}

            {/* Step 2: Photo & Bio */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>{t('photo')}</Label>
                  <div className="flex items-center gap-4 mt-1">
                    {form.photo_url && (
                      <img src={form.photo_url} alt="" className="w-24 h-24 rounded-xl object-cover ring-2 ring-primary/20" />
                    )}
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-muted transition-colors">
                      <Upload className="w-4 h-4" />
                      ছবি আপলোড করুন (max 2MB)
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                </div>
                <div>
                  <Label>{t('bio')}</Label>
                  <Textarea value={form.bio} onChange={e => update('bio', e.target.value.slice(0, 300))} placeholder="নিজের সম্পর্কে লিখুন..." maxLength={300} rows={4} />
                  <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/300</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={prev} disabled={step === 0} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> পূর্ববর্তী
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={next} className="gap-1.5">
                  পরবর্তী <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4" />
                  {loading ? t('loading') : 'রেজিস্ট্রেশন সম্পন্ন করুন'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
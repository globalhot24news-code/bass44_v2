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
import { divisions, districtsByDivision } from '@/lib/bangladeshData';
import { Save, Upload, CalendarIcon } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { toast } from 'sonner';

const heightOptions = [
  "৪ ফুট ৬ ইঞ্চি","৪ ফুট ৭ ইঞ্চি","৪ ফুট ৮ ইঞ্চি","৪ ফুট ৯ ইঞ্চি","৪ ফুট ১০ ইঞ্চি","৪ ফুট ১১ ইঞ্চি",
  "৫ ফুট","৫ ফুট ১ ইঞ্চি","৫ ফুট ২ ইঞ্চি","৫ ফুট ৩ ইঞ্চি","৫ ফুট ৪ ইঞ্চি","৫ ফুট ৫ ইঞ্চি",
  "৫ ফুট ৬ ইঞ্চি","৫ ফুট ৭ ইঞ্চি","৫ ফুট ৮ ইঞ্চি","৫ ফুট ৯ ইঞ্চি","৫ ফুট ১০ ইঞ্চি","৫ ফুট ১১ ইঞ্চি",
  "৬ ফুট","৬ ফুট ১ ইঞ্চি","৬ ফুট ২ ইঞ্চি","৬ ফুট ৩ ইঞ্চি"
];
const bloodGroups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

export default function ProfileForm({ existingProfile, onSaved }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name_bangla: existingProfile?.name_bangla || '',
    name_english: existingProfile?.name_english || '',
    mobile: existingProfile?.mobile || '',
    email: existingProfile?.email || '',
    full_address: existingProfile?.full_address || '',
    division: existingProfile?.division || '',
    district: existingProfile?.district || '',
    gender: existingProfile?.gender || '',
    age: existingProfile?.age || '',
    occupation: existingProfile?.occupation || '',
    religion: existingProfile?.religion || '',
    marital_status: existingProfile?.marital_status || '',
    height: existingProfile?.height || '',
    blood_group: existingProfile?.blood_group || '',
    bio: existingProfile?.bio || '',
    photo_url: existingProfile?.photo_url || '',
  });
  const [dob, setDob] = useState(null);

  const districts = form.division ? districtsByDivision[form.division] || [] : [];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max 2MB.');
      return;
    }
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name_english || !form.gender || !form.age || !form.religion || !form.marital_status || !form.district) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    const data = { ...form, age: Number(form.age), status: existingProfile ? existingProfile.status : 'pending', membership: existingProfile?.membership || 'free' };
    if (existingProfile) {
      await db.entities.Profile.update(existingProfile.id, data);
    } else {
      await db.entities.Profile.create(data);
    }
    setLoading(false);
    toast.success(existingProfile ? 'Profile updated!' : 'Profile created!');
    onSaved?.();
  };

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t('name_bangla')}</Label>
          <Input value={form.name_bangla} onChange={e => update('name_bangla', e.target.value)} placeholder="বাংলায় নাম" className="font-display" />
        </div>
        <div>
          <Label>{t('name_english')} *</Label>
          <Input value={form.name_english} onChange={e => update('name_english', e.target.value)} placeholder="English Name" required />
        </div>
        <div>
          <Label>{t('mobile')}</Label>
          <Input value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="01XXXXXXXXX" />
        </div>
        <div>
          <Label>{t('email')}</Label>
          <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@example.com" />
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
                onSelect={(date) => {
                  setDob(date);
                  if (date) update('age', differenceInYears(new Date(), date));
                }}
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
          <Label>{t('occupation')}</Label>
          <Input value={form.occupation} onChange={e => update('occupation', e.target.value)} />
        </div>
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
          <Input value={form.full_address} onChange={e => update('full_address', e.target.value)} placeholder="Full address (private)" />
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
      </div>

      <div>
        <Label>{t('bio')}</Label>
        <Textarea value={form.bio} onChange={e => update('bio', e.target.value.slice(0, 300))} placeholder="নিজের সম্পর্কে লিখুন..." maxLength={300} rows={3} />
        <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/300</p>
      </div>

      <div>
        <Label>{t('photo')}</Label>
        <div className="flex items-center gap-4 mt-1">
          {form.photo_url && (
            <img src={form.photo_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
          )}
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-muted transition-colors">
            <Upload className="w-4 h-4" />
            Upload Photo (max 2MB)
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full md:w-auto gap-2">
        <Save className="w-4 h-4" />
        {loading ? t('loading') : (existingProfile ? t('save') : t('create_profile'))}
      </Button>
    </form>
  );
}
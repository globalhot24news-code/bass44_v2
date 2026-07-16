const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { divisions, districtsByDivision, upazilasByDistrict, serviceCategories } from '@/lib/bangladeshData';
import { Upload, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SubmitService() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    business_name: '', contact_person: '', mobile: '', category: '',
    division: '', district: '', upazila: '', description: '',
    images: [], website_link: ''
  });

  const districts = form.division ? districtsByDivision[form.division] || [] : [];
  const upazilas = form.district ? upazilasByDistrict[form.district] || [] : [];
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (form.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} too large. Max 2MB.`);
        continue;
      }
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, images: [...f.images, file_url] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_name || !form.contact_person || !form.mobile || !form.category || !form.division || !form.district) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    await db.entities.Service.create({ ...form, status: 'pending' });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold font-display mb-2">ধন্যবাদ!</h2>
        <p className="text-muted-foreground">আপনার সেবা জমা দেওয়া হয়েছে। অনুমোদনের পর এটি প্রকাশিত হবে।</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">{t('submit_service')}</CardTitle>
          <p className="text-sm text-muted-foreground">আপনার বিবাহ সেবা তালিকাভুক্ত করুন</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('business_name')} *</Label>
                <Input value={form.business_name} onChange={e => update('business_name', e.target.value)} required />
              </div>
              <div>
                <Label>{t('contact_person')} *</Label>
                <Input value={form.contact_person} onChange={e => update('contact_person', e.target.value)} required />
              </div>
              <div>
                <Label>{t('mobile')} *</Label>
                <Input value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="01XXXXXXXXX" required />
              </div>
              <div>
                <Label>{t('category')} *</Label>
                <Select value={form.category} onValueChange={v => update('category', v)}>
                  <SelectTrigger><SelectValue placeholder={t('category')} /></SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.icon} {t(c.value)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('division')} *</Label>
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
                <Label>{t('upazila')}</Label>
                <Select value={form.upazila} onValueChange={v => update('upazila', v)} disabled={!form.district}>
                  <SelectTrigger><SelectValue placeholder={form.district ? t('upazila') : 'প্রথমে জেলা নির্বাচন করুন'} /></SelectTrigger>
                  <SelectContent>
                    {upazilas.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('website')}</Label>
                <Input value={form.website_link} onChange={e => update('website_link', e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div>
              <Label>{t('description')}</Label>
              <Textarea value={form.description} onChange={e => update('description', e.target.value.slice(0, 500))} rows={3} maxLength={500} />
              <p className="text-xs text-muted-foreground mt-1">{form.description.length}/500</p>
            </div>

            <div>
              <Label>{t('images')} (max 5, 2MB each)</Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img src={img} alt="" className="w-full h-full rounded-lg object-cover" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full text-xs flex items-center justify-center">×</button>
                  </div>
                ))}
                {form.images.length < 5 && (
                  <label className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2">
              <Send className="w-4 h-4" />
              {loading ? t('loading') : t('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
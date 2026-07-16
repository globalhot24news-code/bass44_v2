const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, Check, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { divisions, districtsByDivision, serviceCategories } from '@/lib/bangladeshData';

const emptyForm = {
  business_name: '', contact_person: '', mobile: '', category: '',
  division: '', district: '', upazila: '', description: '', images: [],
  website_link: '', status: 'pending',
};

export default function ServiceManager() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => db.entities.Service.list('-created_date', 500),
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const districts = form.division ? districtsByDivision[form.division] || [] : [];

  const openAdd = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (s) => { setForm({ ...s, images: s.images || [] }); setEditId(s.id); setOpen(true); };

  const handleImage = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - form.images.length);
    for (const file of files) {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      update('images', [...form.images, file_url]);
    }
  };

  const removeImage = (idx) => update('images', form.images.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!form.business_name || !form.contact_person || !form.mobile || !form.category || !form.division || !form.district) {
      toast.error('আবশ্যক ফিল্ড পূরণ করুন'); return;
    }
    setLoading(true);
    try {
      if (editId) {
        await db.entities.Service.update(editId, form);
        toast.success('সেবা আপডেট হয়েছে');
      } else {
        await db.entities.Service.create(form);
        toast.success('সেবা যোগ হয়েছে');
      }
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    } catch (e) { toast.error('ত্রুটি হয়েছে'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await db.entities.Service.delete(id);
    queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    toast.success('মুছে ফেলা হয়েছে');
  };

  const approveService = async (id) => {
    await db.entities.Service.update(id, { status: 'approved' });
    queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    toast.success('অনুমোদিত');
  };

  const rejectService = async (id) => {
    await db.entities.Service.update(id, { status: 'rejected' });
    queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    toast.success('বাতিল করা হয়েছে');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> নতুন সেবা</Button>
      </div>

      {services.length === 0 && <p className="text-center py-8 text-muted-foreground">কোন সেবা নেই</p>}

      <div className="space-y-2">
        {services.map(s => (
          <Card key={s.id}>
            <CardContent className="py-3">
              <div className="flex items-center gap-3 flex-wrap">
                {s.images?.[0] && <img src={s.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{s.business_name}</p>
                  <p className="text-xs text-muted-foreground">{s.category} • {s.district}</p>
                </div>
                <Badge variant={s.status === 'approved' ? 'default' : s.status === 'pending' ? 'outline' : 'destructive'} className="text-[10px]">{s.status}</Badge>
                <div className="flex gap-1">
                  {s.status === 'pending' && (
                    <>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={() => approveService(s.id)}><Check className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => rejectService(s.id)}><X className="w-3.5 h-3.5" /></Button>
                    </>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'সেবা এডিট' : 'নতুন সেবা যোগ'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>ব্যবসার নাম *</Label><Input value={form.business_name} onChange={e => update('business_name', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>যোগাযোগ ব্যক্তি *</Label><Input value={form.contact_person} onChange={e => update('contact_person', e.target.value)} /></div>
              <div><Label>মোবাইল *</Label><Input value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="01XXXXXXXXX" /></div>
            </div>
            <div><Label>ক্যাটাগরি *</Label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger><SelectValue placeholder="ক্যাটাগরি" /></SelectTrigger>
                <SelectContent>{serviceCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.icon} {c.value}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>বিভাগ *</Label>
                <Select value={form.division} onValueChange={v => { update('division', v); update('district', ''); }}>
                  <SelectTrigger><SelectValue placeholder="বিভাগ" /></SelectTrigger>
                  <SelectContent>{divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>জেলা *</Label>
                <Select value={form.district} onValueChange={v => update('district', v)}>
                  <SelectTrigger><SelectValue placeholder="জেলা" /></SelectTrigger>
                  <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>উপজেলা</Label><Input value={form.upazila} onChange={e => update('upazila', e.target.value)} /></div>
            <div><Label>ওয়েবসাইট</Label><Input value={form.website_link} onChange={e => update('website_link', e.target.value)} placeholder="https://..." /></div>
            <div><Label>বিবরণ</Label><Textarea value={form.description} onChange={e => update('description', e.target.value.slice(0, 500))} rows={3} maxLength={500} /></div>
            <div>
              <Label>ছবি (সর্বোচ্চ ৫টি)</Label>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {form.images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 text-xs">×</button>
                  </div>
                ))}
                {form.images.length < 5 && (
                  <label className="cursor-pointer flex items-center justify-center w-14 h-14 border-2 border-dashed rounded-lg hover:bg-muted">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImage} />
                  </label>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'সংরক্ষণ...' : 'সংরক্ষণ'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
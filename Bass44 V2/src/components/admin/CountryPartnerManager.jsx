const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, Upload } from 'lucide-react';
import { toast } from 'sonner';

const countryFlags = {
  'USA': '🇺🇸', 'Canada': '🇨🇦', 'UK': '🇬🇧', 'Australia': '🇦🇺',
  'Italy': '🇮🇹', 'Malaysia': '🇲🇾', 'Saudi Arabia': '🇸🇦', 'UAE': '🇦🇪', 'Other': '🌍'
};

const emptyForm = { name: '', photo_url: '', country: 'USA', flag_emoji: '🇺🇸', whatsapp_number: '', available_time: '', status: 'active' };

export default function CountryPartnerManager() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const { data: partners = [] } = useQuery({
    queryKey: ['admin-country-partners'],
    queryFn: () => db.entities.CountryPartner.list('-created_date', 200),
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    update('photo_url', file_url);
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (p) => { setForm({ ...p }); setEditId(p.id); setOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.country || !form.whatsapp_number) { toast.error('নাম, দেশ ও WhatsApp নম্বর আবশ্যক'); return; }
    setLoading(true);
    const data = { ...form, flag_emoji: countryFlags[form.country] || '🌍' };
    try {
      if (editId) {
        await db.entities.CountryPartner.update(editId, data);
        toast.success('আপডেট হয়েছে');
      } else {
        await db.entities.CountryPartner.create(data);
        toast.success('কান্ট্রি পার্টনার যোগ হয়েছে');
      }
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-country-partners'] });
    } catch (e) { toast.error('ত্রুটি হয়েছে'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await db.entities.CountryPartner.delete(id);
    queryClient.invalidateQueries({ queryKey: ['admin-country-partners'] });
    toast.success('মুছে ফেলা হয়েছে');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> নতুন পার্টনার</Button>
      </div>

      {partners.length === 0 && <p className="text-center py-8 text-muted-foreground">কোন কান্ট্রি পার্টনার নেই</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {partners.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center gap-3">
              {p.photo_url && <img src={p.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.flag_emoji} {p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.country} • {p.whatsapp_number}</p>
                {p.available_time && <p className="text-[10px] text-muted-foreground">{p.available_time}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'পার্টনার এডিট' : 'নতুন কান্ট্রি পার্টনার'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>নাম *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="পার্টনারের নাম" /></div>
            <div><Label>দেশ *</Label>
              <Select value={form.country} onValueChange={v => update('country', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(countryFlags).map(c => <SelectItem key={c} value={c}>{countryFlags[c]} {c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>WhatsApp নম্বর *</Label><Input value={form.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)} placeholder="+1XXXXXXXXXX" /></div>
            <div><Label>এভেলেবল টাইম</Label><Input value={form.available_time} onChange={e => update('available_time', e.target.value)} placeholder="যেমন: ৯AM-৯PM (EST)" /></div>
            <div>
              <Label>ছবি</Label>
              <div className="flex items-center gap-3 mt-1">
                {form.photo_url && <img src={form.photo_url} alt="" className="w-14 h-14 rounded-lg object-cover" />}
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-muted">
                  <Upload className="w-4 h-4" /> আপলোড
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
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
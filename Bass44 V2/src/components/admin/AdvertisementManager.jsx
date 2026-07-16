const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, Upload, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvertisementManager() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', image_url: '', link_url: '', description: '', status: 'active' });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { data: ads = [] } = useQuery({
    queryKey: ['admin-advertisements'],
    queryFn: () => db.entities.Advertisement.list('-created_date', 50),
  });

  const openNew = () => { setEditing(null); setForm({ title: '', image_url: '', link_url: '', description: '', status: 'active' }); setOpen(true); };
  const openEdit = (ad) => { setEditing(ad); setForm({ title: ad.title, image_url: ad.image_url, link_url: ad.link_url, description: ad.description, status: ad.status }); setOpen(true); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return; }
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    update('image_url', file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('শিরোনাম আবশ্যক'); return; }
    try {
      if (editing) await db.entities.Advertisement.update(editing.id, form);
      else await db.entities.Advertisement.create(form);
      toast.success(editing ? 'আপডেট হয়েছে' : 'বিজ্ঞাপন যোগ হয়েছে');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['active-advertisements'] });
    } catch (e) { toast.error('ত্রুটি'); }
  };

  const handleDelete = async (id) => {
    await db.entities.Advertisement.delete(id);
    toast.success('মুছে ফেলা হয়েছে');
    queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
    queryClient.invalidateQueries({ queryKey: ['active-advertisements'] });
  };

  const toggleStatus = async (ad) => {
    await db.entities.Advertisement.update(ad.id, { status: ad.status === 'active' ? 'inactive' : 'active' });
    queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
    queryClient.invalidateQueries({ queryKey: ['active-advertisements'] });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">বিজ্ঞাপন বক্স ম্যানেজ করুন (পেজে ৪টি অ্যাক্টিভ বিজ্ঞাপন দেখানো হবে)</p>
        <Button size="sm" className="gap-2" onClick={openNew}><Plus className="w-4 h-4" /> নতুন বিজ্ঞাপন</Button>
      </div>

      {ads.length === 0 && <p className="text-center py-8 text-muted-foreground">কোন বিজ্ঞাপন নেই</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ads.map(ad => (
          <Card key={ad.id}>
            <CardContent className="p-3">
              <div className="flex gap-3">
                {ad.image_url && <img src={ad.image_url} alt="" className="w-24 h-24 rounded-lg object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{ad.title}</p>
                    {ad.status === 'active' ? <Badge className="bg-green-500 text-white border-0 text-[10px]">Active</Badge> : <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                  </div>
                  {ad.description && <p className="text-xs text-muted-foreground line-clamp-2">{ad.description}</p>}
                  {ad.link_url && <p className="text-xs text-blue-500 truncate mt-1">{ad.link_url}</p>}
                  <div className="flex gap-1 mt-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(ad)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleStatus(ad)}><Star className={`w-3.5 h-3.5 ${ad.status === 'active' ? 'fill-yellow-400 text-yellow-400' : ''}`} /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(ad.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'বিজ্ঞাপন এডিট' : 'নতুন বিজ্ঞাপন'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>শিরোনাম *</Label>
              <Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="ব্যবসার নাম" />
            </div>
            <div>
              <Label>বিবরণ</Label>
              <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} placeholder="সংক্ষিপ্ত বিবরণ" />
            </div>
            <div>
              <Label>লিংক (ওয়েবসাইট/ফোন)</Label>
              <Input value={form.link_url} onChange={e => update('link_url', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>ছবি</Label>
              <div className="flex items-center gap-3">
                {form.image_url && <img src={form.image_url} alt="" className="w-20 h-20 rounded-lg object-cover" />}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted">
                    <Upload className="w-4 h-4" /> {uploading ? 'আপলোড...' : 'ছবি আপলোড'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button onClick={handleSave}>সংরক্ষণ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
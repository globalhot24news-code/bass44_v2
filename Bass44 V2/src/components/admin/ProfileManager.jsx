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
import { Check, X, Eye, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { getProfilePhoto } from '@/lib/profileHelpers';
import { divisions, districtsByDivision } from '@/lib/bangladeshData';

const heightOptions = [
  "৪ ফুট ৬ ইঞ্চি","৪ ফুট ৭ ইঞ্চি","৪ ফুট ৮ ইঞ্চি","৪ ফুট ৯ ইঞ্চি","৪ ফুট ১০ ইঞ্চি","৪ ফুট ১১ ইঞ্চি",
  "৫ ফুট","৫ ফুট ১ ইঞ্চি","৫ ফুট ২ ইঞ্চি","৫ ফুট ৩ ইঞ্চি","৫ ফুট ৪ ইঞ্চি","৫ ফুট ৫ ইঞ্চি",
  "৫ ফুট ৬ ইঞ্চি","৫ ফুট ৭ ইঞ্চি","৫ ফুট ৮ ইঞ্চি","৫ ফুট ৯ ইঞ্চি","৫ ফুট ১০ ইঞ্চি","৫ ফুট ১১ ইঞ্চি",
  "৬ ফুট","৬ ফুট ১ ইঞ্চি","৬ ফুট ২ ইঞ্চি","৬ ফুট ৩ ইঞ্চি"
];
const bloodGroups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

export default function ProfileManager({ filterStatus }) {
  const queryClient = useQueryClient();
  const [viewProfile, setViewProfile] = useState(null);
  const [editProfile, setEditProfile] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: () => db.entities.Profile.list('-created_date', 500),
  });

  const filtered = filterStatus ? profiles.filter(p => p.status === filterStatus) : profiles;

  const approve = async (id) => {
    await db.entities.Profile.update(id, { status: 'approved' });
    queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    toast.success('অনুমোদিত');
  };

  const reject = async (id) => {
    await db.entities.Profile.update(id, { status: 'rejected' });
    queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    toast.success('বাতিল করা হয়েছে');
  };

  const del = async (id) => {
    await db.entities.Profile.delete(id);
    queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    toast.success('মুছে ফেলা হয়েছে');
  };

  const toggleMembership = async (p) => {
    const newMembership = p.membership === 'premium' ? 'free' : 'premium';
    await db.entities.Profile.update(p.id, { membership: newMembership });
    queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    toast.success(`Membership: ${newMembership}`);
  };

  const openEdit = (p) => {
    setEditProfile(p);
    setEditForm({ ...p });
  };

  const updateEdit = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const saveEdit = async () => {
    setLoading(true);
    try {
      await db.entities.Profile.update(editProfile.id, editForm);
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      toast.success('প্রোফাইল আপডেট হয়েছে');
      setEditProfile(null);
    } catch (e) { toast.error('ত্রুটি'); }
    setLoading(false);
  };

  const districts = editForm?.division ? districtsByDivision[editForm.division] || [] : [];

  return (
    <div className="space-y-2">
      {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">কোন প্রোফাইল নেই</p>}
      {filtered.map(p => (
        <Card key={p.id}>
          <CardContent className="py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <img src={getProfilePhoto(p)} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.name_english} {p.name_bangla && `(${p.name_bangla})`}</p>
                <p className="text-xs text-muted-foreground">{p.age}, {p.gender}, {p.district} • {p.mobile || 'No phone'}</p>
              </div>
              <Badge variant={p.status === 'approved' ? 'default' : p.status === 'pending' ? 'outline' : 'destructive'} className="text-[10px]">{p.status}</Badge>
              <Badge variant="outline" className={`text-[10px] ${p.membership === 'premium' ? 'border-yellow-400 text-yellow-600' : ''}`}>{p.membership}</Badge>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewProfile(p)}><Eye className="w-3.5 h-3.5" /></Button>
                {p.status === 'pending' && (
                  <>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={() => approve(p.id)}><Check className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => reject(p.id)}><X className="w-3.5 h-3.5" /></Button>
                  </>
                )}
                <Button size="icon" variant="ghost" className="h-7 w-7 text-yellow-500" onClick={() => toggleMembership(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* View Dialog */}
      <Dialog open={!!viewProfile} onOpenChange={() => setViewProfile(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>পূর্ণ বায়োডাটা</DialogTitle></DialogHeader>
          {viewProfile && (
            <div className="space-y-2 text-sm">
              <img src={getProfilePhoto(viewProfile)} alt="" className="w-24 h-24 rounded-xl object-cover" />
              {Object.entries({
                'Name (EN)': viewProfile.name_english,
                'Name (BN)': viewProfile.name_bangla,
                'Age': viewProfile.age,
                'Gender': viewProfile.gender,
                'Religion': viewProfile.religion,
                'Marital Status': viewProfile.marital_status,
                'Occupation': viewProfile.occupation,
                'Height': viewProfile.height,
                'Blood Group': viewProfile.blood_group,
                'Division': viewProfile.division,
                'District': viewProfile.district,
                'Full Address': viewProfile.full_address,
                'Mobile': viewProfile.mobile,
                'Email': viewProfile.email,
                'Bio': viewProfile.bio,
                'Membership': viewProfile.membership,
                'Status': viewProfile.status,
              }).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="font-medium min-w-[120px] text-muted-foreground">{k}:</span>
                  <span>{v || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editProfile} onOpenChange={() => setEditProfile(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>প্রোফাইল এডিট</DialogTitle></DialogHeader>
          {editForm && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>নাম (EN)</Label><Input value={editForm.name_english || ''} onChange={e => updateEdit('name_english', e.target.value)} /></div>
                <div><Label>নাম (BN)</Label><Input value={editForm.name_bangla || ''} onChange={e => updateEdit('name_bangla', e.target.value)} className="font-display" /></div>
                <div><Label>বয়স</Label><Input type="number" value={editForm.age || ''} onChange={e => updateEdit('age', Number(e.target.value))} /></div>
                <div><Label>লিঙ্গ</Label>
                  <Select value={editForm.gender || ''} onValueChange={v => updateEdit('gender', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>ধর্ম</Label>
                  <Select value={editForm.religion || ''} onValueChange={v => updateEdit('religion', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Islam','Hindu','Christian','Buddhist','Other'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>বৈবাহিক অবস্থা</Label>
                  <Select value={editForm.marital_status || ''} onValueChange={v => updateEdit('marital_status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="never_married">Never Married</SelectItem><SelectItem value="divorced">Divorced</SelectItem><SelectItem value="widowed">Widowed</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>পেশা</Label><Input value={editForm.occupation || ''} onChange={e => updateEdit('occupation', e.target.value)} /></div>
                <div><Label>উচ্চতা</Label>
                  <Select value={editForm.height || ''} onValueChange={v => updateEdit('height', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-48">{heightOptions.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>রক্তের গ্রুপ</Label>
                  <Select value={editForm.blood_group || ''} onValueChange={v => updateEdit('blood_group', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>বিভাগ</Label>
                  <Select value={editForm.division || ''} onValueChange={v => { updateEdit('division', v); updateEdit('district', ''); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>জেলা</Label>
                  <Select value={editForm.district || ''} onValueChange={v => updateEdit('district', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>মোবাইল</Label><Input value={editForm.mobile || ''} onChange={e => updateEdit('mobile', e.target.value)} /></div>
                <div><Label>ইমেইল</Label><Input value={editForm.email || ''} onChange={e => updateEdit('email', e.target.value)} /></div>
              </div>
              <div><Label>পূর্ণ ঠিকানা</Label><Input value={editForm.full_address || ''} onChange={e => updateEdit('full_address', e.target.value)} /></div>
              <div><Label>বায়ো</Label><Textarea value={editForm.bio || ''} onChange={e => updateEdit('bio', e.target.value.slice(0, 300))} rows={3} /></div>
              <div><Label>স্ট্যাটাস</Label>
                <Select value={editForm.status || 'pending'} onValueChange={v => updateEdit('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfile(null)}>বাতিল</Button>
            <Button onClick={saveEdit} disabled={loading}>{loading ? 'সংরক্ষণ...' : 'সংরক্ষণ'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
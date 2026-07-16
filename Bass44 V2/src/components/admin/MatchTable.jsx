import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export default function MatchTable({ matches }) {
  if (matches.length === 0) return <p className="text-center py-8 text-muted-foreground">কোন ম্যাচ নেই</p>;
  return (
    <div className="space-y-2">
      {matches.map(m => (
        <Card key={m.id}>
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <div>
                <p className="font-medium text-sm">{m.profile_a_name} ❤️ {m.profile_b_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(m.created_date).toLocaleString()}</p>
              </div>
            </div>
            {m.notified && <span className="text-[10px] text-green-600">✓ Notified</span>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
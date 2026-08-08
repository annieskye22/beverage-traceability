import { useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminTransfers() {
  const [batchId, setBatchId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId || !recipient || !location) {
      toast.error('Please enter batch ID, recipient, and location');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success(`Custody of ${batchId} transferred to ${recipient}!`);
      setBatchId('');
      setRecipient('');
      setLocation('');
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-xl">
        <h1 className="text-3xl font-bold mb-2">Chain Custody Transfers</h1>
        <p className="text-muted-foreground text-sm mb-6">Log transfer of beverage batches to distributors, retailers, or drivers.</p>

        <form onSubmit={handleTransfer} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <Label htmlFor="batchId">Batch ID</Label>
            <Input id="batchId" placeholder="BATCH-2026-0801" value={batchId} onChange={(e) => setBatchId(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="recipient">Transfer To (Recipient / Entity)</Label>
            <Input id="recipient" placeholder="e.g. Express Cold Logistics Ltd" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="loc">Current Checkpoint Location</Label>
            <Input id="loc" placeholder="e.g. Victoria Island Distribution Center" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" />
          </div>

          <Button type="submit" className="w-full mt-4" disabled={submitting}>
            {submitting ? 'Signing Transfer...' : 'Sign Custody Transfer'}
          </Button>
        </form>
      </main>
    </div>
  );
}
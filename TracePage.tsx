import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicNav from '@/components/PublicNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getTrace, GetTraceOutputType } from 'zite-endpoints-sdk';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

export default function TracePage() {
  const [params, setParams] = useSearchParams();
  const [batchId, setBatchId] = useState(params.get('batch') || '');
  const [result, setResult] = useState<GetTraceOutputType | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doTrace = (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setSearched(true);
    setParams({ batch: id });
    getTrace({ batchId: id }).then((r) => { setResult(r); setLoading(false); });
  };

  useEffect(() => {
    const b = params.get('batch');
    if (b) { setBatchId(b); doTrace(b); }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Verify Your Product</h1>
        <p className="text-muted-foreground mb-6">Scan the QR code on your beverage or enter the batch ID below.</p>
        <div className="flex items-center gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Enter batch ID (e.g. BT-20260801)" className="pl-9" value={batchId} onChange={(e) => setBatchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doTrace(batchId)} />
          </div>
          <Button onClick={() => doTrace(batchId)}>Trace</Button>
        </div>

        {loading && <Skeleton className="h-64 rounded-xl" />}

        {!loading && searched && !result?.product && (
          <div className="border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No product found for batch ID "{batchId}".</p>
          </div>
        )}

        {!loading && result?.product && (
          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold text-foreground">{result.product.productName}</p>
                <p className="text-xs font-mono text-muted-foreground">{result.product.batchId} · {result.product.type} · {result.product.quantity} units</p>
              </div>
              <Badge variant={result.product.status === 'Delivered' ? 'default' : 'secondary'}>
                {result.product.status} {result.product.status === 'Delivered' && '✓'}
              </Badge>
            </div>

            {result.transfers.length > 0 ? (
              <div className="border-l-2 border-border ml-3 pl-6 space-y-5 mt-6">
                {result.transfers.map((t: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary -ml-[1.69rem]" />
                      <p className="font-medium text-foreground">{t.stage || 'Transfer'}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.fromActor} → {t.toActor}</p>
                    <p className="text-xs text-muted-foreground">{t.transferDate ? format(new Date(t.transferDate), 'MMM d, yyyy h:mm a') : ''}</p>
                    {t.notes && <p className="text-xs text-muted-foreground italic mt-1">{t.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-4">No transfer events recorded yet.</p>
            )}

            <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">Verified on BevTrace · Powered by NEAR Protocol</p>
          </div>
        )}
      </div>
    </div>
  );
}

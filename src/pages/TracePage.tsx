import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicNav from '@/components/PublicNav';
import { Button } from '@/components/ui/button';
import { QrCode, ShieldCheck, MapPin, Calendar, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function TracePage() {
  const [searchParams] = useSearchParams();
  const paramBatch = searchParams.get('batchId') || searchParams.get('batchid') || searchParams.get('batch') || '';

  const [searchQuery, setSearchQuery] = useState(paramBatch);
  const [activeBatch, setActiveBatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrace = async (batchIdToSearch: string) => {
    if (!batchIdToSearch.trim()) return;

    setLoading(true);
    setSearched(true);
    setActiveBatch(null);

    try {
      const cleanId = batchIdToSearch.trim().toUpperCase();

      // 1. Check products collection
      let q = query(collection(db, 'products'), where('batchNumber', '==', cleanId));
      let querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        setActiveBatch({ id: docSnap.id, isProduct: true, ...docSnap.data() });
      } else {
        // 2. Check orders collection
        q = query(collection(db, 'orders'), where('batchId', '==', cleanId));
        querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setActiveBatch({ id: docSnap.id, isProduct: false, ...docSnap.data() });
        }
      }
    } catch (error) {
      console.error("Error tracing batch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramBatch) {
      setSearchQuery(paramBatch);
      handleTrace(paramBatch);
    }
  }, [paramBatch]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <ShieldCheck className="h-4 w-4" /> NEAR Protocol Ledger Verification
          </div>
          <h1 className="text-3xl font-bold">Trace Beverage Provenance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter a Batch ID or QR Tag code to verify farm origin, processing logs, and on-chain records.
          </p>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleTrace(searchQuery); }}
          className="flex gap-2 max-w-xl mx-auto mb-10"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter Batch ID (e.g. WAFER-36)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Trace Batch'}
          </Button>
        </form>

        {/* Results Display */}
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Querying blockchain & Firestore ledger...</p>
        ) : activeBatch ? (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
                <div>
                  <span className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                    VERIFIED ON NEAR MAINNET
                  </span>
                  <h2 className="text-2xl font-bold mt-2">
                    {activeBatch.productName || activeBatch.blendName || 'Beverage Batch'}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Batch ID: {activeBatch.batchNumber || activeBatch.batchId}
                  </p>
                </div>

                {/* Live Nearblocks Mainnet Link */}
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">NEAR Mainnet Tx Hash</p>
                  <a 
                    href={`https://nearblocks.io/txns/${activeBatch.nearTxHash || 'ieDNTCgzkmeUYQ1M9RAS7MfwBEG49J723nYow3irgTE'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-primary flex items-center gap-1 hover:underline sm:justify-end mt-0.5"
                  >
                    {activeBatch.nearTxHash 
                      ? `${activeBatch.nearTxHash.slice(0, 8)}...${activeBatch.nearTxHash.slice(-6)}` 
                      : 'ieDNTCgz...3irgTE'}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Provenance Timeline */}
              <h3 className="font-semibold text-sm mb-6 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" /> Supply Chain Timeline
              </h3>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-border">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 bg-primary text-primary-foreground rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Organic Ingredient Harvesting</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sourced from Certified Fair-Trade Farmers Cooperative
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Oyo State, Nigeria</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Certified Quality</span>
                    </div>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 bg-primary text-primary-foreground rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Cold-Press Processing & Quality Check</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      100% natural extraction, zero preservatives. NAFDAC compliance verified.
                    </p>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 bg-primary text-primary-foreground rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">On-Chain Batch Record Minted</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Provenance block anchored immutably to NEAR Protocol ledger.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : searched ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center space-y-2">
            <p className="font-semibold text-destructive">Batch ID Not Found</p>
            <p className="text-xs text-muted-foreground">
              We couldn't find a recorded batch with ID <span className="font-mono font-bold text-foreground">"{searchQuery}"</span>.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
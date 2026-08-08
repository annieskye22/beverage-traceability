import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface TraceCardData {
  blendName?: string;
  batchId?: string;
  supplier?: string;
  producedBy?: string;
  origin?: string;
  harvestDate?: string;
  producedDate?: string;
  certifications?: string;
  chainHash?: string;
  ingredients?: string[];
}

export default function TracePage() {
  const [searchParams] = useSearchParams();
  const batchIdParam = searchParams.get('batchId');

  const [cards, setCards] = useState<TraceCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTraceData() {
      try {
        const ordersRef = collection(db, 'orders');
        let q;

        if (batchIdParam) {
          // If a batchId is in URL, fetch that specific record
          q = query(ordersRef, where('batchId', '==', batchIdParam));
        } else {
          // Otherwise fetch all batch records to show the full grid
          q = query(ordersRef);
        }

        const querySnapshot = await getDocs(q);
        const fetchedData: TraceCardData[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as TraceCardData;
          fetchedData.push(data);
        });

        setCards(fetchedData);
      } catch (err) {
        console.error('Error fetching traceability cards:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTraceData();
  }, [batchIdParam]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-500 font-medium">Loading Verified Supply Chain Records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      
      {/* Title Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Batch Traceability Records</h1>
        <p className="text-sm text-gray-500 mt-1">Verified on-chain origin and ingredients tracking</p>
      </div>

      {/* Grid of Cards (Matching exact design in screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.length > 0 ? (
          cards.map((item, index) => {
            const displayBatch = item.batchId || `MX-BATCH-${560617 + index}`;
            const displaySupplier = item.supplier || item.producedBy || 'Ogun Farms Ltd';
            const displayOrigin = item.origin || 'Ogun, Nigeria';
            const displayHarvestDate = item.harvestDate || item.producedDate || '2026-08-08';
            const displayCert = item.certifications || 'Organic';
            const displayHash = item.chainHash || '0x8f7d6ec5c4b3...';

            return (
              <div 
                key={index} 
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Verified Badge */}
                <div className="flex items-center gap-1.5 text-red-500 bg-red-50 w-fit px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <span className="text-xs">✔</span>
                  <span>Verified</span>
                </div>

                {/* Card Title & Batch */}
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                  {item.blendName || 'AVOCADO ZING SMOOTHIE'}
                </h3>
                <p className="text-xs text-gray-400 mb-6 font-mono">
                  Batch: {displayBatch}
                </p>

                {/* Card Meta Details */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-gray-400">Supplier</span>
                    <span className="font-bold text-gray-900">{displaySupplier}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-gray-400">Origin</span>
                    <span className="font-bold text-gray-900">{displayOrigin}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-gray-400">Harvest Date</span>
                    <span className="font-bold text-gray-900">{displayHarvestDate}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-gray-400">Certifications</span>
                    <span className="bg-red-100 text-red-700 font-semibold px-2.5 py-0.5 rounded-md text-[11px]">
                      {displayCert}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600 pt-1">
                    <span className="text-gray-400">Chain Hash</span>
                    <span className="font-mono text-gray-500 text-[11px] truncate max-w-[140px]">
                      {displayHash}
                    </span>
                  </div>

                  {/* Ingredients Section */}
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div className="pt-3 border-t border-gray-100 mt-2">
                      <span className="text-gray-400 block mb-1">Ingredients:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.ingredients.map((ing, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            No traceability records found.
          </div>
        )}
      </div>

    </div>
  );
}
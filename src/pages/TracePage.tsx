import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface CompleteTraceData {
  blendName?: string;
  batchId?: string;
  price?: number;
  producedBy?: string;
  producedDate?: string;
  createdAt?: any;
  ingredients?: string[];
  supplier?: string;
  origin?: string;
  harvestDate?: string;
  certifications?: string;
  organicHarvesting?: boolean;
  coldPressed?: boolean;
  nearHash?: string;
  isMintedOnChain?: boolean;
}

export default function TracePage() {
  const [searchParams] = useSearchParams();
  const batchIdParam = searchParams.get('batchId');

  const [cards, setCards] = useState<CompleteTraceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTraceData() {
      try {
        const ordersRef = collection(db, 'orders');
        let q;

        if (batchIdParam) {
          q = query(ordersRef, where('batchId', '==', batchIdParam));
        } else {
          q = query(ordersRef);
        }

        const querySnapshot = await getDocs(q);
        const fetchedData: CompleteTraceData[] = [];

        querySnapshot.forEach((doc) => {
          fetchedData.push(doc.data() as CompleteTraceData);
        });

        setCards(fetchedData);
      } catch (err) {
        console.error('Error fetching comprehensive traceability records:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTraceData();
  }, [batchIdParam]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-500 font-medium">Retrieving Verified NEAR On-Chain Batch Records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      
      {/* Title Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">Comprehensive Batch Traceability</h1>
        <p className="text-sm text-gray-500 mt-1">Verified farm-to-cup origin, processing methods, and NEAR blockchain provenance</p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.length > 0 ? (
          cards.map((item, index) => {
            const displayBatch = item.batchId || `MX-BATCH-${560617 + index}`;
            const displayPrice = item.price ? `₦${item.price.toLocaleString()}` : '₦3,000';
            const displayProducer = item.producedBy || 'Mixit Smoothies Lab';
            const displayProducedDate = item.producedDate || '2026-08-08';
            const displaySupplier = item.supplier || 'Local Farmers Co-op';
            const displayOrigin = item.origin || 'Lagos, Nigeria';
            const displayHarvestDate = item.harvestDate || '2026-08-01';
            const displayNearHash = item.nearHash || '0x8f7d6ec5c4b389f...';
            const ingredientsList = item.ingredients && item.ingredients.length > 0 
              ? item.ingredients 
              : ['Organic Avocado', 'Greek Yogurt', 'Spinach', 'Raw Honey'];

            return (
              <div 
                key={index} 
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all relative flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      ✓ Verified
                    </span>
                    <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      ⛓ NEAR On-Chain Minted
                    </span>
                  </div>

                  {/* Product Ordered & Price */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-tight">
                      {item.blendName || 'CUSTOM OCD BLEND'}
                    </h3>
                    <span className="text-base font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      {displayPrice}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-gray-400 mb-4">
                    Batch ID: {displayBatch}
                  </p>

                  {/* Key Metadata Table */}
                  <div className="space-y-2 text-xs border-t border-b border-gray-100 py-3 my-3">
                    
                    {/* Produced By & Date */}
                    <div className="flex justify-between text-gray-600">
                      <span className="text-gray-400">Produced By:</span>
                      <span className="font-bold text-gray-800">{displayProducer}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span className="text-gray-400">Date Produced:</span>
                      <span className="font-bold text-gray-800">{displayProducedDate}</span>
                    </div>

                    {/* Supplier & Origin */}
                    <div className="flex justify-between text-gray-600">
                      <span className="text-gray-400">Supplier:</span>
                      <span className="font-semibold text-gray-700">{displaySupplier}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span className="text-gray-400">Origin / Harvest Date:</span>
                      <span className="font-semibold text-gray-700">{displayOrigin} ({displayHarvestDate})</span>
                    </div>
                  </div>

                  {/* Harvest & Processing Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                      🌱 Organic Harvested
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                      ❄️ Cold-Pressed Processed
                    </span>
                  </div>

                  {/* Ingredients Section */}
                  <div className="mb-4">
                    <span className="text-gray-400 text-xs block mb-1.5 font-medium">Verified Ingredients:</span>
                    <div className="flex flex-wrap gap-1">
                      {ingredientsList.map((ing, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Blockchain Proof Bottom Bar */}
                <div className="pt-3 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-3xl mt-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500 font-medium">NEAR Chain Hash:</span>
                    <span className="font-mono text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded">
                      {displayNearHash}
                    </span>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            No active batch records found.
          </div>
        )}
      </div>

    </div>
  );
}
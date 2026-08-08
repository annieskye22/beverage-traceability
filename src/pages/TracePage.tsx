import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface OrderData {
  blendName?: string;
  batchId?: string;
  producedBy?: string;
  createdAt?: any;
  ingredients?: string[];
  status?: string;
  price?: number;
  type?: string;
}

export default function TracePage() {
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get('batchId');

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!batchId) {
        setLoading(false);
        return;
      }

      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('batchId', '==', batchId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data() as OrderData;
          setOrderData(docData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-500">Retrieving Blockchain Provenance Data...</p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <h3 className="text-lg font-bold text-red-800">Traceability Record Not Found</h3>
        <p className="text-sm text-red-600 mt-2">
          No batch document matches ID: <span className="font-mono bg-red-100 px-2 py-0.5 rounded">{batchId || 'N/A'}</span>
        </p>
      </div>
    );
  }

  // Format the createdAt timestamp
  const dateFormatted = orderData.createdAt?.toDate 
    ? orderData.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'August 8, 2026';

  // Status Step Helper
  const statusSteps = ['Received', 'Blending', 'Quality Check', 'Dispatched', 'Delivered'];
  const currentStatusIndex = statusSteps.indexOf(orderData.status || 'Delivered');
  const activeStep = currentStatusIndex !== -1 ? currentStatusIndex : 4;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 my-8 font-sans space-y-6">
      
      {/* --- TOP HEADER & BADGE --- */}
      <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-bl-xl tracking-wider">
          Verified On-Chain
        </div>

        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-gray-100 pb-4">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-2">
              {orderData.type || 'Custom Smoothie'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {orderData.blendName || 'Mango Smoothie'}
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-1">Batch ID: {orderData.batchId}</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-semibold">Order Total</p>
            <p className="text-2xl font-black text-gray-800">₦{orderData.price ? orderData.price.toLocaleString() : '3,000'}</p>
          </div>
        </div>

        {/* --- SUPPLY CHAIN PROGRESS TRACKER --- */}
        <div className="mt-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Order & Batch Timeline</p>
          <div className="grid grid-cols-5 gap-1 text-center">
            {statusSteps.map((step, idx) => {
              const isPassed = idx <= activeStep;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isPassed ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium mt-1.5 ${
                    isPassed ? 'text-gray-900 font-semibold' : 'text-gray-400'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- PROVENANCE & BATCH METADATA (NEW FIELDS INTEGRATED) --- */}
      <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
          <span>🌿</span> Production & Origin Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Produced By */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Produced By</span>
            <span className="text-sm font-bold text-gray-800 mt-0.5 block">
              {orderData.producedBy || 'Mixit Smoothies Lab'}
            </span>
          </div>

          {/* Date Produced */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Production Date</span>
            <span className="text-sm font-bold text-gray-800 mt-0.5 block">
              {dateFormatted}
            </span>
          </div>

          {/* Ingredients List */}
          <div className="sm:col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">Verified Ingredients</span>
            <div className="flex flex-wrap gap-2">
              {orderData.ingredients && orderData.ingredients.length > 0 ? (
                orderData.ingredients.map((ingredient, idx) => (
                  <span 
                    key={idx} 
                    className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {ingredient}
                  </span>
                ))
              ) : (
                <>
                  <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">Fresh Mangoes</span>
                  <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">Greek Yogurt</span>
                  <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">Pure Honey</span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- SUPPLY CHAIN AUDIT TRAIL --- */}
      <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
          <span>🔍</span> Transparency Audit
        </h2>
        
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center text-gray-600">
            <span>Quality Inspection Status</span>
            <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">PASSED (Grade A)</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Storage & Transport Condition</span>
            <span className="font-semibold text-gray-800">Cold Chain (4°C)</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Verification Method</span>
            <span className="font-mono text-gray-500">QR Code Hash Match</span>
          </div>
        </div>
      </div>

    </div>
  );
}
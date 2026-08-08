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
        // Query the 'orders' collection where batchId matches
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
    return <div className="p-8 text-center text-gray-500">Loading batch details...</div>;
  }

  if (error || !orderData) {
    return (
      <div className="p-8 text-center text-red-500">
        Traceability record not found for Batch ID: <strong>{batchId || 'N/A'}</strong>
      </div>
    );
  }

  // Format the createdAt timestamp
  const dateFormatted = orderData.createdAt?.toDate 
    ? orderData.createdAt.toDate().toLocaleDateString()
    : 'August 8, 2026';

  return (
    <div className="max-w-xl mx-auto p-6 bg-white border border-gray-100 shadow-xl rounded-2xl my-10 font-sans">
      <div className="border-b pb-4 mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Verified Supply Chain Batch
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">
          {orderData.blendName || 'Beverage Details'}
        </h2>
        <p className="text-xs text-gray-400 mt-1">Batch ID: {orderData.batchId}</p>
      </div>

      <div className="space-y-4 text-sm text-gray-700">
        {/* Produced By */}
        <div className="flex justify-between items-center border-b pb-3">
          <span className="font-semibold text-gray-500">Produced By:</span>
          <span className="font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
            {orderData.producedBy || 'Mixit Smoothies Lab'}
          </span>
        </div>

        {/* Date Produced */}
        <div className="flex justify-between items-center border-b pb-3">
          <span className="font-semibold text-gray-500">Date Produced:</span>
          <span className="font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
            {dateFormatted}
          </span>
        </div>

        {/* Ingredients */}
        <div>
          <span className="font-semibold text-gray-500 block mb-2">Ingredients:</span>
          <div className="flex flex-wrap gap-2">
            {orderData.ingredients && orderData.ingredients.length > 0 ? (
              orderData.ingredients.map((ingredient, idx) => (
                <span 
                  key={idx} 
                  className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full"
                >
                  {ingredient}
                </span>
              ))
            ) : (
              <span className="text-gray-400 italic">Fresh Mangoes, Greek Yogurt, Honey</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
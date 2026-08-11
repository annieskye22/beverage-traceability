import { useState, useEffect } from 'react';
import PublicNav from '@/components/PublicNav';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, ShoppingBag } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Strict user filter
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const userOrders: any[] = [];
        querySnapshot.forEach((doc) => {
          userOrders.push({ id: doc.id, ...doc.data() });
        });

        // Newest orders first
        userOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching user orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PublicNav />

      <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-rose-600" /> My Orders
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Logged in as <span className="font-semibold text-foreground">{user?.email}</span>
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading your personal order history...</p>
        ) : orders.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">No Orders Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven't placed any orders with this account yet. Head over to the menu to place your first order!
            </p>
            <a href="/#quick-order" className="inline-block mt-2 text-xs font-bold bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700">
              Browse Menu
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              // Read the live hash from Firebase, handle the temporary placeholder
              const displayHash = order.nearHash || order.chainHash;
              const isPending = displayHash === 'Minting on-chain...';

              return (
                <div key={order.id} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded text-foreground">
                        {order.batchId}
                      </span>
                      <span className="text-xs font-bold text-rose-600 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                        {order.status || 'Processing'}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mt-1">{order.blendName}</h3>
                    <p className="text-xs font-bold text-primary">₦{order.price?.toLocaleString()}</p>
                    
                    {/* Display the NEAR Transaction Hash right on the order card */}
                    {displayHash && (
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Tx Hash: <span className="font-mono font-bold text-rose-600">
                          {isPending ? 'Pending...' : `${displayHash.slice(0, 16)}...`}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 border-t md:border-t-0 border-border pt-3 md:pt-0">
                    <a
                      href={`/trace?batchId=${order.batchId}`}
                      className="text-xs font-bold border border-border px-4 py-2 rounded-md hover:bg-muted transition flex items-center gap-1.5"
                    >
                      <ShieldCheck className="h-4 w-4 text-rose-600" /> Trace On-Chain
                    </a>

                  {/* Dynamic QR Code Linked Directly to Your Live App */}
<div className="border-l border-border pl-4 bg-white rounded-md flex items-center justify-center">
  <QRCodeSVG 
    value={`https://beverage-traceability-kb8r-one.vercel.app/trace?batchId=${order.batchId}`} 
    size={80} 
    level="H"           // Highest error correction for better scanning
    includeMargin={true} // CRITICAL: Adds white space border so scanners can find the code
    className="p-1"
  />
</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
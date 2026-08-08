import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Plus, QrCode, Printer, ArrowUpRight, ArrowLeft } from 'lucide-react';

interface OrderItem {
  id: string;
  batchId?: string;
  orderId?: string;
  userEmail?: string;
  customerName?: string;
  blendName?: string;
  price?: number;
  status?: string;
  createdAt?: any;
}

interface ProductBatch {
  id: string;
  name: string;
  batchId: string;
  category: string;
  price: number;
  quantityAvailable: number;
  producedDate?: string;
  expiryDate?: string;
  producedBy?: string;
  chainTxHash?: string;
  supplier?: string;
  origin?: string;
  harvestDate?: string;
  status?: string;
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab State (Dashboard, Products, Orders)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');

  // Real-time Data
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductBatch[]>([]);

  // Modal States
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [qrModalBatch, setQrModalBatch] = useState<ProductBatch | null>(null);
  const [printModalBatch, setPrintModalBatch] = useState<ProductBatch | null>(null);

  // Form Fields
  const [batchCode, setBatchCode] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [producedBy, setProducedBy] = useState('steph');
  const [producedDate, setProducedDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [nearTxUrl, setNearTxUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Listen to Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as OrderItem[];
      setOrders(items);
    });

    // Listen to Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ProductBatch[];
      setProducts(items);
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const finalCode = batchCode.trim() || `MX-BATCH-${Math.floor(100000 + Math.random() * 900000)}`;

      await addDoc(collection(db, 'products'), {
        name: productName || 'Organic Smoothie Blend',
        batchId: finalCode,
        producedBy: producedBy || 'steph',
        producedDate: producedDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        expiryDate: expiryDate || '16 Jan 2030',
        chainTxHash: nearTxUrl.trim(),
        price: 2500,
        category: 'Smoothies',
        quantityAvailable: Number(quantity) || 100,
        createdAt: serverTimestamp(),
      });

      setBatchCode('');
      setProductName('');
      setNearTxUrl('');
      setShowBatchModal(false);
      alert(`Batch ${finalCode} created successfully!`);
    } catch (err) {
      console.error('Error creating batch:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Calculations for Dashboard Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const pendingOrders = orders.filter((o) => o.status !== 'Delivered').length;

  return (
    <div className="min-h-screen bg-[#FAF6F3] text-[#2B1E1A] font-sans">
      {/* Top Header Navigation bar */}
      <header className="bg-white border-b border-[#EAE2DC] px-8 py-4 flex items-center justify-between shadow-sm print:hidden">
        
        {/* CLICKABLE LOGO + TITLE -> GOES TO LANDING PAGE ("/") */}
        <Link to="/" className="flex items-center gap-2 group transition" title="Go to Website Landing Page">
          <span className="text-[#E11D48] text-lg group-hover:scale-110 transition-transform">⚙️</span>
          <span className="font-extrabold text-base text-[#E11D48] group-hover:underline">
            Mixit Admin
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-8 text-xs font-bold text-gray-500">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-1 transition ${activeTab === 'dashboard' ? 'text-[#E11D48] font-black border-b-2 border-[#E11D48]' : 'hover:text-[#2B1E1A]'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-1 transition ${activeTab === 'products' ? 'text-[#E11D48] font-black border-b-2 border-[#E11D48]' : 'hover:text-[#2B1E1A]'}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-1 transition ${activeTab === 'orders' ? 'text-[#E11D48] font-black border-b-2 border-[#E11D48]' : 'hover:text-[#2B1E1A]'}`}
          >
            Orders
          </button>
        </nav>

        {/* User Badge + Back Button + Logout */}
        <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
          <Link to="/" className="hidden md:flex items-center gap-1 text-gray-500 hover:text-[#E11D48] transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Website
          </Link>
          <span className="text-gray-300">|</span>
          <span>Welcome, Admin</span>
          <button
            onClick={handleLogout}
            className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold px-3.5 py-1.5 rounded-lg text-xs transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="container mx-auto px-8 py-8 max-w-7xl space-y-8 print:hidden">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <h1 className="text-2xl font-black text-[#2B1E1A]">Overview</h1>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-[#EAE2DC] rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Total Revenue</span>
                <p className="text-2xl font-black text-[#E11D48]">₦{totalRevenue.toLocaleString()}</p>
              </div>

              <div className="bg-white border border-[#EAE2DC] rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Total Orders</span>
                <p className="text-2xl font-black text-[#2B1E1A]">{totalOrders}</p>
              </div>

              <div className="bg-white border border-[#EAE2DC] rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Batches Logged</span>
                <p className="text-2xl font-black text-[#2B1E1A]">{totalProducts}</p>
              </div>

              <div className="bg-white border border-[#EAE2DC] rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Pending Orders</span>
                <p className="text-2xl font-black text-[#E11D48]">{pendingOrders}</p>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white border border-[#EAE2DC] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-base text-[#2B1E1A]">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#E11D48] flex items-center gap-1">
                  View All Orders <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="divide-y divide-[#EAE2DC] text-xs">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#2B1E1A]">{o.customerName || o.userEmail || 'Customer'}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{o.blendName || 'Smoothie Order'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-[#E11D48]">₦{(o.price || 0).toLocaleString()}</p>
                      <span className="text-[10px] font-bold bg-[#FAF6F3] text-gray-600 px-2 py-0.5 rounded-full">
                        {o.status || 'Accepted'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS & BATCHES */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-[#2B1E1A]">Product Batches</h1>
              <Button
                onClick={() => setShowBatchModal(true)}
                className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-xs rounded-xl px-5 py-2.5 shadow-sm flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Log New Batch
              </Button>
            </div>

            <div className="bg-white border border-[#EAE2DC] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5EFEA]/60 border-b border-[#EAE2DC] text-[11px] font-extrabold text-gray-500">
                    <th className="py-3.5 px-6">Batch Code</th>
                    <th className="py-3.5 px-6">Product</th>
                    <th className="py-3.5 px-6">Produced</th>
                    <th className="py-3.5 px-6">Qty</th>
                    <th className="py-3.5 px-6">Expiry</th>
                    <th className="py-3.5 px-6">Produced By</th>
                    <th className="py-3.5 px-6">NEAR Tx</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2DC] text-xs font-semibold text-[#2B1E1A]">
                  {products.map((p) => {
                    const isMinted = Boolean(p.chainTxHash && p.chainTxHash.trim().length > 0);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-6 font-mono text-gray-600 text-[11px] font-bold">{p.batchId}</td>
                        <td className="py-4 px-6 font-bold text-[#2B1E1A]">{p.name}</td>
                        <td className="py-4 px-6 text-gray-500 font-medium">{p.producedDate || '4 Aug 2026'}</td>
                        <td className="py-4 px-6 font-bold text-[#2B1E1A]">{p.quantityAvailable ?? 100}</td>
                        <td className="py-4 px-6 text-gray-500 font-medium">{p.expiryDate || '16 Jan 2030'}</td>
                        <td className="py-4 px-6 text-gray-600 font-medium">{p.producedBy || 'steph'}</td>
                        <td className="py-4 px-6">
                          {isMinted ? (
                            <a
                              href={p.chainTxHash?.startsWith('http') ? p.chainTxHash : `https://explorer.testnet.near.org/transactions/${p.chainTxHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 bg-[#E11D48] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm"
                            >
                              Verified ↗
                            </a>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">Not minted</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setQrModalBatch(p)}
                              className="bg-[#F5EFEA] hover:bg-[#EAE2DC] text-[#2B1E1A] text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1"
                            >
                              <QrCode className="h-3 w-3" /> QR
                            </button>
                            <button
                              onClick={() => {
                                setPrintModalBatch(p);
                                setTimeout(() => window.print(), 300);
                              }}
                              className="bg-[#F5EFEA] hover:bg-[#EAE2DC] text-[#2B1E1A] text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1"
                            >
                              <Printer className="h-3 w-3" /> Print
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h1 className="text-xl font-black text-[#2B1E1A]">Customer Orders</h1>

            <div className="bg-white border border-[#EAE2DC] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5EFEA]/60 border-b border-[#EAE2DC] text-[11px] font-extrabold text-gray-500">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Items</th>
                    <th className="py-3.5 px-6">Total</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2DC] text-xs font-semibold text-[#2B1E1A]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 font-mono text-gray-500 text-[11px]">{o.batchId || `ORD-${o.id.slice(-6).toUpperCase()}`}</td>
                      <td className="py-4 px-6 font-bold text-[#2B1E1A]">{o.customerName || o.userEmail || 'Customer'}</td>
                      <td className="py-4 px-6 text-gray-600 font-medium">{o.blendName || 'Smoothie Order'}</td>
                      <td className="py-4 px-6 font-bold text-[#E11D48]">₦{(o.price || 0).toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className="bg-[#E11D48] text-white text-[10px] font-extrabold px-3 py-1 rounded-full">
                          {o.status || 'Accepted'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Log Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#EAE2DC]">
            <div className="flex justify-between items-center pb-1">
              <h3 className="font-extrabold text-base text-[#2B1E1A]">Log New Product Batch</h3>
              <button onClick={() => setShowBatchModal(false)} className="text-gray-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs text-[#2B1E1A]">
              <input
                type="text"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="Batch Code (e.g. MX-BATCH-500617)"
                className="w-full bg-white border border-[#EAE2DC] rounded-xl px-4 py-2.5 text-xs font-medium"
                required
              />
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product Name"
                className="w-full bg-white border border-[#EAE2DC] rounded-xl px-4 py-2.5 text-xs font-medium"
                required
              />
              <input
                type="text"
                value={nearTxUrl}
                onChange={(e) => setNearTxUrl(e.target.value)}
                placeholder="https://explorer.near.org/transactions/..."
                className="w-full bg-white border border-[#EAE2DC] rounded-xl px-4 py-2.5 text-xs font-medium"
              />
              <Button type="submit" disabled={submitting} className="w-full bg-[#E11D48] text-white font-extrabold rounded-xl py-3 text-xs">
                {submitting ? 'Saving...' : 'Create Batch'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Viewer Modal */}
      {qrModalBatch && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center border border-[#EAE2DC] shadow-2xl">
            <h3 className="font-extrabold text-sm text-[#2B1E1A]">{qrModalBatch.name}</h3>
            <p className="text-xs text-gray-400 font-mono">Batch: {qrModalBatch.batchId}</p>

            <div className="p-4 bg-[#FAF6F3] border border-[#EAE2DC] rounded-2xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `${window.location.origin}/trace?batchId=${qrModalBatch.batchId}`
                )}`}
                alt="Batch QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <Button
              onClick={() => setQrModalBatch(null)}
              className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold rounded-full py-2 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Printable Label View */}
      {printModalBatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-white">
          <div className="bg-white border-2 border-dashed border-[#2B1E1A] rounded-2xl p-6 max-w-xs w-full text-center space-y-3 shadow-2xl print:shadow-none print:border-2 print:border-black">
            <h2 className="font-extrabold text-sm text-[#E11D48] uppercase">Mixit Smoothies</h2>
            <p className="font-mono text-xs font-extrabold text-[#2B1E1A]">{printModalBatch.name}</p>

            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x180&data=${encodeURIComponent(
                `${window.location.origin}/trace?batchId=${printModalBatch.batchId}`
              )}`}
              alt="QR Label"
              className="w-36 h-36 mx-auto"
            />

            <div className="text-[10px] space-y-0.5 font-bold text-gray-600 border-t pt-2 border-gray-200">
              <p className="font-mono text-[#2B1E1A]">Batch: {printModalBatch.batchId}</p>
              <p>Produced: {printModalBatch.producedDate || '4 Aug 2026'}</p>
              <p className="text-[#E11D48] pt-1">Scan for Provenance & NEAR Blockchain Tag</p>
            </div>

            <div className="pt-2 print:hidden flex gap-2">
              <Button onClick={() => setPrintModalBatch(null)} className="w-1/2 bg-gray-200 text-[#2B1E1A] font-bold rounded-xl text-xs py-1.5">
                Close
              </Button>
              <Button onClick={() => window.print()} className="w-1/2 bg-[#E11D48] text-white font-bold rounded-xl text-xs py-1.5">
                Print Label
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
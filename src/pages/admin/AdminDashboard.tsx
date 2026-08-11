import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminNav from '@/components/AdminNav';
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { 
  Activity, AlertTriangle, CheckCircle2, Server, 
  Package, ShoppingBag, Clock, TrendingUp, ArrowLeft 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface OrderItem {
  id: string;
  batchId?: string;
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
  chainTxHash?: string;
}

// Custom Colors for Charts
const PIE_COLORS = ['#E11D48', '#FB7185', '#FDA4AF', '#FFE4E6', '#9F1239'];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductBatch[]>([]);

  useEffect(() => {
    // Listen to Firebase Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as OrderItem[];
      items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(items);
    });

    // Listen to Firebase Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ProductBatch[];
      setProducts(items);
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // --- Dynamic Live Analytics Calculations ---
  const today = new Date();
  let totalRevenue = 0;
  let todaysRevenue = 0;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenueMap: Record<string, number> = {};
  monthNames.forEach(m => monthlyRevenueMap[m] = 0);

  const dailyOrdersMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dailyOrdersMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
  }

  const productSalesMap: Record<string, number> = {};
  const categorySalesMap: Record<string, number> = { 'Smoothies': 0, 'Juices': 0, 'Parfaits': 0 };

  orders.forEach((o) => {
    const price = o.price || 0;
    totalRevenue += price;

    if (o.createdAt) {
      const orderDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      
      // Today's Revenue
      if (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      ) {
        todaysRevenue += price;
      }

      // Monthly Revenue
      if (orderDate.getFullYear() === today.getFullYear()) {
        monthlyRevenueMap[monthNames[orderDate.getMonth()]] += price;
      }

      // Daily Orders (Last 7 Days)
      const diffTime = today.getTime() - orderDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 6) {
        const dayStr = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (dailyOrdersMap[dayStr] !== undefined) {
          dailyOrdersMap[dayStr] += 1;
        }
      }
    }

    // Capture Sales by Individual Product
    const blend = o.blendName || 'Unknown Item';
    productSalesMap[blend] = (productSalesMap[blend] || 0) + 1;

    // Capture Sales by Category for Pie Chart
    const matchedProduct = products.find(p => p.name === blend || p.batchId === o.batchId);
    const category = matchedProduct?.category || 'Smoothies';
    categorySalesMap[category] = (categorySalesMap[category] || 0) + 1;
  });

  const monthlySalesData = monthNames.slice(0, today.getMonth() + 1).map(month => ({
    month,
    revenue: monthlyRevenueMap[month]
  }));

  const dailyOrdersData = Object.keys(dailyOrdersMap).map(day => ({
    day,
    orders: dailyOrdersMap[day]
  }));

  // Format Top 5 Products for the new Bar Chart
  const productSalesData = Object.keys(productSalesMap)
    .map(name => ({ name, sales: productSalesMap[name] }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const categoryData = Object.keys(categorySalesMap)
    .filter(k => categorySalesMap[k] > 0)
    .map(k => ({ name: k, value: categorySalesMap[k] }));

  const totalOrders = orders.length;
  const totalProducts = products.length;
  const mintedBatches = products.filter(p => p.chainTxHash && p.chainTxHash !== 'Minting on-chain...').length;
  const pendingBatches = totalProducts - mintedBatches;
  const lowStockProducts = products.filter(p => p.quantityAvailable < 20);

  return (
    <div className="min-h-screen bg-[#FAF6F3] text-[#2B1E1A] font-sans">
      <AdminNav />

      <main className="container mx-auto px-8 py-8 max-w-7xl space-y-6 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-[#2B1E1A]">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Overview of your supply chain traceability network & inventory
          </p>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-[#E11D48] uppercase tracking-wider">Today's Revenue</span>
              <p className="text-2xl font-black text-[#2B1E1A] mt-1">₦{todaysRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl text-[#E11D48]"><TrendingUp className="h-5 w-5" /></div>
          </div>

          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total Revenue</span>
              <p className="text-2xl font-black text-[#2B1E1A] mt-1">₦{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-gray-500"><Activity className="h-5 w-5" /></div>
          </div>

          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total Orders</span>
              <p className="text-2xl font-black text-[#2B1E1A] mt-1">{totalOrders}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><ShoppingBag className="h-5 w-5" /></div>
          </div>

          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Product Batches</span>
              <p className="text-2xl font-black text-[#2B1E1A] mt-1">{totalProducts}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><Package className="h-5 w-5" /></div>
          </div>

          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Minted On-Chain</span>
              <p className="text-2xl font-black text-green-600 mt-1">{mintedBatches}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl text-green-600"><CheckCircle2 className="h-5 w-5" /></div>
          </div>
        </div>

        {/* Dynamic Charts Grid (2x2 Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Monthly Revenue Bar Chart */}
          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#2B1E1A]">Monthly Revenue (YTD)</h3>
            <div className="h-56 w-full text-[10px] font-bold">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE2DC" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} width={45} tickFormatter={(val) => `₦${val/1000}k`} />
                  <RechartsTooltip cursor={{fill: '#FAF6F3'}} contentStyle={{borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="revenue" fill="#E11D48" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Orders Bar Chart */}
          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#2B1E1A]">Daily Orders (Last 7 Days)</h3>
            <div className="h-56 w-full text-[10px] font-bold">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE2DC" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} width={25} allowDecimals={false} />
                  <RechartsTooltip cursor={{fill: '#FAF6F3'}} contentStyle={{borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="orders" fill="#2B1E1A" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NEW: Sales by Product Bar Chart */}
          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#2B1E1A]">Sales by Product (Top 5)</h3>
            <div className="h-56 w-full text-[10px] font-bold">
              {productSalesData.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-xs text-gray-400 font-bold">No product sales yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productSalesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE2DC" />
                    {/* Truncating long product names so they fit neatly */}
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} dy={10} tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} width={25} allowDecimals={false} />
                    <RechartsTooltip cursor={{fill: '#FAF6F3'}} contentStyle={{borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="sales" fill="#FB7185" radius={[4, 4, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#2B1E1A]">Sales by Category</h3>
            <div className="h-56 w-full flex items-center justify-center">
              {categoryData.length === 0 ? (
                <p className="text-xs text-gray-400 font-bold">No order data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Row: Traceability Health, Inventory Alerts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Traceability Status */}
          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="font-extrabold text-sm text-[#2B1E1A]">Traceability Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#FAF6F3] rounded-xl border border-[#EAE2DC]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs font-bold text-[#2B1E1A]">Minted on NEAR</p>
                    <p className="text-[10px] text-gray-500 font-medium">Secured on blockchain</p>
                  </div>
                </div>
                <span className="text-lg font-black text-green-600">{mintedBatches}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#FAF6F3] rounded-xl border border-[#EAE2DC]">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-[#2B1E1A]">Pending Mints</p>
                    <p className="text-[10px] text-gray-500 font-medium">Awaiting network validation</p>
                  </div>
                </div>
                <span className="text-lg font-black text-amber-600">{pendingBatches}</span>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#2B1E1A]">Inventory Alerts</h3>
              <span className="bg-rose-100 text-[#E11D48] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {lowStockProducts.length} Action Needed
              </span>
            </div>
            
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p className="text-xs font-bold">All batches sufficiently stocked.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 3).map(p => (
                  <div key={p.id} className="flex justify-between items-center border-b border-[#EAE2DC] pb-2 last:border-0">
                    <div>
                      <p className="text-xs font-bold text-[#2B1E1A]">{p.name}</p>
                      <p className="text-[10px] font-mono text-gray-500">{p.batchId}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#E11D48]">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span className="text-xs font-extrabold">{p.quantityAvailable} left</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white border border-[#EAE2DC] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-[#2B1E1A]">Live Activity</h3>
            </div>
            <div className="space-y-4">
              {orders.slice(0, 4).map((o) => (
                <div key={o.id} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-[#E11D48] mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-xs font-medium text-[#2B1E1A]">
                      <span className="font-bold">{o.customerName || 'Customer'}</span> placed an order for <span className="font-bold">{o.blendName}</span>
                    </p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-xs text-gray-400 font-bold">No recent activity.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
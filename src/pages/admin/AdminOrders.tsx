import { useState, useEffect } from 'react';
import AdminNav from '@/components/AdminNav';
import { db } from '@/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Search, MoreVertical, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  batchId?: string;
  orderId?: string;
  userEmail?: string;
  customerName?: string;
  buyerType?: string;
  blendName?: string;
  quantity?: number;
  status?: string;
  createdAt?: any;
  price?: number;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as OrderItem[];
      setOrders(items);
    });

    return () => unsub();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
      });
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating order status.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const orderIdentifier = o.batchId || o.orderId || o.id;
    const email = o.userEmail || '';

    const matchesSearch =
      orderIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All Statuses' || o.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#2B1E1A] font-sans">
      <AdminNav />

      <main className="container mx-auto px-6 py-8 max-w-6xl space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-black text-[#2B1E1A]">Orders</h1>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3 max-w-lg">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E7E0D5] rounded-xl pl-10 pr-4 py-2 text-xs text-[#2B1E1A] font-medium focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-[#E7E0D5] rounded-xl px-4 py-2 text-xs text-[#2B1E1A] font-bold focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] w-full md:w-auto"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Accepted">Accepted</option>
            <option value="Preparing">Preparing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {/* Table UI */}
        <div className="bg-white border border-[#E7E0D5] rounded-3xl shadow-sm">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7E0D5] text-[11px] font-extrabold text-gray-400">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Buyer Type</th>
                  <th className="py-3.5 px-6">Qty</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-4 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D5] text-xs font-semibold text-[#2B1E1A]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No customer orders found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const displayId = o.batchId || o.orderId || `ORD-${o.id.slice(-6).toUpperCase()}`;
                    const formattedDate = o.createdAt?.toDate
                      ? o.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Aug 8, 2026';

                    const isDropdownOpen = openDropdownId === o.id;

                    return (
                      <tr key={o.id} className="hover:bg-gray-50/60 transition relative">
                        <td className="py-4 px-6 font-mono text-gray-400 text-[11px]">
                          {displayId}
                        </td>

                        <td className="py-4 px-6 font-bold text-[#2B1E1A]">
                          {o.userEmail || 'customer@example.com'}
                        </td>

                        <td className="py-4 px-6">
                          <span className="bg-[#EFE8DE] text-[#2B1E1A] font-extrabold text-[10px] px-3 py-1 rounded-full">
                            {o.buyerType || 'Consumer'}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-bold text-[#2B1E1A]">
                          {o.quantity || 1}
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold ${
                              o.status === 'Delivered'
                                ? 'bg-[#2D6A4F] text-white'
                                : o.status === 'Accepted'
                                ? 'bg-emerald-50 text-emerald-800'
                                : o.status === 'Shipped' || o.status === 'Preparing'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-[#EFE8DE] text-gray-600'
                            }`}
                          >
                            {o.status || 'Accepted'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-gray-500 font-medium">
                          {formattedDate}
                        </td>

                        <td className="py-4 px-4 text-center relative">
                          <button
                            onClick={() => setOpenDropdownId(isDropdownOpen ? null : o.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute right-6 top-12 w-40 bg-white border border-[#E7E0D5] rounded-2xl shadow-xl z-50 py-2 text-left space-y-0.5 text-[11px] font-extrabold text-gray-600">
                              <button
                                onClick={() => handleUpdateStatus(o.id, 'Pending')}
                                className="w-full text-left px-4 py-1.5 hover:bg-gray-50 hover:text-[#2B1E1A]"
                              >
                                Mark as Pending
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(o.id, 'Accepted')}
                                className="w-full text-left px-4 py-1.5 hover:bg-gray-50 hover:text-[#2B1E1A]"
                              >
                                Mark as Accepted
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(o.id, 'Preparing')}
                                className="w-full text-left px-4 py-1.5 hover:bg-gray-50 hover:text-[#2B1E1A]"
                              >
                                Mark as Preparing
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(o.id, 'Shipped')}
                                className="w-full text-left px-4 py-1.5 hover:bg-gray-50 hover:text-[#2B1E1A]"
                              >
                                Mark as Shipped
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(o.id, 'Delivered')}
                                className="w-full text-left px-4 py-1.5 hover:bg-gray-50 hover:text-[#2B1E1A]"
                              >
                                Mark as Delivered
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
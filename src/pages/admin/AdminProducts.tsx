import { useState, useEffect } from 'react';
import AdminNav from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { QrCode, Printer, ExternalLink, Plus, Package } from 'lucide-react';

interface ProductBatch {
  id: string;
  name?: string;
  batchId?: string;
  category?: string;
  price?: number;
  quantityAvailable?: number;
  producedDate?: string;
  expiryDate?: string;
  producedBy?: string;
  chainTxHash?: string;
  notes?: string;
  ingredients?: string[];
  imageUrl?: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductBatch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [qrModalBatch, setQrModalBatch] = useState<ProductBatch | null>(null);
  const [printModalBatch, setPrintModalBatch] = useState<ProductBatch | null>(null);

  // Form Fields (Defaults removed, Price added)
  const [batchCode, setBatchCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Smoothies');
  const [price, setPrice] = useState(''); // <-- Added Price state
  const [quantity, setQuantity] = useState(''); // <-- Default removed
  const [producedBy, setProducedBy] = useState(''); // <-- Default removed
  const [producedDate, setProducedDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductBatch[];
      setProducts(items);
    });

    return () => unsub();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const finalBatchCode = batchCode.trim() || `MX-BATCH-${Math.floor(100000 + Math.random() * 900000)}`;
      const finalName = name || 'Organic Fruit Beverage';
      const finalCategory = category || 'Smoothies';
      const finalProducedBy = producedBy.trim() || 'Admin';
      const finalProducedDate = producedDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const finalExpiryDate = expiryDate || '16 Jan 2030';
      const finalImageUrl = imageUrl.trim() || 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500';
      
      const ingredientsList = ingredientsInput
        ? ingredientsInput.split(',').map((i) => i.trim())
        : ['Fresh Organic Produce', 'Natural Spring Water'];

      // 1. Save product batch to Firebase
      const productRef = await addDoc(collection(db, 'products'), {
        name: finalName,
        category: finalCategory,
        batchId: finalBatchCode,
        producedBy: finalProducedBy,
        producedDate: finalProducedDate,
        expiryDate: finalExpiryDate,
        imageUrl: finalImageUrl,
        chainTxHash: 'Minting on-chain...', 
        ingredients: ingredientsList,
        price: Number(price) || 0, // <-- Dynamically grabs your inputted price
        quantityAvailable: Number(quantity) || 0, // <-- Dynamically grabs your inputted quantity
        createdAt: serverTimestamp(),
      });

      // 2. Save a shadow record to Orders so the Python API successfully captures and updates it
      await addDoc(collection(db, 'orders'), {
        blendName: finalName,
        batchId: finalBatchCode,
        type: 'Admin Product Batch',
        status: 'Batch Minted',
        price: 0,
        ingredients: ingredientsList,
        createdAt: serverTimestamp(),
        isMintedOnChain: false
      });

      // 3. Automatically trigger your Python FastAPI Backend to mint live on NEAR
      try {
        const response = await fetch('http://localhost:8000/api/mint-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId: finalBatchCode,
            blendName: finalName,
            producedBy: finalProducedBy,
            ingredients: ingredientsList,
          }),
        });

        const result = await response.json();

        // 4. Update product document with the real live NEAR transaction hash
        if (result.status === 'success') {
          await updateDoc(doc(db, 'products', productRef.id), {
            chainTxHash: result.nearHash
          });
        }
      } catch (backendError) {
        console.error("Could not connect to Python backend for auto-minting:", backendError);
      }

      // Reset Form fields completely blank
      setBatchCode('');
      setName('');
      setCategory('Smoothies');
      setPrice('');
      setQuantity('');
      setProducedBy('');
      setProducedDate('');
      setExpiryDate('');
      setIngredientsInput('');
      setImageUrl('');
      setShowModal(false);
      alert(`Batch ${finalBatchCode} logged and automatically minted to NEAR blockchain!`);
    } catch (err) {
      console.error('Error adding batch:', err);
      alert('Error creating batch.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintAction = (p: ProductBatch) => {
    setPrintModalBatch(p);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F3] text-[#2B1E1A] font-sans">
      <AdminNav />

      {/* Main Workspace */}
      <main className="container mx-auto px-8 py-8 max-w-7xl space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#2B1E1A]">Product Batches & Menu Inventory</h1>

          <Button
            onClick={() => setShowModal(true)}
            className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-xs rounded-xl px-5 py-2.5 shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Log New Batch
          </Button>
        </div>

        {/* Batches Table */}
        <div className="bg-white border border-[#EAE2DC] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5EFEA]/60 border-b border-[#EAE2DC] text-[11px] font-extrabold text-gray-500">
                  <th className="py-3.5 px-6">Image</th>
                  <th className="py-3.5 px-6">Batch Code</th>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Price</th> {/* <-- Added Price Header */}
                  <th className="py-3.5 px-6">Produced</th>
                  <th className="py-3.5 px-6">Qty</th>
                  <th className="py-3.5 px-6">Expiry</th>
                  <th className="py-3.5 px-6">Produced By</th>
                  <th className="py-3.5 px-6">NEAR Tx</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2DC] text-xs font-semibold text-[#2B1E1A]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-gray-400">
                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No product batches logged yet.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((p, idx) => {
                    const isMinted = Boolean(p.chainTxHash && p.chainTxHash.trim().length > 0 && p.chainTxHash !== 'Minting on-chain...');
                    const safeBatchCode = p.batchId || `MX-BATCH-${(100000 + idx * 57).toString()}`;
                    const safeProductName = p.name || 'Organic Fruit Smoothie';

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-6">
                          <img 
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500'} 
                            alt={safeProductName} 
                            className="w-10 h-10 rounded-xl object-cover border border-[#EAE2DC]"
                          />
                        </td>
                        <td className="py-4 px-6 font-mono text-gray-600 text-[11px] font-bold">
                          {safeBatchCode}
                        </td>

                        <td className="py-4 px-6 font-bold text-[#2B1E1A]">
                          {safeProductName}
                        </td>

                        <td className="py-4 px-6">
                          <span className="bg-[#FAF6F3] text-[#E11D48] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#EAE2DC]">
                            {p.category || 'Smoothies'}
                          </span>
                        </td>
                        
                        {/* <-- Added Price Data */}
                        <td className="py-4 px-6 font-extrabold text-[#E11D48]">
                          ₦{p.price?.toLocaleString() || 0}
                        </td>

                        <td className="py-4 px-6 text-gray-500 font-medium">
                          {p.producedDate || '4 Aug 2026'}
                        </td>

                        <td className="py-4 px-6 font-bold text-[#2B1E1A]">
                          {p.quantityAvailable ?? 0}
                        </td>

                        <td className="py-4 px-6 text-gray-500 font-medium">
                          {p.expiryDate || '16 Jan 2030'}
                        </td>

                        <td className="py-4 px-6 text-gray-600 font-medium">
                          {p.producedBy || 'Admin'}
                        </td>

                        <td className="py-4 px-6">
                          {isMinted ? (
                            <a
                              href={`https://explorer.testnet.near.org/transactions/${p.chainTxHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 bg-[#E11D48] hover:bg-[#BE123C] text-white text-[10px] font-extrabold px-3 py-1 rounded-full transition shadow-sm"
                            >
                              Verified <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">
                              {p.chainTxHash === 'Minting on-chain...' ? 'Minting...' : 'Not minted'}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setQrModalBatch({ ...p, batchId: safeBatchCode, name: safeProductName })}
                              className="bg-[#F5EFEA] hover:bg-[#EAE2DC] text-[#2B1E1A] text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                            >
                              <QrCode className="h-3 w-3" /> QR
                            </button>
                            <button
                              onClick={() => handlePrintAction({ ...p, batchId: safeBatchCode, name: safeProductName })}
                              className="bg-[#F5EFEA] hover:bg-[#EAE2DC] text-[#2B1E1A] text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                            >
                              <Printer className="h-3 w-3" /> Print
                            </button>
                          </div>
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

      {/* Modal 1: Log New Batch Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#EAE2DC]">
            <div className="flex justify-between items-center pb-1">
              <h3 className="font-extrabold text-base text-[#2B1E1A]">Log New Product Batch</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs text-[#2B1E1A]">
              <div>
                <input
                  type="text"
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  placeholder="Batch Code (e.g. MX-BATCH-500617)"
                  className="w-full bg-white border border-[#EAE2DC] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E11D48] text-xs font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Product Name"
                    className="w-full bg-white border border-[#EAE2DC] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E11D48] text-xs font-medium"
                    required
                  />
                </div>

                <div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-[#EAE2DC] rounded-xl px-2 py-2.5 focus:outline-none focus:border-[#E11D48] text-xs font-bold"
                  >
                    <option value="Smoothies">Smoothie</option>
                    <option value="Juices">Juice</option>
                    <option value="Parfaits">Parfait</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Production Date</label>
                  <input
                    type="date"
                    value={producedDate}
                    onChange={(e) => setProducedDate(e.target.value)}
                    className="w-full bg-white border border-[#EAE2DC] rounded-xl px-3 py-2 focus:outline-none focus:border-[#E11D48] text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-white border border-[#EAE2DC] rounded-xl px-3 py-2 focus:outline-none focus:border-[#E11D48] text-xs font-medium"
                  />
                </div>
              </div>

              {/* THREE COLUMN GRID: Produced By, Quantity, and Price */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    value={producedBy}
                    onChange={(e) => setProducedBy(e.target.value)}
                    placeholder="Produced By"
                    className="w-full bg-white border border-[#EAE2DC] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E11D48] text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Qty"
                    className="w-full bg-white border border-[#EAE2DC] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E11D48] text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price (₦)"
                    className="w-full bg-white border border-[#EAE2DC] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E11D48] text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image URL (e.g. https://...image.jpg)"
                  className="w-full bg-white border border-[#EAE2DC] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E11D48] text-xs font-medium"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={ingredientsInput}
                  onChange={(e) => setIngredientsInput(e.target.value)}
                  placeholder="Ingredients (comma separated e.g. Mango, Oat Milk)"
                  className="w-full bg-white border border-[#EAE2DC] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E11D48] text-xs font-medium"
                />
                <p className="text-[10px] text-gray-400 mt-1 font-medium">These will be permanently embedded onto the NEAR blockchain.</p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold rounded-xl py-3 text-xs shadow-md"
                >
                  {submitting ? 'Minting on NEAR Blockchain...' : 'Create & Mint Batch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: QR Code Viewer */}
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
            <div className="border-b pb-2 border-gray-200">
              <h2 className="font-extrabold text-sm text-[#E11D48] uppercase tracking-wider">Mixit Smoothies</h2>
              <p className="font-mono text-xs font-extrabold text-[#2B1E1A]">{printModalBatch.name}</p>
            </div>

            <div className="p-2 bg-white rounded-xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x180&data=${encodeURIComponent(
                  `${window.location.origin}/trace?batchId=${printModalBatch.batchId}`
                )}`}
                alt="Product Batch QR Label"
                className="w-36 h-36 mx-auto"
              />
            </div>

            <div className="text-[10px] space-y-0.5 font-bold text-gray-600 border-t pt-2 border-gray-200">
              <p className="font-mono text-[#2B1E1A]">Batch: {printModalBatch.batchId}</p>
              <p>Produced: {printModalBatch.producedDate || '4 Aug 2026'}</p>
              <p>Expiry: {printModalBatch.expiryDate || '16 Jan 2030'}</p>
              <p className="text-[#E11D48] pt-1">Scan for Provenance & NEAR Blockchain Tag</p>
            </div>

            <div className="pt-2 print:hidden flex gap-2">
              <Button
                onClick={() => setPrintModalBatch(null)}
                className="w-1/2 bg-gray-200 text-[#2B1E1A] hover:bg-gray-300 font-bold rounded-xl text-xs py-1.5"
              >
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                className="w-1/2 bg-[#E11D48] text-white hover:bg-[#BE123C] font-bold rounded-xl text-xs py-1.5"
              >
                Print Label
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
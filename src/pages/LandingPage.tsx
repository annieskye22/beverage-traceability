import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicNav from '@/components/PublicNav';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Leaf, Coffee, PartyPopper, Clock, Phone, Mail, MapPin, Search, CheckCircle2, ArrowRight } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ProductBatch {
  id: string;
  name: string;
  category: string;
  price?: number;
  quantityAvailable?: number;
  imageUrl?: string;
  batchId?: string;
  ingredients?: string;
  supplier?: string;
  origin?: string;
  harvestDate?: string;
  status?: string;
  chainTxHash?: string;
}

const DEFAULT_MENU_PRODUCTS: ProductBatch[] = [
  { id: 'p1', name: 'Tropical Bliss Smoothie', category: 'Smoothies', price: 2500, quantityAvailable: 30, imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80', ingredients: 'A refreshing blend of ripe mango, pineapple, and coconut milk, perfect for a hot summer day.' },
  { id: 'p2', name: 'Berry Parfait Delight', category: 'Parfaits', price: 3000, quantityAvailable: 25, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', ingredients: 'Layered Greek yogurt, granola, and organic fresh berries.' },
  { id: 'p3', name: 'Tropical Paradise', category: 'Smoothies', price: 2500, quantityAvailable: 20, imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80', ingredients: 'A rich blend of pineapple, mango & banana for that vacation vibe.' },
  { id: 'p4', name: 'Berry Blast', category: 'Smoothies', price: 2800, quantityAvailable: 15, imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80', ingredients: 'Strawberries, blueberries & raspberries mixed for a fruity punch.' },
  { id: 'p5', name: 'Green Detox', category: 'Smoothies', price: 3000, quantityAvailable: 10, imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80', ingredients: 'Spinach, kale, apple & ginger for a refreshing cleanse.' },
  { id: 'p6', name: 'Choco Banana', category: 'Smoothies', price: 2700, quantityAvailable: 18, imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80', ingredients: 'A creamy mix of banana, cocoa & almond milk.' },
  { id: 'p7', name: 'Classic Yogurt Parfait', category: 'Parfaits', price: 3000, quantityAvailable: 12, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', ingredients: 'Creamy yogurt topped with honey and toasted oats.' },
];

const FRUIT_OPTIONS = ['Beetroot', 'Mango', 'Banana', 'Pineapple', 'Watermelon', 'Coconut', 'Strawberry'];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [menuProducts, setMenuProducts] = useState<ProductBatch[]>(DEFAULT_MENU_PRODUCTS);
  const [activeTab, setActiveTab] = useState('Smoothies');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Blend State
  const [base, setBase] = useState('Oat Milk');
  const [selectedFruits, setSelectedFruits] = useState<string[]>(['Mango']);
  const [booster, setBooster] = useState('Chia Seeds');
  const [sweetness, setSweetness] = useState(3);
  const [ice, setIce] = useState(2);
  const [size, setSize] = useState<'500ml' | '750ml'>('500ml');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const liveItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProductBatch[];
        setMenuProducts(liveItems);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (user?.email) {
      setCustomerName(user.email.split('@')[0]);
    }
  }, [user]);

  const filteredProducts = menuProducts.filter(
    (p) => activeTab === 'All' || p.category === activeTab
  );

  const filteredIngredients = menuProducts.filter((ing) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    
    return (
      (ing.name && ing.name.toLowerCase().includes(q)) ||
      (ing.batchId && ing.batchId.toLowerCase().includes(q)) ||
      (ing.id && ing.id.toLowerCase().includes(q)) ||
      (ing.ingredients && ing.ingredients.toLowerCase().includes(q)) ||
      (ing.supplier && ing.supplier.toLowerCase().includes(q)) ||
      (ing.origin && ing.origin.toLowerCase().includes(q))
    );
  });

  const toggleFruit = (fruit: string) => {
    if (selectedFruits.includes(fruit)) {
      setSelectedFruits(selectedFruits.filter((f) => f !== fruit));
    } else {
      if (selectedFruits.length < 3) {
        setSelectedFruits([...selectedFruits, fruit]);
      }
    }
  };

  const customBlendPrice = size === '500ml' ? 3000 : 4500;
  const customBlendName = `Custom Smoothie (${base} + ${selectedFruits.join(', ') || 'No Fruit'} + ${booster})`;

  const addCustomBlendToOrder = () => {
    const customItem: CartItem = {
      id: `custom-${Date.now()}`,
      name: customBlendName,
      price: customBlendPrice,
      quantity: 1,
    };
    setCart((prev) => [...prev, customItem]);
    document.getElementById('quick-order')?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateQuantity = (product: ProductBatch, delta: number) => {
    const pPrice = product.price || 2500;
    const maxQty = product.quantityAvailable ?? 50;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (!existing) {
        if (delta > 0 && maxQty > 0) {
          return [...prev, { id: product.id, name: product.name, price: pPrice, quantity: 1 }];
        }
        return prev;
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter((item) => item.id !== product.id);
      if (newQty > maxQty) return prev;
      return prev.map((item) => (item.id === product.id ? { ...item, quantity: newQty } : item));
    });
  };

  const getQuantity = (id: string) => cart.find((item) => item.id === id)?.quantity || 0;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const orderBatchId = `ORD-${Date.now().toString().slice(-6)}`;
      const blendSummary = cart.map((i) => `${i.quantity}x ${i.name}`).join(', ');
      
      // Map cart items into an ingredients array for the blockchain
      const orderIngredients = cart.map((i) => `${i.quantity}x ${i.name}`);

      // 1. Save to Firebase first to establish the record
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        customerName: customerName || user.email?.split('@')[0],
        customerPhone: customerPhone || 'N/A',
        blendName: blendSummary,
        price: totalAmount,
        batchId: orderBatchId,
        ingredients: orderIngredients, 
        status: 'Order Placed',
        createdAt: serverTimestamp(),
        nearHash: 'Minting on-chain...', // Temporary placeholder
        chainHash: 'Minting on-chain...', 
        isMintedOnChain: false
      });

      // 2. Call Python FastAPI Backend to mint on NEAR
      try {
        console.log("Sending payload to Python Blockchain API...");
        const response = await fetch('http://localhost:8000/api/mint-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId: orderBatchId,
            blendName: 'Mixit Menu Order',
            producedBy: 'Mixit Smoothies Lab',
            ingredients: orderIngredients,
          }),
        });
        
        const result = await response.json();
        if (result.status === 'success') {
          console.log('Successfully minted! Real Hash:', result.nearHash);
        }
      } catch (backendError) {
        console.error("Could not connect to Python backend:", backendError);
      }

      // 3. Send Confirmation Email
      try {
        await emailjs.send(
          'service_3y8pnal',
          'template_cn7438a',
          {
            email: user.email,
            to_email: user.email,
            to_name: customerName || user.email?.split('@')[0] || 'Customer',
            blend_name: blendSummary,
            price: totalAmount.toLocaleString(),
            order_id: orderBatchId,
            trace_url: `${window.location.origin}/trace?batchId=${orderBatchId}`,
          },
          'ewL2M5jOKzkY8lP4F'
        );
      } catch (emailErr) {
        console.error('Email dispatch error:', emailErr);
      }

      setCart([]);
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#2B1E1A] font-sans scroll-smooth">
      <PublicNav />

      {/* Hero Banner Section */}
      <section className="relative w-full min-h-[75vh] bg-[#1C2822] text-white flex flex-col justify-center overflow-hidden pt-12 pb-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: 'url("https://images.fillout.com/801731/fnsfxmcbeq/generated-images/ngiCbB5trtZhNYHm1YXvJh/img_8_xYjyg6ztwtzCxL.jpg")' }}
        />

        {/* Floating Fruit Accents */}
        <div className="absolute top-12 left-10 text-3xl animate-bounce opacity-80 pointer-events-none">🍓</div>
        <div className="absolute top-1/3 right-12 text-3xl animate-pulse opacity-80 pointer-events-none">🥝</div>
        <div className="absolute bottom-24 left-1/4 text-3xl animate-bounce opacity-80 pointer-events-none">🫐</div>

        <div className="relative container mx-auto px-6 text-center max-w-3xl space-y-5 z-10">
          <p className="text-xs uppercase font-extrabold tracking-widest text-[#E11D48]">
            Wholesome Treats
          </p>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wide leading-tight text-white">
            PERFECT PARFAITS
          </h1>

          <div className="pt-2">
            <a href="#menu">
              <Button size="lg" className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold rounded-full px-8 py-3 text-xs shadow-md">
                View Menu
              </Button>
            </a>
          </div>
        </div>

        {/* Curved Wave Bottom Divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none z-10">
          <svg className="relative block w-full h-12 text-[#FDF8F5]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-6 py-16 max-w-6xl scroll-mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80"
              alt="Mixit Smoothie Bowls"
              className="w-full h-[380px] object-cover"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-[#2B1E1A] leading-tight">
              Welcome To Mixit Smoothies
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              We craft experiences, not just refreshments. What began with a passion for perfect smoothies has blossomed into a creative hub where fresh flavors meet unforgettable moments. From energizing smoothies and layered parfaits to juices, we bring vibrant taste to every occasion.
            </p>

            <a href="#build-blend">
              <Button className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-xl px-6 py-2 shadow-sm">
                Discover More
              </Button>
            </a>

            {/* Features Row */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="bg-white p-3 rounded-2xl text-center border border-[#E7E0D5] shadow-sm space-y-1">
                <Leaf className="h-5 w-5 text-[#E11D48] mx-auto" />
                <p className="text-[11px] font-extrabold text-[#2B1E1A]">Fresh Ingredients</p>
              </div>
              <div className="bg-white p-3 rounded-2xl text-center border border-[#E7E0D5] shadow-sm space-y-1">
                <Coffee className="h-5 w-5 text-[#E11D48] mx-auto" />
                <p className="text-[11px] font-extrabold text-[#2B1E1A]">Signature Blends</p>
              </div>
              <div className="bg-white p-3 rounded-2xl text-center border border-[#E7E0D5] shadow-sm space-y-1">
                <PartyPopper className="h-5 w-5 text-[#E11D48] mx-auto" />
                <p className="text-[11px] font-extrabold text-[#2B1E1A]">Bold Celebrations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16 bg-[#FDF8F5] scroll-mt-16">
        <div className="container mx-auto px-6 max-w-6xl text-center space-y-8">
          <div>
            <p className="text-xs uppercase font-extrabold tracking-widest text-[#E11D48]">OUR MENU</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#2B1E1A] mt-1">Refreshing Delights</h2>
          </div>

          {/* Rose Pink Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Smoothies', 'Parfaits', 'Cocktails', 'Juices', 'Gifts'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2 rounded-full text-xs font-extrabold transition ${
                  activeTab === cat
                    ? 'bg-[#E11D48] text-white shadow-sm'
                    : 'bg-[#FFF0F3] text-[#BE123C] hover:bg-[#FCE7F0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Clean White Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col justify-between"
              >
                {/* Image Box with Floating White Price Pill */}
                <div className="relative h-48 w-full bg-gray-100">
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Price Badge on Bottom Right of Image */}
                  <span className="absolute bottom-3 right-3 bg-white text-[#2B1E1A] font-black text-xs px-3 py-1 rounded-full shadow-md">
                    ₦{(p.price || 2500).toLocaleString()}
                  </span>
                </div>

                {/* Card Content Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-[#2B1E1A]">{p.name}</h3>
                      <a href="#quick-order" className="w-7 h-7 rounded-full bg-[#FFF0F3] text-[#BE123C] hover:bg-[#FCE7F0] flex items-center justify-center transition">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {p.ingredients || 'Fresh blend of natural fruits & wholesome ingredients'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Build Your Perfect Smoothie Section */}
      <section id="build-blend" className="py-16 bg-[#FFF0F3]/40 scroll-mt-16 border-y border-pink-100">
        <div className="container mx-auto px-6 max-w-4xl text-center space-y-8">
          <div>
            <p className="text-xs uppercase font-extrabold tracking-widest text-[#E11D48]">CUSTOM BLEND</p>
            <h2 className="text-3xl font-black text-[#2B1E1A] mt-1">Build Your Perfect Smoothie</h2>
            <p className="text-xs text-gray-500 mt-1">Choose a base, pick up to 3 fruits, and add a booster</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left items-start">
            <div className="md:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2B1E1A]">Base</label>
                <select
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  className="w-full bg-[#FFF0F3]/50 border border-pink-100 rounded-xl px-4 py-2.5 text-xs text-[#2B1E1A] font-bold focus:outline-none focus:ring-1 focus:ring-[#E11D48]"
                >
                  <option value="Oat Milk">Oat Milk</option>
                  <option value="Almond Milk">Almond Milk</option>
                  <option value="Coconut Water">Coconut Water</option>
                  <option value="Greek Yogurt Base">Greek Yogurt Base</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2B1E1A]">Fruits (up to 3)</label>
                <div className="flex flex-wrap gap-2">
                  {FRUIT_OPTIONS.map((fruit) => {
                    const isSelected = selectedFruits.includes(fruit);
                    return (
                      <button
                        key={fruit}
                        type="button"
                        onClick={() => toggleFruit(fruit)}
                        className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition ${
                          isSelected
                            ? 'bg-[#E11D48] text-white shadow-sm'
                            : 'bg-[#FFF0F3] text-[#BE123C] hover:bg-[#FCE7F0]'
                        }`}
                      >
                        {fruit}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2B1E1A]">Booster</label>
                <select
                  value={booster}
                  onChange={(e) => setBooster(e.target.value)}
                  className="w-full bg-[#FFF0F3]/50 border border-pink-100 rounded-xl px-4 py-2.5 text-xs text-[#2B1E1A] font-bold focus:outline-none focus:ring-1 focus:ring-[#E11D48]"
                >
                  <option value="Chia Seeds">Chia Seeds</option>
                  <option value="Whey Protein">Whey Protein</option>
                  <option value="Flax Seeds">Flax Seeds</option>
                  <option value="Peanut Butter">Peanut Butter</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span>Sweetness: {sweetness}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={sweetness}
                    onChange={(e) => setSweetness(Number(e.target.value))}
                    className="w-full accent-[#E11D48]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span>Ice: {ice}/5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={ice}
                    onChange={(e) => setIce(Number(e.target.value))}
                    className="w-full accent-[#E11D48]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-extrabold text-[#2B1E1A]">Size</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSize('500ml')}
                    className={`px-5 py-2 rounded-full text-xs font-extrabold transition ${
                      size === '500ml'
                        ? 'bg-[#E11D48] text-white shadow-sm'
                        : 'bg-[#FFF0F3] text-[#BE123C]'
                    }`}
                  >
                    500ml
                  </button>
                  <button
                    type="button"
                    onClick={() => setSize('750ml')}
                    className={`px-5 py-2 rounded-full text-xs font-extrabold transition ${
                      size === '750ml'
                        ? 'bg-[#E11D48] text-white shadow-sm'
                        : 'bg-[#FFF0F3] text-[#BE123C]'
                    }`}
                  >
                    750ml
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="md:col-span-5 bg-white rounded-3xl p-6 space-y-6 shadow-sm border border-gray-100">
              <div className="space-y-2">
                <h3 className="font-extrabold text-base text-[#2B1E1A]">Your Smoothie</h3>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  {base} + {selectedFruits.join(' + ') || 'No Fruit'} + {booster}
                </p>
                <p className="text-[11px] text-gray-400 font-semibold">
                  Sweetness: {sweetness}/5 • Ice: {ice}/5 • Size: {size}
                </p>
              </div>

              <div className="text-2xl font-black text-[#E11D48]">
                ₦{customBlendPrice.toLocaleString()}
              </div>

              <Button
                onClick={addCustomBlendToOrder}
                className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold rounded-full py-3 text-xs shadow-sm"
              >
                Order This Blend
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Place Your Order Section */}
      <section id="quick-order" className="py-16 bg-[#FDF8F5] scroll-mt-16">
        <div className="container mx-auto px-6 max-w-2xl text-center space-y-6">
          <div>
            <h2 className="text-3xl font-black text-[#2B1E1A]">Place Your Order</h2>
            <p className="text-xs text-gray-500 mt-1">Select items, enter your details, and submit</p>
          </div>

          <div className="flex justify-center gap-3">
            <button className="bg-[#E11D48] text-white text-xs font-bold px-6 py-2 rounded-full shadow-sm">
              New Order
            </button>
            <Link to="/orders">
              <button className="bg-[#FFF0F3] text-[#BE123C] hover:bg-[#FCE7F0] text-xs font-bold px-6 py-2 rounded-full transition">
                My Orders
              </button>
            </Link>
          </div>

          <form onSubmit={handlePlaceOrder} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#2B1E1A]">Name</label>
                <input
                  type="text"
                  placeholder="Stephanie Eze"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#FFF0F3]/40 border border-pink-100 rounded-xl px-4 py-2.5 text-xs text-[#2B1E1A] focus:outline-none focus:ring-1 focus:ring-[#E11D48]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#2B1E1A]">Phone</label>
                <input
                  type="text"
                  placeholder="+234..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#FFF0F3]/40 border border-pink-100 rounded-xl px-4 py-2.5 text-xs text-[#2B1E1A] focus:outline-none focus:ring-1 focus:ring-[#E11D48]"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {menuProducts.map((p) => {
                const qty = getQuantity(p.id);
                const itemPrice = p.price || 2500;
                const itemTotal = qty * itemPrice;
                const isSoldOut = (p.quantityAvailable ?? 50) <= 0;

                return (
                  <div key={p.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="font-extrabold text-[#2B1E1A] flex items-center gap-3">
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-gray-100"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{p.name}</span>
                          {isSoldOut && (
                            <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                              Sold Out
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400 font-semibold block text-[11px]">
                          ₦{itemPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(p, -1)}
                          className="w-6 h-6 rounded-full bg-[#FFF0F3] text-[#BE123C] font-bold text-xs flex items-center justify-center hover:bg-[#FCE7F0]"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-xs min-w-[14px] text-center">{qty}</span>
                        <button
                          type="button"
                          disabled={isSoldOut}
                          onClick={() => updateQuantity(p, 1)}
                          className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                            isSoldOut
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-[#E11D48] text-white hover:bg-[#BE123C]'
                          }`}
                        >
                          +
                        </button>
                      </div>

                      <span className="font-extrabold text-xs min-w-[50px] text-right text-[#E11D48]">
                        ₦{itemTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {cart.length > 0 && (
              <div className="pt-2 space-y-3">
                <div className="flex justify-between items-center font-black text-sm text-[#2B1E1A] px-1">
                  <span>Total Order Amount:</span>
                  <span className="text-lg text-[#E11D48]">₦{totalAmount.toLocaleString()}</span>
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-black rounded-full py-3 text-xs shadow-md"
                >
                  {submitting ? 'Submitting Order...' : 'Submit Order'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Traceability Section */}
      <section id="traceability" className="py-16 bg-[#FDF8F5] scroll-mt-16">
        <div className="container mx-auto px-6 max-w-5xl text-center space-y-8">
          <div>
            <p className="text-xs uppercase font-extrabold tracking-widest text-[#E11D48]">TRANSPARENCY</p>
            <h2 className="text-3xl font-black text-[#2B1E1A] mt-1">Know Your Ingredients</h2>
            <p className="text-xs text-gray-500 mt-1">Every ingredient traced from farm to cup</p>
          </div>

          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ingredient or batch ID (e.g. BATCH001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-pink-100 rounded-full pl-11 pr-4 py-3 text-xs text-[#2B1E1A] font-medium focus:outline-none focus:ring-1 focus:ring-[#E11D48] shadow-sm"
            />
          </div>

          {filteredIngredients.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md mx-auto text-center space-y-2">
              <p className="text-xs font-bold text-gray-500">No provenance record found for "{searchQuery}"</p>
              <p className="text-[11px] text-gray-400">Double-check the batch ID from your receipt or QR code tag.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-2">
              {filteredIngredients.map((ing) => (
                <div
                  key={ing.id}
                  className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold">
                    <span className="text-[#E11D48] flex items-center gap-1 bg-[#FFF0F3] px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#2B1E1A]">{ing.name}</h3>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Batch: {ing.batchId || ing.id || 'BATCH001'}
                    </p>
                  </div>

                  <div className="space-y-1 text-[11px] pt-1">
                    <div className="flex justify-between text-gray-600">
                      <span>Supplier</span>
                      <span className="font-bold text-[#2B1E1A]">{ing.supplier || 'Local Farmers Co-op'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Origin</span>
                      <span className="font-bold text-[#2B1E1A]">{ing.origin || 'Lagos, Nigeria'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Harvest Date</span>
                      <span className="font-bold text-[#2B1E1A]">{ing.harvestDate || 'Aug 01, 2026'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 items-center">
                      <span>Certifications</span>
                      <span className="font-bold text-[#E11D48] bg-[#FFF0F3] px-2 py-0.5 rounded text-[10px]">
                        Organic
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600 pt-1">
                      <span>Chain Hash</span>
                      <span className="font-mono text-[10px] text-gray-500">
                        {ing.chainTxHash ? `${ing.chainTxHash.slice(0, 14)}...` : '0x8f7d6e5c4b3...'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer Contact Info */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-10">
            <div className="space-y-1.5">
              <Clock className="h-6 w-6 text-[#E11D48] mx-auto mb-1" />
              <h4 className="font-extrabold text-xs text-[#2B1E1A]">Opening Hours</h4>
              <p className="text-[11px] text-gray-600 font-medium">07:00am – 10:00pm</p>
            </div>

            <div className="space-y-1.5">
              <Phone className="h-6 w-6 text-[#E11D48] mx-auto mb-1" />
              <h4 className="font-extrabold text-xs text-[#2B1E1A]">Phone</h4>
              <p className="text-[11px] text-gray-600 font-medium leading-tight">
                +234 704 154 6360<br />+234 703 835 5255
              </p>
            </div>

            <div className="space-y-1.5">
              <Mail className="h-6 w-6 text-[#E11D48] mx-auto mb-1" />
              <h4 className="font-extrabold text-xs text-[#2B1E1A]">Email</h4>
              <p className="text-[11px] text-gray-600 font-medium">mixitsmoothies@gmail.com</p>
            </div>

            <div className="space-y-1.5">
              <MapPin className="h-6 w-6 text-[#E11D48] mx-auto mb-1" />
              <h4 className="font-extrabold text-xs text-[#2B1E1A]">Address</h4>
              <p className="text-[11px] text-gray-600 font-medium">4th Avenue B Close, Lagos, Nigeria</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3 py-4">
            <a href="#" className="w-8 h-8 rounded-full bg-[#FFF0F3] hover:bg-[#E11D48] hover:text-white text-[#BE123C] flex items-center justify-center text-xs font-bold transition">
              f
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#FFF0F3] hover:bg-[#E11D48] hover:text-white text-[#BE123C] flex items-center justify-center text-xs font-bold transition">
              y
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#FFF0F3] hover:bg-[#E11D48] hover:text-white text-[#BE123C] flex items-center justify-center text-xs font-bold transition">
              i
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#FFF0F3] hover:bg-[#E11D48] hover:text-white text-[#BE123C] flex items-center justify-center text-xs font-bold transition">
              in
            </a>
          </div>

          <div className="text-center text-[11px] text-gray-500 font-medium pt-2">
            <p>Created by Stephanie Eze - All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
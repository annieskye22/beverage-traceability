import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '@/components/PublicNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export type Product = {
  id: string;
  productName: string;
  type: string;
  price: number;
  batchNumber?: string;
  description?: string;
  image?: { url: string }[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products from Firestore:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = p.productName?.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || p.type?.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="container mx-auto px-4 md:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Beverages</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="smoothie">Smoothies</SelectItem>
              <SelectItem value="parfait">Parfaits</SelectItem>
              <SelectItem value="juice">Juices</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading beverages from database...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No products found. Add some from the Admin panel!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="group border border-border rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="aspect-[4/3] bg-muted overflow-hidden flex items-center justify-center p-4">
                  {p.image?.[0]?.url ? (
                    <img src={p.image[0].url} alt={p.productName} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <span className="font-semibold text-muted-foreground text-center">{p.productName}</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-foreground">{p.productName}</p>
                  <p className="text-xs text-muted-foreground mb-1">{p.type}</p>
                  {p.batchNumber && (
                    <p className="text-[10px] bg-secondary text-secondary-foreground inline-block px-1.5 py-0.5 rounded font-mono mb-2">
                      Batch: {p.batchNumber}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary">₦{p.price?.toLocaleString()}</span>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
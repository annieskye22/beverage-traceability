import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicNav from '@/components/PublicNav';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { db } from '@/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleOrder = async () => {
    if (!product) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'orders'), {
        blendName: product.productName,
        price: product.price,
        batchId: product.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
        type: product.type || 'Standard Beverage',
        status: 'Order Placed',
        createdAt: serverTimestamp(),
      });

      toast.success(`Order placed for ${product.productName}!`);
      navigate('/orders');
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error('Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNav />
        <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNav />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Product not found.</p>
          <Link to="/products"><Button>Back to Catalog</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-secondary text-secondary-foreground">
              {product.type}
            </span>
            <h1 className="text-3xl font-bold text-foreground mt-2">{product.productName}</h1>
            {product.batchNumber && (
              <p className="text-xs font-mono text-muted-foreground mt-1">Batch ID: {product.batchNumber}</p>
            )}
          </div>

          <div className="border-t border-b border-border py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-2xl font-bold text-primary">₦{product.price?.toLocaleString()}</p>
            </div>
            <Button size="lg" onClick={handleOrder} disabled={submitting}>
              {submitting ? 'Placing Order...' : 'Order Now'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
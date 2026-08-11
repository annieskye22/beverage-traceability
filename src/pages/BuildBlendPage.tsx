import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNav from '@/components/PublicNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function BuildBlendPage() {
  const navigate = useNavigate();
  const [blendName, setBlendName] = useState('');
  const [base, setBase] = useState('Greek Yogurt');
  const [fruitRatio, setFruitRatio] = useState([50]);
  const [sweetness, setSweetness] = useState([30]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const calculatePrice = () => {
    let price = 2000; // Base price
    if (base === 'Almond Milk') price += 500;
    if (base === 'Coconut Water') price += 300;
    return price + Math.floor(fruitRatio[0] * 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blendName.trim()) {
      toast.error('Please give your custom blend a name!');
      return;
    }

    setSubmitting(true);
    try {
      // Generate a unique batch ID for this custom build
      const customBatchId = `CUSTOM-${Date.now().toString().slice(-6)}`;
      
      // Package the custom sliders into an ingredients array for the blockchain JSON
      const customIngredients = [
        base,
        `Fruit Blend Ratio: ${fruitRatio[0]}%`,
        `Sweetness Level: ${sweetness[0]}%`
      ];

      // 1. Save to Firebase first (so Python has a record to update)
      await addDoc(collection(db, 'orders'), {
        blendName,
        base,
        fruitRatio: fruitRatio[0],
        sweetness: sweetness[0],
        specialNotes,
        price: calculatePrice(),
        batchId: customBatchId,
        ingredients: customIngredients,
        status: 'Order Placed',
        createdAt: serverTimestamp(),
        nearHash: 'Minting on-chain...', // Temporary placeholder
        chainHash: 'Minting on-chain...', 
        isMintedOnChain: false
      });

      toast.info('Order placed! Minting batch to blockchain...');

      // 2. Call Python FastAPI Backend to mint on NEAR
      const response = await fetch('http://localhost:8000/api/mint-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: customBatchId,
          blendName: blendName,
          producedBy: 'Mixit Smoothies Lab',
          ingredients: customIngredients,
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('Successfully secured on NEAR Mainnet!');
      } else {
        toast.error('Blockchain delay, but order was saved.');
        console.error(result.detail);
      }

      // 3. Redirect to orders page to see the generated QR code
      navigate('/orders');
      
    } catch (error: any) {
      console.error("Error saving order:", error);
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Build Your Custom Blend</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8">
          Craft your own signature beverage recipe and track its origin on-chain.
        </p>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div>
            <Label htmlFor="blendName">Blend Name</Label>
            <Input
              id="blendName"
              placeholder="e.g. Morning Glow Supreme"
              value={blendName}
              onChange={(e) => setBlendName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="base">Base Liquid / Body</Label>
            <select
              id="base"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="w-full mt-1 p-2 bg-background border border-border rounded-md text-sm"
            >
              <option value="Greek Yogurt">Greek Yogurt (+₦0)</option>
              <option value="Almond Milk">Almond Milk (+₦500)</option>
              <option value="Coconut Water">Coconut Water (+₦300)</option>
              <option value="Fresh Apple Juice">Fresh Apple Juice (+₦200)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between mb-2 text-sm">
              <Label>Fruit Blend Ratio</Label>
              <span className="font-semibold">{fruitRatio[0]}%</span>
            </div>
            <Slider value={fruitRatio} onValueChange={setFruitRatio} />
          </div>

          <div>
            <div className="flex justify-between mb-2 text-sm">
              <Label>Sweetness Level</Label>
              <span className="font-semibold">{sweetness[0]}%</span>
            </div>
            <Slider value={sweetness} onValueChange={setSweetness} />
          </div>

          <div>
            <Label htmlFor="notes">Special Instructions / Allergies</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Extra ice, no added honey"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="border-t border-border pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Estimated Price</p>
              <p className="text-2xl font-bold text-primary">₦{calculatePrice().toLocaleString()}</p>
            </div>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Creating Blend...' : 'Order Custom Blend'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Slider({ value, onValueChange, min = 0, max = 100, step = 1 }: {
  value: number[];
  onValueChange: (val: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
    />
  );
}
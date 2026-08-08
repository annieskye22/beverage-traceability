import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNav from '@/components/PublicNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const { loginWithGoogle, sendMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [sendingLink, setSendingLink] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Signed in successfully!');
      navigate('/orders');
    } catch (err: any) {
      toast.error('Google Sign-In failed.');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSendingLink(true);
    try {
      await sendMagicLink(email);
      toast.success('Magic link sent to your email!');
    } catch (err: any) {
      toast.error('Failed to send magic link.');
    } finally {
      setSendingLink(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PublicNav />
      <main className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold">Sign In to Mixit</h1>
            <p className="text-xs text-muted-foreground mt-1">
              No passwords required. Sign in with Google or Magic Link.
            </p>
          </div>

          <Button onClick={handleGoogleLogin} variant="outline" className="w-full gap-2 font-bold py-5">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.09-6.68-4.91H1.21v3.15C3.2 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.32 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.57H1.21C.44 8.11 0 9.99 0 12s.44 3.89 1.21 5.43l4.11-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.2 2.7 1.21 6.57l4.11 3.15c.94-2.82 3.58-4.97 6.68-4.97z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <span className="bg-card px-2 text-[10px] text-muted-foreground uppercase">or email magic link</span>
            <div className="absolute inset-0 -z-10 flex items-center"><div className="w-full border-t border-border"></div></div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold" disabled={sendingLink}>
              {sendingLink ? 'Sending Link...' : 'Send Magic Link'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
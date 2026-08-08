import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { User as UserIcon, LogOut, ShieldCheck, Leaf } from 'lucide-react';

export default function PublicNav() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E0D5] bg-[#FBF8F3]/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-[#2D6A4F]">
          <div className="bg-[#2D6A4F] text-white p-1.5 rounded-full flex items-center justify-center">
            <Leaf className="h-5 w-5" />
          </div>
          <span>Mixit<span className="text-[#2B1E1A]"> Smoothies</span></span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-[#2B1E1A]">
          <Link to="/" className="hover:text-[#2D6A4F] transition">Home</Link>
          <a href="#about" className="hover:text-[#2D6A4F] transition">About</a>
          <a href="#menu" className="hover:text-[#2D6A4F] transition">Menu</a>
          <a href="#build-blend" className="hover:text-[#2D6A4F] transition">Build Your Blend</a>
          <a href="#quick-order" className="hover:text-[#2D6A4F] transition">Order</a>
          <a href="#traceability" className="hover:text-[#2D6A4F] transition">Traceability</a>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/orders" className="text-xs font-bold text-[#2B1E1A] hover:text-[#2D6A4F] px-2 py-1">
                My Orders
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs border-[#2D6A4F]/30 text-[#2D6A4F] hover:bg-[#2D6A4F]/10 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" /> Producer Admin
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#E7E0D5] shadow-sm">
                <UserIcon className="h-3.5 w-3.5 text-[#2D6A4F]" />
                <span className="text-xs font-bold max-w-[120px] truncate text-[#2B1E1A]">
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="text-gray-400 hover:text-red-600 transition ml-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="bg-[#2D6A4F] hover:bg-[#23533E] text-white font-bold text-xs px-5 rounded-full shadow-sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AdminNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Supply Chain', path: '/admin/supply-chain' },
  ];

  return (
    <header className="bg-white border-b border-[#EAE2DC] px-8 py-4 flex items-center justify-between shadow-sm print:hidden">
      <div className="flex items-center gap-2">
        <span className="text-[#E11D48] text-lg">⚙️</span>
        <span className="font-extrabold text-base text-[#E11D48]">Mixit Admin</span>
      </div>

      <nav className="flex items-center gap-8 text-xs font-bold text-[#2B1E1A]/60">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`transition pb-1 ${
                isActive
                  ? 'text-[#E11D48] font-black border-b-2 border-[#E11D48]'
                  : 'hover:text-[#2B1E1A]'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
        <span>Welcome, Admin</span>
        <button
          onClick={handleLogout}
          className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold px-3.5 py-1.5 rounded-lg text-xs transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
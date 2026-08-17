import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const cart = useCartStore((state) => state.cart);
  const navigate = useNavigate();

  const totalCartItems = cart?.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-luxury-black border-b border-luxury-border/60 text-white sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex flex-col items-start group">
          <span className="font-serif text-2xl tracking-widest font-light uppercase group-hover:text-luxury-gold transition-colors">
            MAISON
          </span>
          <span className="text-[9px] tracking-[0.3em] text-luxury-muted uppercase -mt-1">
            ATELIER
          </span>
        </Link>

        {/* Center / Right Links */}
        <div className="flex items-center space-x-8 text-xs tracking-editorial uppercase">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-luxury-gold transition-colors">
                Analytics
              </Link>
              <Link to="/dashboard/products" className="hover:text-luxury-gold transition-colors">
                Catalog
              </Link>
              <Link to="/dashboard/settings" className="hover:text-luxury-gold transition-colors">
                Settings
              </Link>
              <span className="text-luxury-muted border-l border-luxury-border pl-6 py-1">
                {user?.storeName || 'Merchant'}
              </span>
              <button
                onClick={handleLogout}
                className="text-luxury-muted hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-luxury-gold transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="border border-luxury-gold text-luxury-gold px-5 py-2.5 hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
              >
                Create Store
              </Link>
            </>
          )}

          {/* Cart Counter (Public Storefront) */}
          <div className="relative border-l border-luxury-border pl-6">
            <Link to="/cart"><span className="text-luxury-gold text-sm">BAG ({totalCartItems})</span></Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

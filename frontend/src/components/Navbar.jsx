import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const cart = useCartStore((state) => state.cart);
  const navigate = useNavigate();

  const totalCartItems = cart?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-luxury-black border-b border-luxury-border/60 text-white sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" onClick={closeMenu} className="flex flex-col items-start group">
          <span className="font-serif text-2xl tracking-widest font-light uppercase group-hover:text-luxury-gold transition-colors">
            MAISON
          </span>
          <span className="text-[9px] tracking-[0.3em] text-luxury-muted uppercase -mt-1">
            ATELIER
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-xs tracking-editorial uppercase">
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

          {/* Desktop Bag Icon & Counter */}
          <Link
            to="/cart"
            className="relative border-l border-luxury-border pl-6 flex items-center space-x-2 text-luxury-gold hover:opacity-80 transition-opacity"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-xs tracking-editorial">({totalCartItems})</span>
          </Link>
        </div>

        {/* Mobile Right Action Bar: Bag + Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-5">
          {/* Always-Visible Mobile Shopping Bag */}
          <Link
            to="/cart"
            onClick={closeMenu}
            aria-label="View Shopping Bag"
            className="relative flex items-center justify-center text-luxury-gold p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-luxury-gold text-luxury-black font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </Link>

          {/* Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-luxury-gold focus:outline-none p-1"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-luxury-black border-b border-luxury-border/80 px-6 pt-4 pb-8 space-y-6 text-xs tracking-editorial uppercase transition-all">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-5">
              <span className="text-luxury-gold border-b border-luxury-border/40 pb-2 text-[10px] tracking-widest">
                STORE: {user?.storeName || 'Merchant'}
              </span>
              <Link to="/dashboard" onClick={closeMenu} className="hover:text-luxury-gold transition-colors py-1">
                Analytics
              </Link>
              <Link to="/dashboard/products" onClick={closeMenu} className="hover:text-luxury-gold transition-colors py-1">
                Catalog
              </Link>
              <Link to="/dashboard/settings" onClick={closeMenu} className="hover:text-luxury-gold transition-colors py-1">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-luxury-muted hover:text-red-400 transition-colors pt-2 border-t border-luxury-border/40"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-5">
              <Link to="/login" onClick={closeMenu} className="hover:text-luxury-gold transition-colors py-1">
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="border border-luxury-gold text-luxury-gold text-center py-3 hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
              >
                Create Store
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

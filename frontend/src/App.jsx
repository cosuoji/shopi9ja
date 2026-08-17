import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import "./App.css"; // Import your CSS file

//components
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ScrollToTop from './components/ScrollToTop';


// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Analytics from './pages/Dashboard/Analytics';
import Products from './pages/Dashboard/Products';
import Settings from './pages/Dashboard/Settings';
import ProductDetail from './components/ProductDetail';
import Home from './pages/Home';
import Storefront from './pages/Storefront';
import Cart from './pages/Cart';


// Store
import { useAuthStore } from './store/useAuthStore';
import { ImageOff } from 'lucide-react';


export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-luxury-black text-luxury-cream selection:bg-luxury-gold selection:text-luxury-black font-sans antialiased">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            {/* Public Storefront Route */}
            <Route path="/store/:slug" element={<Storefront />} />
            <Route path="/store/:storeSlug/product/:productSlug" element={<ProductDetail />} />

            {/* Protected Merchant Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Analytics />} />
              <Route path="/dashboard/products" element={<Products />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

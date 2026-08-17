import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Register() {
  const [formData, setFormData] = useState({
    storeName: '',
    email: '',
    whatsappNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [storeStatus, setStoreStatus] = useState({
    checking: false,
    available: null,
    message: '',
    slug: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Debounced store name availability validation
  useEffect(() => {
    if (!formData.storeName.trim()) {
      setStoreStatus({ checking: false, available: null, message: '', slug: '' });
      return;
    }

    const timer = setTimeout(async () => {
      setStoreStatus((prev) => ({ ...prev, checking: true }));
      try {
        const res = await api.get(
          `/api/auth/check-store-name?storeName=${encodeURIComponent(formData.storeName)}`
        );
        if (res.data.available) {
          setStoreStatus({
            checking: false,
            available: true,
            message: 'Store name is available',
            slug: res.data.slug,
          });
        } else {
          setStoreStatus({
            checking: false,
            available: false,
            message: 'Store name is taken',
            slug: res.data.slug,
          });
        }
      } catch (err) {
        setStoreStatus({
          checking: false,
          available: false,
          message: err.response?.data?.error || 'Error checking store name',
          slug: '',
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.storeName]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'text-red-400 bg-red-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'text-yellow-400 bg-yellow-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'text-emerald-400 bg-emerald-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'text-luxury-gold bg-luxury-gold' };
      default:
        return { score: 0, label: 'Too short', color: 'text-red-400 bg-red-500' };
    }
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (storeStatus.available === false) {
      setError('Please choose an available store name');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (strength.score < 2) {
      setError('Please choose a stronger password (min 8 characters)');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        storeName: formData.storeName,
        email: formData.email,
        whatsappNumber: formData.whatsappNumber,
        password: formData.password,
      };
      await api.post('/api/auth/register', payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-luxury-charcoal border border-luxury-border/60 p-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl text-white tracking-widest uppercase">Create Store</h1>
          <p className="text-xs text-luxury-muted tracking-editorial uppercase">Launch Your Luxury Storefront</p>
        </div>

        {error && (
          <div className="text-red-400 text-xs text-center border border-red-500/30 p-3 bg-red-950/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Store Name Input with Real-time Validation */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs uppercase tracking-editorial text-luxury-muted">
                Store Name
              </label>
              {storeStatus.checking && (
                <span className="text-[10px] text-luxury-muted animate-pulse">Checking...</span>
              )}
              {!storeStatus.checking && storeStatus.available !== null && (
                <span
                  className={`text-[10px] uppercase font-semibold ${
                    storeStatus.available ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {storeStatus.message}
                </span>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Maison Kicks"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className={`w-full bg-luxury-black border p-3 text-white text-sm focus:outline-none ${
                storeStatus.available === false
                  ? 'border-red-500 focus:border-red-500'
                  : storeStatus.available === true
                  ? 'border-emerald-500 focus:border-emerald-500'
                  : 'border-luxury-border focus:border-luxury-gold'
              }`}
            />
            {storeStatus.slug && storeStatus.available && (
              <p className="text-[10px] text-luxury-muted mt-1 font-mono">
                Link: atelier.com/store/{storeStatus.slug}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm focus:border-luxury-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-2">
              WhatsApp Number
            </label>
            <input
              type="text"
              required
              placeholder="2348000000000"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm font-mono focus:border-luxury-gold focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs uppercase tracking-editorial text-luxury-muted">
                Password
              </label>
              {formData.password && (
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${strength.color.split(' ')[0]}`}>
                  {strength.label}
                </span>
              )}
            </div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm focus:border-luxury-gold focus:outline-none"
            />

            {formData.password && (
              <div className="flex gap-1 mt-2 h-1 w-full bg-luxury-black">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 transition-all duration-300 ${
                      step <= strength.score ? strength.color.split(' ')[1] : 'bg-luxury-border/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full bg-luxury-black border p-3 text-white text-sm focus:outline-none ${
                formData.confirmPassword && formData.confirmPassword !== formData.password
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-luxury-border focus:border-luxury-gold'
              }`}
            />
            {formData.confirmPassword && formData.confirmPassword !== formData.password && (
              <p className="text-red-400 text-[10px] mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || storeStatus.available === false || storeStatus.checking}
            className="w-full bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-editorial py-4 hover:bg-luxury-gold-hover transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating Store...' : 'Register Store'}
          </button>
        </form>

        <p className="text-center text-xs text-luxury-muted">
          Existing Store?{' '}
          <Link to="/login" className="text-luxury-gold underline hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

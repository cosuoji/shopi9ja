import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import useSEO from '../hooks/useSEO';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login({ email, password });
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  useSEO({
    title: "Login | Independent Markets",
    description: "Log in to your Independent Markets account.",
    canonical: "https://independentmarkets.netlify.app/login",
    ogType: "website",
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-luxury-charcoal border border-luxury-border/60 p-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl text-white tracking-widest uppercase">Store Login</h1>
          <p className="text-xs text-luxury-muted tracking-editorial uppercase">Access Your Executive Suite</p>
        </div>

        {error && (
          <div className="text-red-400 text-xs text-center border border-red-500/30 p-3 bg-red-950/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm focus:border-luxury-gold focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-editorial text-luxury-muted">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[10px] uppercase tracking-editorial text-luxury-gold hover:text-white transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm focus:border-luxury-gold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-editorial py-4 hover:bg-luxury-gold-hover transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-luxury-muted">
          New Merchant?{' '}
          <Link to="/register" className="text-luxury-gold underline hover:text-white transition-colors">
            Create Storefront
          </Link>
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import useSEO from "../hooks/useSEO"

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });

  // Read URL query parameter "?token=..."
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ ...status, error: 'Passwords do not match' });
    }

    setStatus({ loading: true, success: '', error: '' });

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setStatus({ loading: false, success: data.message, error: '' });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus({ loading: false, success: '', error: err.message });
    }
  };

  useSEO({
    title: "Reset Password | Independent Markets",
    description: "Reset your password using the password reset token.",
    canonical: `https://independentmarkets.netlify.app/reset-password?token=${token}`,
    ogType: "website",
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md max-w-md w-full text-center">
          Missing password reset token in URL.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
          <p className="text-sm text-gray-600 mt-1">Please enter your new password below.</p>
        </div>

        {status.error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md">
            {status.error}
          </div>
        )}

        {status.success && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">
            {status.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full py-2.5 bg-black text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {status.loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

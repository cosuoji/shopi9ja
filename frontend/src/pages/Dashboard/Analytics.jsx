import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { store } = useAuthStore();

  const storeId = store?.id || store?._id;

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!storeId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/api/analytics/store/${storeId}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load performance metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [storeId]);

  if (loading) {
    return (
      <div className="text-luxury-gold text-xs uppercase tracking-editorial animate-pulse">
        Loading Analytics...
      </div>
    );
  }

  const { metrics, recentInquiries } = data || {};

  const stats = [
    { label: 'GROSS REVENUE', value: `₦ ${(metrics?.grossRevenue || 0).toLocaleString()}` },
    { label: 'WHATSAPP CONVERSIONS', value: `${metrics?.whatsappConversions || 0} Orders` },
    { label: 'AVERAGE ORDER VALUE', value: `₦ ${Math.round(metrics?.averageOrderValue || 0).toLocaleString()}` },
    { label: 'CATALOG ENGAGEMENT', value: `${metrics?.catalogViews || 0} Views` },
  ];

  return (
    <div className="space-y-12">
      <div className="border-b border-luxury-border pb-6">
        <h1 className="font-serif text-3xl text-white tracking-wide uppercase">
          Performance Intelligence
        </h1>
        <p className="text-luxury-muted text-xs tracking-editorial uppercase mt-1">
          Executive Summary & Direct Sales Metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-luxury-charcoal border border-luxury-border/60 p-6 relative">
            <span className="text-[10px] tracking-widest text-luxury-muted uppercase block">
              {item.label}
            </span>
            <div className="font-serif text-2xl text-white mt-3 mb-2">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-luxury-charcoal border border-luxury-border/60 p-8">
        <h2 className="font-serif text-xl text-white tracking-wide mb-6 uppercase">
          Recent Client Inquiries
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs uppercase tracking-wider">
            <thead>
              <tr className="border-b border-luxury-border text-luxury-muted">
                <th className="pb-4">Items Reserved</th>
                <th className="pb-4">Value</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/40 text-white">
              {recentInquiries && recentInquiries.length > 0 ? (
                recentInquiries.map((inquiry) => (
                  <tr key={inquiry._id}>
                    <td className="py-4">{inquiry.product?.title || 'Custom Request'}</td>
                    <td className="py-4 font-mono">
                      ₦ {Number(inquiry.value || 0).toLocaleString()}
                    </td>
                    <td className="py-4 font-mono">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-luxury-gold">WhatsApp Redirected</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-luxury-muted">
                    No client inquiries recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

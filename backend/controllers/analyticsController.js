import AnalyticsEvent from '../models/AnalyticsEvent.js';

export const getStoreAnalytics = async (req, res) => {
  try {
    const storeId = req.store._id; // Extracted from auth middleware

    const totalViews = await AnalyticsEvent.countDocuments({ store: storeId, type: 'view' });
    const inquiries = await AnalyticsEvent.find({ store: storeId, type: 'inquiry' })
      .populate('product', 'title price')
      .sort({ createdAt: -1 })
      .limit(10);

    const grossRevenueData = await AnalyticsEvent.aggregate([
      { $match: { store: storeId, type: 'inquiry' } },
      { $group: { _id: null, total: { $sum: '$value' }, count: { $sum: 1 } } },
    ]);

    const totalRevenue = grossRevenueData[0]?.total || 0;
    const totalInquiries = grossRevenueData[0]?.count || 0;
    const avgOrderValue = totalInquiries > 0 ? totalRevenue / totalInquiries : 0;

    res.json({
      metrics: {
        grossRevenue: totalRevenue,
        whatsappConversions: totalInquiries,
        averageOrderValue: avgOrderValue,
        catalogViews: totalViews,
      },
      recentInquiries: inquiries,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
};

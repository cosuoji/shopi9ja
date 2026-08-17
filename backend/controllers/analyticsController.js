import mongoose from 'mongoose';
import Analytics from '../models/Analytics.js';

export const trackEvent = async (req, res) => {
  try {
    const { type, storeId, productId, value, metadata } = req.body;

    if (!type || !storeId) {
      return res.status(400).json({ error: 'Event type and storeId are required.' });
    }

    const event = await Analytics.create({
      type,
      storeId,
      productId: productId || null,
      value: value || 0,
      metadata: metadata || {},
    });

    return res.status(201).json({ success: true, eventId: event._id });
  } catch (error) {
    console.error('Analytics tracking error:', error.message);
    return res.status(500).json({ error: 'Failed to log analytics event.' });
  }
};


export const getStoreAnalytics = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId || storeId === 'undefined') {
      return res.status(400).json({ error: 'Valid storeId is required.' });
    }

    const storeObjectId = new mongoose.Types.ObjectId(storeId);

    // 1. Fetch Aggregated Metrics
    const [inquiryStats, catalogViews] = await Promise.all([
      Analytics.aggregate([
        { $match: { storeId: storeObjectId, type: 'inquiry' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$value' },
            totalConversions: { $sum: 1 },
            avgOrderValue: { $avg: '$value' },
          },
        },
      ]),
      Analytics.countDocuments({ storeId: storeObjectId, type: 'view' }),
    ]);

    const stats = inquiryStats[0] || {};
    const grossRevenue = stats.totalRevenue || 0;
    const whatsappConversions = stats.totalConversions || 0;
    const averageOrderValue = stats.avgOrderValue || 0;

    // 2. Fetch Recent Inquiries for Table
    const recentInquiries = await Analytics.find({
      storeId: storeObjectId,
      type: 'inquiry',
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('productId', 'title price')
      .lean();

    // Map productId to product field to align with frontend expectation
    const formattedInquiries = recentInquiries.map((inquiry) => ({
      ...inquiry,
      product: inquiry.productId,
    }));

    return res.status(200).json({
      metrics: {
        grossRevenue,
        whatsappConversions,
        averageOrderValue,
        catalogViews,
      },
      recentInquiries: formattedInquiries,
    });
  } catch (error) {
    console.error('Error fetching store analytics:', error);
    return res.status(500).json({ error: error.message });
  }
};

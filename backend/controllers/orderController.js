import Order from '../models/Order.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';

// Helper function to build formatted WhatsApp payload URL
const buildWhatsAppUrl = (whatsappNumber, storeName, orderItems, totalAmount, customer) => {
  let message = `🛒 *New Order from ${storeName}*\n\n`;
  message += `*Customer Details:*\n`;
  message += `• *Name:* ${customer.name}\n`;
  message += `• *Phone:* ${customer.phone}\n`;
  if (customer.address) {
    message += `• *Address:* ${customer.address}\n`;
  }

  message += `\n*Items Ordered:*\n`;
  orderItems.forEach((item, index) => {
    message += `${index + 1}. ${item.title} (x${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString()}\n`;
  });

  message += `\n💵 *Total Amount:* ₦${totalAmount.toLocaleString()}\n\n`;
  message += `Please reply to confirm availability and payment details. Thank you!`;

  // Encode message string for URL safety
  const encodedMessage = encodeURIComponent(message);

  // Clean phone number (strip + and spaces)
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

// @desc    Create new order & generate WhatsApp link
// @route   POST /api/orders/public
// @access  Public (Storefront Buyers)
export const createOrder = async (req, res) => {
  try {
    const { storeSlug, customerName, customerPhone, customerAddress, items } = req.body;

    if (!storeSlug || !customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Please provide all required order details' });
    }

    // 1. Validate Store
    const store = await Store.findOne({ slug: storeSlug });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // 2. Process Items and Validate Stock
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || !product.isAvailable) {
        return res.status(400).json({ error: `Product "${item.title || 'Item'}" is unavailable` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.title}". Only ${product.stockQuantity} left.`
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItems.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
      });

      // Atomic stock deduction
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    // 3. Save Order Record in DB
    const order = await Order.create({
      storeId: store._id,
      customerName,
      customerPhone,
      customerAddress,
      items: orderItems,
      totalAmount: calculatedTotal,
      status: 'whatsapp_redirected',
    });

    // 4. Generate WhatsApp Link
    const whatsappUrl = buildWhatsAppUrl(
      store.whatsappNumber,
      store.name,
      orderItems,
      calculatedTotal,
      { name: customerName, phone: customerPhone, address: customerAddress }
    );

    return res.status(201).json({
      success: true,
      orderId: order._id,
      whatsappUrl,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get order history for merchant
// @route   GET /api/orders/me
// @access  Private (Merchants)
export const getMyOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const orders = await Order.find({ storeId: store._id }).sort({ createdAt: -1 });

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Update order status (e.g. mark as fulfilled or cancelled)
// @route   PUT /api/orders/:id/status
// @access  Private (Merchants)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const store = await Store.findOne({ ownerId: req.user.id });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.storeId.toString() !== store._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

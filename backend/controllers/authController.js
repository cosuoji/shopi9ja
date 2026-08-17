import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/User.js';
import Store from '../models/Store.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/sendEmail.js';

// Helper function to sign JWT
const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { email, password, storeName, whatsappNumber } = req.body;

    if (!email || !password || !storeName || !whatsappNumber) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const slug = storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const slugExists = await Store.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({
        error: 'Store name is already taken. Try a different name.',
      });
    }

    // Create User without fullName
    const user = await User.create({ email, password });

    const store = await Store.create({
      ownerId: user._id,
      name: storeName,
      slug,
      whatsappNumber: whatsappNumber.replace(/[^0-9]/g, ''),
    });

    const token = generateToken(user._id, user.email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Fire welcome email asynchronously without crashing registration on failure
    // sendWelcomeEmail({
    //   email: user.email,
    //   fullName: store.name, // Use store.name or email local-part since user.fullName no longer exists
    //   storeName: store.name,
    //   slug: store.slug,
    // }).catch((emailErr) => {
    //   console.error('Welcome email failed to send:', emailErr.message);
    // });

    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email },
      store: {
        id: store._id,
        name: store.name,
        slug: store.slug,
        whatsappNumber: store.whatsappNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const store = await Store.findOne({ ownerId: user._id });
    const token = generateToken(user._id, user.email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email },
      store: store ? { id: store._id, name: store.name, slug: store.slug, whatsappNumber: store.whatsappNumber } : null,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const store = await Store.findOne({ ownerId: req.user.id });
    return res.json({ user, store });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'No user found with that email address' });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Send reset email via Resend
    // await sendPasswordResetEmail({
    //   email: user.email,
    //   resetToken,
    // });

    return res.json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Email could not be sent. Please try again.' });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Hash token to compare with database
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// GET /api/auth/check-store-name?storeName=Kicks%20And%20Fits
export const checkStoreName = async (req, res) => {
  try {
    const { storeName } = req.query;

    if (!storeName || !storeName.trim()) {
      return res.status(400).json({ error: 'Store name is required' });
    }

    const slug = storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    if (!slug) {
      return res.status(400).json({ error: 'Invalid store name' });
    }

    const slugExists = await Store.findOne({ slug });

    return res.json({
      available: !slugExists,
      slug,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

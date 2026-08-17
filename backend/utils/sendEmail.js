// utils/sendEmail.js
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async ({ email, storeName, slug }) => {
  try {
    await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `Welcome to your new store, ${storeName}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to the platform!</h2>
          <p>Hi ${storeName},</p>
          <p>Your store <strong>${storeName}</strong> has been successfully created.</p>
          <p>Your store link: <a href="${process.env.CLIENT_URL}/store/${slug}">${process.env.CLIENT_URL}/store/${slug}</a></p>
          <p>Let us know if you need any help setting up!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
  }
};

export const sendPasswordResetEmail = async ({ email, resetToken }) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background: #000; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        </p>
        <p>This link is valid for 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

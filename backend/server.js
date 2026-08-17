//Packages
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

//Routes
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import storeRoutes from './routes/store.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/order.js';
import uploadRoutes from './routes/upload.js';

// Middleware
import { apiLimiter } from './middleware/rateLimit.js';

//Models
import Product from './models/Product.js';
import Store from './models/Store.js';


dotenv.config();
connectDB();

const app = express();
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}



app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load the compiled React index.html once into memory
const indexPath = path.resolve(__dirname, '../dist/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Helper to sanitize text for HTML attributes
const escapeHtml = (str) =>
  str ? str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

// Helper to inject meta tags into index.html
function injectOgTags(html, { title, description, image, url }) {
  const metaTags = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:site_name" content="Atelier" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
  `;

  // Replace default title and tags inside <head>
  return html.replace(/<title>.*?<\/title>/, metaTags);
}


app.use("/api/", apiLimiter);
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// 1. Matching your actual storefront route: /public/:slug
app.get('/public/:slug', async (req, res, next) => {
  // If the request isn't expecting HTML (e.g. an API fetch from your React app), let it pass to API controllers
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return next();
  }

  try {
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) return next();

    const title = `${store.name} | Atelier`;
    const description = store.bio || `Explore the curated collection from ${store.name}.`;
    const image = store.bannerImage || store.logo || 'https://yourdomain.com/og-default.jpg';
    const url = `https://${req.get('host')}/public/${store.slug}`;

    const customizedHtml = injectOgTags(indexHtml, { title, description, image, url });
    return res.send(customizedHtml);
  } catch (err) {
    next();
  }
});

// 2. Matching your actual product route: /slug/:productSlug
app.get('/slug/:productSlug', async (req, res, next) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return next();
  }

  try {
    const product = await Product.findOne({ slug: req.params.productSlug }).populate('storeId');
    if (!product) return next();

    const storeName = product.storeId?.name || 'Atelier';
    const title = `${product.title} — ${storeName}`;
    const formattedPrice = `${product.currency || 'NGN'} ${Number(product.price).toLocaleString()}`;
    const description = product.description
      ? `${formattedPrice} — ${product.description.slice(0, 150)}...`
      : `Order ${product.title} directly via WhatsApp on Atelier for ${formattedPrice}.`;

    const image = product.images?.[0] || 'https://yourdomain.com/og-default.jpg';
    const url = `https://${req.get('host')}/slug/${product.slug}`;

    const customizedHtml = injectOgTags(indexHtml, { title, description, image, url });
    return res.send(customizedHtml);
  } catch (err) {
    next();
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

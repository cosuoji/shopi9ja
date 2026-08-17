//Packages
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express from 'express';
import dotenv from 'dotenv';



//Routes
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import storeRoutes from './routes/store.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/order.js';
import uploadRoutes from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';


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


app.use("/api/", apiLimiter);
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);


// 1. Matching your actual storefront route: /public/:slug
app.get("/public/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const store = await Store.findOne({ slug });

    if (!store) {
      return res.status(404).send("Store not found");
    }

    const title = `${store.name} | Atelier`;

    const description =
      store.bio ||
      `Explore the collection from ${store.name} on Atelier.`;

    const image =
      store.bannerImage ||
      store.logo ||
      "https://yourdomain.com/og-default.jpg";

    const url = `https://yourdomain.com/public/${slug}`;

    const html = `
<!DOCTYPE html>
<html>
<head>

<title>${title}</title>

<meta name="description" content="${description}">

<meta property="og:site_name" content="Atelier">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">

</head>

<body>
Loading Atelier...
</body>

</html>
`;

    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
// 2. Matching your actual product route: /slug/:productSlug
app.get("/slug/:productSlug", async (req, res) => {
  try {
    const { productSlug } = req.params;

    const product = await Product.findOne({
      slug: productSlug,
    }).populate("storeId");

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const storeName = product.storeId?.name || "Atelier";

    const title = `${product.title} — ${storeName}`;

    const formattedPrice =
      `${product.currency || "NGN"} ` +
      `${Number(product.price).toLocaleString()}`;

    const description = product.description
      ? `${formattedPrice} — ${product.description.slice(0, 150)}...`
      : `Order ${product.title} directly via WhatsApp on Atelier for ${formattedPrice}.`;

    const image =
      product.images?.[0] ||
      "https://yourdomain.com/og-default.jpg";

    const url =
      `https://yourdomain.com/slug/${productSlug}`;

    const html = `
<!DOCTYPE html>
<html>
<head>

<title>${title}</title>

<meta name="description" content="${description}">

<meta property="og:site_name" content="Atelier">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:type" content="product">
<meta property="og:url" content="${url}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">

</head>

<body>
Loading Atelier...
</body>

</html>
`;

    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    const frontendUrl =
      process.env.FRONTEND_URL ||
      "https://independentmarkets.netlify.app";

    const [stores, products] = await Promise.all([
      Store.find({})
        .select("slug updatedAt")
        .lean(),

      Product.find({})
        .populate("storeId", "slug")
        .select("slug storeId updatedAt")
        .lean(),
    ]);

    const urls = [];

    // Homepage
    urls.push(`
      <url>
        <loc>${frontendUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
    `);

    // Store pages
    stores.forEach((store) => {
      urls.push(`
        <url>
          <loc>${frontendUrl}/store/${encodeURIComponent(store.slug)}</loc>
          <lastmod>${new Date(store.updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `);
    });

    // Product pages
    products.forEach((product) => {
      if (!product.storeId?.slug) return;

      urls.push(`
        <url>
          <loc>${frontendUrl}/store/${encodeURIComponent(
            product.storeId.slug
          )}/product/${encodeURIComponent(product.slug)}</loc>

          <lastmod>${new Date(
            product.updatedAt
          ).toISOString()}</lastmod>

          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `);
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join("\n")}
</urlset>`;

    res
      .status(200)
      .type("application/xml")
      .send(sitemap);

  } catch (error) {
    console.error("Sitemap generation error:", error);

    res
      .status(500)
      .type("text/plain")
      .send("Unable to generate sitemap");
  }
});

// Robots.txt
app.get("/robots.txt", (req, res) => {
  const frontendUrl =
    process.env.FRONTEND_URL ||
    "https://independentmarkets.netlify.app";

  const robots = `User-agent: *
Allow: /

Sitemap: ${frontendUrl}/sitemap.xml
`;

  res
    .status(200)
    .type("text/plain")
    .send(robots);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

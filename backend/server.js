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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

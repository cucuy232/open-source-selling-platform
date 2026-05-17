import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Database and Route Imports
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import paymentRoutes from './routes/payments.js';

// 1. Initial configuration and secrets loading
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 2. Establish event-driven MongoDB database connection
connectDB();

// 3. Security Middleware Pipeline
// A. Secure HTTP Headers using Helmet
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local cross-origin image boards smoothly
}));

// B. Secure CORS Config (Allow local Vite app and general client connections)
app.use(cors({
  origin: '*', // For standard local multi-port configurations. Update to production URL in live deployments.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// C. Secure Request Parsers (Set defensive JSON upload payload limits)
app.use(express.json({ limit: '10mb' })); // Allows base64 board image posts without server memory exhaustion
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// D. Rate Limiting Protection (Mitigate brute-force, listing spam, and DDoS threats)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 200, // Limit each IP to 200 requests per 15 minutes window
  message: {
    success: false,
    message: 'Too many requests from this device. Anti-abuse throttling triggered. Please try again later.'
  },
  standardHeaders: true, // Return standard rate limit info headers
  legacyHeaders: false // Disable X-RateLimit headers
});

app.use('/api', apiLimiter);

// 4. API Endpoints Registration
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payments', paymentRoutes);

// 5. Default Base Route
app.get('/', (req, res) => {
  res.json({
    name: 'bhejiyo Secure API Gateway',
    version: '1.0.0',
    status: 'ONLINE',
    nodes: ['database_connected', 'payments_ready']
  });
});

// 6. Global Catch 404 Route Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Requested resource API endpoint not found.' });
});

// 7. Global Secure Exception Error Interception
app.use((err, req, res, next) => {
  console.error('Unhandled Exception Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'A critical unhandled exception occurred on the payment database node.'
  });
});

// 8. Launch Server Listening Node
app.listen(PORT, () => {
  console.log(`\n🚀 bhejiyo Marketplace backend online and listening at:`);
  console.log(`📡 http://localhost:${PORT}`);
  console.log(`🛡️  Security headers and API rate-limiting active.\n`);
});

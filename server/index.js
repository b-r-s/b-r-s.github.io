import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';
import paymentsRouter from './routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (development only)
if (config.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/payments', paymentsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: config.NODE_ENV,
    piConfigured: !!config.PI_API_KEY,
  });
});

// Serve static files from React build (production)
if (config.isProduction) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Development mode message
if (config.isDevelopment) {
  app.get('/', (req, res) => {
    res.json({
      message: 'Checkers4Pi API Server',
      mode: 'development',
      note: 'Run "npm run dev" to start the Vite dev server for the frontend',
      apiEndpoints: {
        health: '/api/health',
        approvePayment: 'POST /api/payments/approve',
        completePayment: 'POST /api/payments/complete',
        getPayment: 'GET /api/payments/:paymentId',
      },
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.isDevelopment ? err.message : 'An error occurred',
  });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`\n🚀 Checkers4Pi Server running on port ${PORT}`);
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   Pi API configured: ${!!config.PI_API_KEY ? '✅' : '❌'}`);
  
  if (config.isDevelopment) {
    console.log(`\n   API: http://localhost:${PORT}/api`);
    console.log(`   Frontend (Vite): Run "npm run dev" in another terminal\n`);
  } else {
    console.log(`\n   App: http://localhost:${PORT}\n`);
  }
});

import express from 'express';
import cors from 'cors';
import paymentsRouter from './routes/payments.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Payment routes
app.use('/api/payments', paymentsRouter);

// API Routes - Self-Contained (No external config import for the check)

// Pi Network Validation Key Route
// Hardcoded to ensure exact response body without HTML wrapping
app.get('/validation-key.txt', (req, res) => {
  const key = '6ea15fed2af1a0d886e63765a';
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send(key);
});
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is alive (Self-Contained Mode)',
    // We check process.env directly instead of using config.js
    piConfigured: !!process.env.VITE_PI_API_KEY || !!process.env.PI_API_KEY,
    piKeySource: process.env.PI_API_KEY ? 'PI_API_KEY' : process.env.VITE_PI_API_KEY ? 'VITE_PI_API_KEY' : 'none'
  });
});

// Test endpoint: verify our PI_API_KEY can reach Pi servers
app.get('/api/test-pi-connection', async (req, res) => {
  const key = process.env.PI_API_KEY || '';
  if (!key) return res.status(500).json({ error: 'No PI_API_KEY set', envKeys: Object.keys(process.env).filter(k => k.includes('PI')) });
  try {
    const axios = (await import('axios')).default;
    const r = await axios.get('https://api.minepi.com/v2/payments/fake_test_id_12345', {
      headers: { Authorization: `Key ${key}` },
      validateStatus: () => true,
    });
    res.json({ piHttpStatus: r.status, piResponse: r.data, keyLength: key.length });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});
export default app;

/* import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - Consolidated Health Check
// This handles /api/health, /health, and the root / within the API function
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is alive',
    environment: config.NODE_ENV,
    piConfigured: !!config.PI_API_KEY,
  });
});

// Serve static files from React build (production only)
if (config.isProduction) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  // Serve index.html for all non-API routes (SPA routing)
  // This is a backup; vercel.json usually handles this first
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Development and Local-Only Logic
if (config.isDevelopment) {
  const PORT = config.PORT || 3000;

  // Start server ONLY in development
  app.listen(PORT, () => {
    console.log(`\n🚀 Checkers4Pi Server running on port ${PORT}`);
    console.log(`   Environment: ${config.NODE_ENV}`);
    console.log(`   Pi API configured: ${!!config.PI_API_KEY ? '✅' : '❌'}`);
    console.log(`\n   API: http://localhost:${PORT}/api`);
  });
}

// Export the app (Necessary for Vercel to turn this into a Serverless Function)
export default app; */

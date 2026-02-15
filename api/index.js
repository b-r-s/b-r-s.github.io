import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - Self-Contained (No external config import for the check)

// Pi Network Validation Key Route
// Hardcoded to ensure exact response body without HTML wrapping
app.get('/validation-key.txt', (req, res) => {
  const key = '6ea15fed2af1a0d886e63765a';
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Content-Disposition', 'inline');
  res.status(200).send(key);
});
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is alive (Self-Contained Mode)',
    // We check process.env directly instead of using config.js
    piConfigured: !!process.env.VITE_PI_API_KEY || !!process.env.PI_API_KEY
  });
});

// Export the app for Vercel
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

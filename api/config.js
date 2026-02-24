// Server-side config — uses process.env (Node.js / Vercel serverless)
const PI_API_KEY = process.env.PI_API_KEY || '';
const PI_APP_ID = process.env.PI_APP_ID || process.env.VITE_PI_APP_ID || '';
const NODE_ENV = process.env.NODE_ENV || 'development';

export default {
  PI_API_KEY,
  PI_APP_ID,
  NODE_ENV,
  PI_API_BASE_URL: 'https://api.minepi.com/v2',
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
};
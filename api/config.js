// No need to import/config dotenv on the frontend! 
// Vite handles .env files automatically.

const PI_APP_ID = import.meta.env.VITE_PI_APP_ID; // Use import.meta.env for Vite
const NODE_ENV = import.meta.env.MODE || 'development';

export default {
  PI_APP_ID,
  NODE_ENV,
  PI_API_BASE_URL: 'https://api.minepi.com/v2',
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
};
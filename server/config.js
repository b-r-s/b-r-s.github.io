import dotenv from 'dotenv';
dotenv.config();

const PI_API_KEY = process.env.PI_API_KEY;
const PI_APP_ID = process.env.PI_APP_ID;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

// Validate required environment variables
if (!PI_API_KEY) {
  console.warn('WARNING: PI_API_KEY is not set in .env file');
}

if (!PI_APP_ID) {
  console.warn('WARNING: PI_APP_ID is not set in .env file');
}

export default {
  PI_API_KEY,
  PI_APP_ID,
  NODE_ENV,
  PORT,
  PI_API_BASE_URL: 'https://api.minepi.com/v2',
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
};

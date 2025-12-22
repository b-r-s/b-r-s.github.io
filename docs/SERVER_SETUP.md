# Server Setup and Development

## Installation

Install the new server dependencies:

```bash
npm install
```

This will install:
- `express` - Web server framework
- `axios` - HTTP client for Pi API calls
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `concurrently` - Run multiple npm scripts simultaneously

## Configuration

Ensure your `.env` file is set up:

```bash
PI_API_KEY=your_server_api_key_here
PI_APP_ID=your_app_id_here
NODE_ENV=development
PORT=3000
```

## Development

### Option 1: Run frontend and backend separately

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run dev:server
```

### Option 2: Run both concurrently

```bash
npm run dev:all
```

This runs both Vite dev server (port 5173) and Express API server (port 3000).

## API Endpoints

The backend provides these endpoints:

- `POST /api/payments/approve` - Approve a payment
- `POST /api/payments/complete` - Complete a payment
- `GET /api/payments/:paymentId` - Get payment details
- `GET /api/health` - Health check

## Production Deployment

1. Build the frontend:
```bash
npm run build
```

2. Set environment to production:
```bash
# In .env or server environment variables
NODE_ENV=production
```

3. Start the server:
```bash
npm start
```

The Express server will serve the built React app from `dist/` folder.

## Testing Payments

1. Ensure both frontend and backend are running
2. Open app in Pi Browser
3. Authenticate with Pi SDK
4. Trigger a payment (when implemented in UI)
5. Check console logs for payment flow

## Troubleshooting

**Backend won't start:**
- Check `.env` file exists
- Verify port 3000 is not in use
- Run `npm install` to ensure dependencies are installed

**Payment approval fails:**
- Verify `PI_API_KEY` is correct
- Check Pi Developer Portal for API key status
- Review server console logs for error details

**CORS errors:**
- Backend is configured to allow all origins in development
- For production, configure CORS in `server/index.js`

## Project Structure

```
Checkers4Pi/
├── server/
│   ├── index.js          # Express server
│   ├── config.js         # Configuration loader
│   └── routes/
│       └── payments.js   # Payment API routes
├── src/                  # React frontend
├── dist/                 # Built frontend (production)
└── .env                  # Environment variables
```

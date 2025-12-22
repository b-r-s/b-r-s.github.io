# Pi Network Payment Integration

## Payment Flow Overview

### What Pi Platform Handles Automatically

All payment dialogs and UI are **automatically created and managed by Pi Wallet and Pi Platform**:

1. **Payment approval dialog** - Shows amount, memo, asks user to confirm
2. **Wallet authentication** - User signs in to Pi Wallet if needed
3. **Transaction signing UI** - Secure wallet interface for blockchain signing
4. **Processing/loading screens** - While transaction submits to blockchain
5. **Confirmation/success screens** - After transaction completes
6. **Error dialogs** - If something goes wrong (insufficient funds, cancelled, etc.)

### What Your App Controls

- **Trigger payment** - Call `createPayment()` with amount and memo
- **Payment details** - Amount, memo text, metadata
- **Backend approval** - Server approves payment via `/api/approve`
- **Backend completion** - Server completes payment via `/api/complete`
- **UI updates** - Show purchased items/features after payment completes

## User Payment Experience

```
1. User clicks "Buy" button in your app
   ↓
2. [Pi Platform takes over]
   → Payment approval dialog appears
   → User authenticates with Pi Wallet
   → User reviews and signs transaction
   → Transaction submits to Pi Blockchain
   → Processing/confirmation screens
   ↓
3. [Returns to your app]
   → Your app receives completion callback
   → Update UI to reflect purchase
```

## Three-Phase Payment Flow

### Phase 1: Server-Side Approval
1. Frontend calls `createPayment()`
2. Callback `onReadyForServerApproval` receives `paymentId`
3. Frontend sends `paymentId` to your backend
4. **Backend calls Pi API:** `POST /payments/{paymentId}/approve`
5. User can now interact with payment dialog

### Phase 2: User Interaction (Handled by Pi)
- User confirms payment in Pi Wallet
- Transaction signed and submitted to blockchain
- **You don't write any code for this phase**

### Phase 3: Server-Side Completion
1. Callback `onReadyForServerCompletion` receives `txid`
2. Frontend sends `txid` to your backend
3. **Backend calls Pi API:** `POST /payments/{paymentId}/complete` with `txid`
4. Payment flow closes, user returns to your app

## Security

- **Never trust the client** - Users can fake payment completion
- **Always verify on backend** - Check blockchain transaction via Pi API
- **Server API Key** - Must be kept secret on server, never in client code
- **Incomplete payments** - If `/complete` fails, don't deliver goods

## Environment Setup

Required environment variables (in `.env`):

```bash
PI_API_KEY=your_server_api_key_from_developer_portal
PI_APP_ID=your_app_id_from_developer_portal
NODE_ENV=development
PORT=3000
```

Get credentials from: `develop.pi` (in Pi Browser)

## Reference Documentation

- [Pi Platform API](https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md)
- [Payment Flow Details](https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md)
- [SDK Reference](https://github.com/pi-apps/pi-platform-docs/blob/master/SDK_reference.md)

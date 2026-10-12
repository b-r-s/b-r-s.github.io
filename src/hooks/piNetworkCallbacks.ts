/**
 * Pi Network Payment Callbacks
 * These callbacks interact with the backend server for payments
 * 
 * SDK v2.0 Compliance Notes:
 * - onReadyForServerApproval may be called multiple times (retries every ~10s on failure)
 * - onReadyForServerCompletion may be called multiple times (retries every ~10s on failure)
 * - Always handle duplicate calls gracefully (idempotency)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => Promise<void>;
  onReadyForServerCompletion: (paymentId: string, txid: string) => Promise<void>;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: unknown) => void;
}

export const createRealPaymentCallbacks = (
  setCurrentPayment: (paymentId: string | null) => void,
  resolve: (result: PaymentResult) => void
): PaymentCallbacks => ({
  // Phase 1: Server-Side Approval
  // Note: This callback may be invoked multiple times if approval fails (retries every ~10s)
  onReadyForServerApproval: async (paymentId: string) => {
    setCurrentPayment(paymentId);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        // Don't resolve with failure yet - SDK will retry
        console.error('Approval request failed:', error.message);
      }
    } catch (error) {
      // Don't resolve with failure yet - SDK will retry
      console.error('Failed to contact server for approval:', error);
    }
  },

  // Phase 3: Server-Side Completion
  // Note: This callback may be invoked multiple times if completion fails (retries every ~10s)
  onReadyForServerCompletion: async (paymentId: string, txid: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, txid }),
      });

      const result = await response.json();

      if (!response.ok || !result.verified) {
        resolve({ 
          success: false, 
          error: result.message || 'Payment verification failed' 
        });
        return;
      }

      setCurrentPayment(null);
      resolve({ success: true, paymentId });

    } catch {
      resolve({ success: false, error: 'Failed to complete payment' });
    }
  },

  // User cancelled the payment
  onCancel: (paymentId: string) => {
    console.log('Payment cancelled by user:', paymentId);
    setCurrentPayment(null);
    resolve({ success: false, error: 'Payment cancelled by user' });
  },

  // Error occurred during payment flow
  onError: (error: Error) => {
    console.error('Payment error:', error.message);
    setCurrentPayment(null);
    resolve({ success: false, error: error.message });
  },
});

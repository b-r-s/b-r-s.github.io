/**
 * Pi Network Payment Callbacks
 * These callbacks interact with the backend server for payments
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => Promise<void>;
  onReadyForServerCompletion: (paymentId: string, txid: string) => Promise<void>;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

export const createRealPaymentCallbacks = (
  setCurrentPayment: (paymentId: string | null) => void,
  resolve: (result: { success: boolean; paymentId?: string; error?: string }) => void
): PaymentCallbacks => ({
  // Phase 1: Server-Side Approval
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
        resolve({ success: false, error: error.message || 'Approval failed' });
      }
    } catch (error) {
      resolve({ success: false, error: 'Failed to contact server' });
    }
  },

  // Phase 3: Server-Side Completion
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

    } catch (error) {
      resolve({ success: false, error: 'Failed to complete payment' });
    }
  },

  // User cancelled
  onCancel: (paymentId: string) => {
    setCurrentPayment(null);
    resolve({ success: false, error: 'Payment cancelled by user' });
  },

  // Error occurred
  onError: (error: Error, payment?: any) => {
    setCurrentPayment(null);
    resolve({ success: false, error: error.message });
  },
});

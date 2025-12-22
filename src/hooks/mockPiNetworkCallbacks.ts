/**
 * Mock Pi Network Payment Callbacks
 * These callbacks handle payments locally without calling the backend
 */

interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => Promise<void>;
  onReadyForServerCompletion: (paymentId: string, txid: string) => Promise<void>;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

export const createMockPaymentCallbacks = (
  setCurrentPayment: (paymentId: string | null) => void,
  resolve: (result: { success: boolean; paymentId?: string; error?: string }) => void
): PaymentCallbacks => ({
  // Phase 1: Server-Side Approval (MOCKED - no server call)
  onReadyForServerApproval: async (paymentId: string) => {
    console.log('🔧 [MOCK MODE] Payment ready for approval:', paymentId);
    setCurrentPayment(paymentId);
    console.log('🔧 [MOCK MODE] Skipping real server approval call');
    // No server call - mock SDK handles everything
  },

  // Phase 3: Server-Side Completion (MOCKED - no server call)
  onReadyForServerCompletion: async (paymentId: string, txid: string) => {
    console.log('🔧 [MOCK MODE] Payment ready for completion:', paymentId, txid);
    console.log('🔧 [MOCK MODE] Skipping real server completion call');
    console.log('✅ [MOCK MODE] Payment completed successfully');
    setCurrentPayment(null);
    resolve({ success: true, paymentId });
  },

  // User cancelled
  onCancel: (paymentId: string) => {
    console.log('🔧 [MOCK MODE] Payment cancelled by user:', paymentId);
    setCurrentPayment(null);
    resolve({ success: false, error: 'Payment cancelled by user' });
  },

  // Error occurred
  onError: (error: Error, payment?: any) => {
    console.error('🔧 [MOCK MODE] Payment error:', error, payment);
    setCurrentPayment(null);
    resolve({ success: false, error: error.message });
  },
});

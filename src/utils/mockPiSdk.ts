/**
 * Mock Pi Network SDK for local testing
 * Simulates the complete payment flow without Pi Browser
 */

interface MockPiUser {
  username: string;
  uid: string;
}

interface MockPiAuth {
  user: MockPiUser;
  accessToken: string;
}

interface MockPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

class MockPiNetwork {
  private authenticated = false;
  private user: MockPiUser | null = null;
  private version: string;
  private sandbox: boolean;

  constructor(config: { version: string; sandbox: boolean }) {
    this.version = config.version;
    this.sandbox = config.sandbox;
    console.log('🔧 [MOCK PI SDK] Initialized', { version: this.version, sandbox: this.sandbox });
  }

  async initialize(): Promise<void> {
    console.log('🔧 [MOCK PI SDK] Initializing...');
    await this.delay(500);
    console.log('✅ [MOCK PI SDK] Initialized successfully');
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  getUser(): MockPiUser | null {
    return this.user;
  }

  async authenticate(
    scopes: string[],
    callback: (error: Error | null, auth: MockPiAuth | null) => void
  ): Promise<void> {
    console.log('🔐 [MOCK PI SDK] Authentication requested with scopes:', scopes);
    
    const shouldAuthenticate = window.confirm(
      '🔐 Mock Pi Authentication\n\n' +
      `Scopes: ${scopes.join(', ')}\n\n` +
      'Click OK to authenticate as mock user'
    );

    await this.delay(1000);

    if (shouldAuthenticate) {
      this.authenticated = true;
      this.user = {
        username: 'mock_pioneer',
        uid: 'mock_uid_' + Date.now(),
      };

      console.log('✅ [MOCK PI SDK] Authentication successful:', this.user);
      
      callback(null, {
        user: this.user,
        accessToken: 'mock_access_token_' + Date.now(),
      });
    } else {
      console.log('❌ [MOCK PI SDK] Authentication cancelled');
      callback(new Error('Authentication cancelled'), null);
    }
  }

  createPayment(
    config: { amount: number; memo: string; metadata: Record<string, unknown> },
    callbacks: MockPaymentCallbacks
  ): void {
    console.log('💰 [MOCK PI SDK] Creating payment...', config);

    if (!this.authenticated) {
      console.error('❌ [MOCK PI SDK] Not authenticated');
      callbacks.onError(new Error('Not authenticated'));
      return;
    }

    const paymentId = 'mock_payment_' + Date.now();
    
    // Show payment dialog
    const confirmPayment = window.confirm(
      '💰 Pi Payment Request\n\n' +
      `Amount: ${config.amount} π\n` +
      `Memo: ${config.memo}\n\n` +
      'Click OK to proceed with payment'
    );

    if (!confirmPayment) {
      console.log('❌ [MOCK PI SDK] Payment cancelled by user');
      callbacks.onCancel(paymentId);
      return;
    }

    // Phase 1: Server-Side Approval
    console.log('📝 [MOCK PI SDK] Phase 1: Server-Side Approval');
    console.log('   Payment ID:', paymentId);
    
    setTimeout(() => {
      console.log('   → Calling onReadyForServerApproval...');
      callbacks.onReadyForServerApproval(paymentId);

      // Simulate server approval delay
      setTimeout(() => {
        console.log('   ✅ Server approved payment');
        
        // Phase 2: User Interaction (Blockchain)
        console.log('🔗 [MOCK PI SDK] Phase 2: Blockchain Transaction');
        
        const txid = 'mock_tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.log('   Simulating blockchain transaction...');
        console.log('   Transaction ID:', txid);

        // Show signing dialog
        const signTransaction = window.confirm(
          '🔗 Sign Blockchain Transaction\n\n' +
          `Amount: ${config.amount} π\n` +
          `To: Checkers4Pi App\n` +
          `TxID: ${txid.substr(0, 20)}...\n\n` +
          'Click OK to sign and submit transaction'
        );

        if (!signTransaction) {
          console.log('   ❌ Transaction signing cancelled');
          callbacks.onCancel(paymentId);
          return;
        }

        setTimeout(() => {
          console.log('   ✅ Transaction submitted to blockchain');

          // Phase 3: Server-Side Completion
          console.log('🎉 [MOCK PI SDK] Phase 3: Server-Side Completion');
          console.log('   → Calling onReadyForServerCompletion...');
          
          callbacks.onReadyForServerCompletion(paymentId, txid);

          setTimeout(() => {
            console.log('   ✅ Payment completed successfully');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎊 PAYMENT FLOW COMPLETE!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          }, 1000);

        }, 2000); // Blockchain submission delay

      }, 1500); // Server approval delay

    }, 1000); // Initial delay before approval callback
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export mock Pi Network
export const MockPi = {
  PiNetwork: MockPiNetwork,
};

// Helper to check if we're in a browser that supports Pi SDK
export const isPiBrowserAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'Pi' in window;
};

// Console banner for mock mode
export const showMockBanner = (): void => {
  console.log('%c🔧 MOCK MODE ACTIVE', 'background: #f59e0b; color: white; padding: 8px 16px; font-size: 16px; font-weight: bold;');
  console.log('%cPi Network SDK is not available. Using mock implementation for local testing.', 'color: #f59e0b; font-size: 12px;');
  console.log('%cAll payment dialogs and flows are simulated. No real transactions will occur.', 'color: #9ca3af; font-size: 11px;');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

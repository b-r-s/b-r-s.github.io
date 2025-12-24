import { useState, useMemo } from 'react';
import * as PiSDK from '@xhilo/pi-sdk';
import { createRealPaymentCallbacks } from './piNetworkCallbacks';

// Type definitions for Pi Network SDK
interface PiUser {
  username: string;
  uid: string;
}

interface PiAuth {
  user: PiUser;
  accessToken: string;
}

interface PiPaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  from_address: string;
  to_address: string;
  direction: string;
  created_at: string;
  network: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: {
    txid: string;
    verified: boolean;
    _link: string;
  } | null;
}

interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPaymentDTO) => void;
}

interface PiNetworkInstance {
  initialize: () => Promise<void>;
  isAuthenticated: () => boolean;
  getUser: () => PiUser | null;
  authenticate: (scopes: string[], callback: (error: Error | null, auth: PiAuth | null) => void) => Promise<void>;
  createPayment: (
    config: { amount: number; memo: string; metadata: Record<string, unknown> },
    callbacks: PaymentCallbacks
  ) => void;
}

// Handle both default and named exports from Pi SDK
const PiNetwork = 
  (PiSDK as Record<string, unknown>).PiNetwork || 
  ((PiSDK as Record<string, unknown>).default as Record<string, unknown> | undefined)?.PiNetwork || 
  (PiSDK as Record<string, unknown>).default;

export const usePiNetwork = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<PiUser | null>(null);
  const [currentPayment, setCurrentPayment] = useState<string | null>(null);

  // Initialize Pi SDK instance once
  const pi = useMemo<PiNetworkInstance | null>(() => {
    if (typeof PiNetwork !== 'function') {
      return null;
    }

    try {
      const piInstance = new (PiNetwork as new (config: { version: string; sandbox: boolean }) => PiNetworkInstance)({
        version: "2.0",
        sandbox: true,
      });

      // Initialize and check authentication
      piInstance.initialize().then(() => {
        if (piInstance.isAuthenticated()) {
          setIsAuthenticated(true);
          setUser(piInstance.getUser());
        }
      }).catch(() => {
        // Silent catch - SDK not available
      });

      return piInstance;
    } catch {
      return null;
    }
  }, []);

  const authenticate = async () => {
    if (!pi) return;

    try {
      await pi.authenticate(['username', 'payments'], (error: Error | null, auth: PiAuth | null) => {
        if (error) {
          return;
        }

        if (auth) {
          setIsAuthenticated(true);
          setUser(auth.user);
        }
      });
    } catch {
      // Silent catch
    }
  };

  const createPayment = async (
    amount: number, 
    memo: string, 
    metadata: Record<string, unknown> = {}
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> => {
    if (!pi || !isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }

    return new Promise((resolve) => {
      try {
        const callbacks = createRealPaymentCallbacks(setCurrentPayment, resolve);

        pi.createPayment(
          {
            amount,
            memo,
            metadata: {
              ...metadata,
              gameId: 'checkers4pi',
            },
          },
          callbacks
        );
      } catch {
        resolve({ success: false, error: 'Failed to create payment' });
      }
    });
  };

  return {
    pi,
    isAuthenticated,
    user,
    currentPayment,
    authenticate,
    createPayment,
  };
};

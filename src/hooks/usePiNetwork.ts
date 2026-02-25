import { useState, useMemo, useEffect } from 'react';
import { PiNetworkClient } from '@xhilo/pi-sdk';

// Type definitions for Pi Network SDK alignment
interface PiUser {
  username: string;
  uid: string;
}

export const usePiNetwork = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<PiUser | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'cancelled' | 'error'>('idle');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
    console.log(`[Pi Debug ${ts}] ${msg}`);
    setDebugLog(prev => [...prev.slice(-20), `${ts} ${msg}`]);
  };

  // Initialize Pi SDK instance
  const pi = useMemo(() => {
    try {
      // MANDATORY: Manually trigger the global Pi init for the Sandbox/Portal handshake
      if (typeof window !== 'undefined' && (window as any).Pi) {
        // We initialize version 2.0. We don't force sandbox: true here
        // to allow native Pi Browser auth to work without origin mismatches.
        (window as any).Pi.init({ version: "2.0" });
        console.log("Pi SDK Global Init: Success");
      }

      // Return the client wrapper
      return new PiNetworkClient(true);
    } catch (error) {
      console.error("Pi SDK Init Error:", error);
      return null;
    }
  }, []);

  // Initialize and check authentication on mount
  useEffect(() => {
    if (!pi) return;

    pi.initialize().then((result: any) => {
      // Check if result exists and is successful
      if (result && result.success) {
        const currentUser = pi.getUser();
        if (currentUser) {
          setIsAuthenticated(true);
          setUser({
            uid: currentUser.uid,
            username: currentUser.username || ''
          });
        }
      }
    }).catch((err: any) => {
      console.warn('Pi Initialization silent catch:', err);
    });
  }, [pi]);

  const authenticate = async () => {
    if (!pi) return;

    try {
      // Simplified authentication: Only ask for 'username'
      // We keep the empty callback () => {} because the SDK requires it
      const result = await pi.authenticate(['username', 'payments'], (_payment: any) => {
        console.log('Sandbox safety check: No payment logic active.');
      });

      if (result && result.success && result.data) {
        setIsAuthenticated(true);
        setUser({
          uid: result.data.uid,
          username: result.data.username || ''
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error; // Re-throw so callers (App.tsx) can handle it
    }
  };

  const createPayment = async (amount: number, memo: string) => {
    // Bypass the @xhilo/pi-sdk wrapper and call window.Pi directly.
    // The wrapper has been unreliable for relaying payment callbacks in Pi Browser.
    const PiGlobal = (window as any).Pi;
    if (!PiGlobal) {
      console.error('window.Pi not available');
      setPaymentStatus('error');
      return;
    }
    setPaymentStatus('pending');
    setDebugLog([]);
    addLog(`createPayment called: ${amount}π "${memo}"`);
    addLog(`isAuthenticated: ${isAuthenticated}`);
    addLog(`window.Pi available: ${!!PiGlobal}`);
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
    addLog(`apiBase: "${apiBase || '(same-domain)'}"`);

    // Pi requires an authenticated session with 'payments' scope before createPayment.
    // If the 8s startup timeout fired before auth completed, re-authenticate now.
    if (!isAuthenticated) {
      addLog('Not authenticated — re-authenticating with payments scope...');
      try {
        await authenticate();
        addLog('Re-auth success');
      } catch (e) {
        addLog(`Re-auth failed: ${e}`);
        setPaymentStatus('error');
        return;
      }
    }

    try {
      addLog('Calling PiGlobal.createPayment...');
      await PiGlobal.createPayment(
        { amount, memo, metadata: { source: 'tip_developer' } },
        {
          onReadyForServerApproval: (paymentId: string) => {
            addLog(`onReadyForServerApproval: ${paymentId}`);
            fetch(`${apiBase}/api/payments/approve`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            })
              .then(async r => {
                const data = await r.json();
                if (!r.ok) {
                  addLog(`APPROVE FAILED ${r.status}: ${JSON.stringify(data)}`);
                } else {
                  addLog(`APPROVE OK: ${JSON.stringify(data).slice(0, 80)}`);
                }
              })
              .catch(err => addLog(`APPROVE FETCH ERROR: ${err}`));
          },
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            addLog(`onReadyForServerCompletion txid: ${txid}`);
            fetch(`${apiBase}/api/payments/complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            })
              .then(async r => {
                const data = await r.json();
                if (!r.ok) {
                  addLog(`COMPLETE FAILED ${r.status}: ${JSON.stringify(data)}`);
                  setPaymentStatus('error');
                } else {
                  addLog(`COMPLETE OK`);
                  setPaymentStatus('success');
                }
              })
              .catch(err => {
                addLog(`COMPLETE FETCH ERROR: ${err}`);
                setPaymentStatus('error');
              });
          },
          onCancel: (paymentId: string) => {
            addLog(`onCancel: ${paymentId}`);
            setPaymentStatus('cancelled');
          },
          onError: (error: any, payment: any) => {
            addLog(`onError: ${error} payment:${JSON.stringify(payment).slice(0,60)}`);
            setPaymentStatus('error');
          },
        }
      );
      addLog('createPayment promise resolved');
    } catch (error) {
      addLog(`createPayment THREW: ${error}`);
      setPaymentStatus('error');
    }
  };

  return {
    pi,
    isAuthenticated,
    user,
    authenticate,
    createPayment,
    paymentStatus,
    debugLog,
    resetPaymentStatus: () => { setPaymentStatus('idle'); setDebugLog([]); },
  };
};
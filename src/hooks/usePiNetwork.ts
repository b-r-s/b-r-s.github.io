import { useState, useEffect } from 'react';
// Fully bypasses @xhilo/pi-sdk — calls window.Pi directly.
// The wrapper was silently swallowing callbacks in Pi Browser.

interface PiUser {
  username: string;
  uid: string;
}

const getPi = () => (window as any).Pi ?? null;

export const usePiNetwork = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<PiUser | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'cancelled' | 'error'>('idle');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const ts = new Date().toISOString().slice(11, 23);
    console.log(`[Pi ${ts}] ${msg}`);
    setDebugLog(prev => [...prev.slice(-20), `${ts} ${msg}`]);
  };

  // Init Pi SDK on mount
  useEffect(() => {
    const Pi = getPi();
    if (!Pi) return;
    try {
      Pi.init({ version: '2.0' });
      console.log('[Pi] SDK init OK');
    } catch (e) {
      console.warn('[Pi] SDK init error:', e);
    }
  }, []);

  const authenticate = async () => {
    const Pi = getPi();
    if (!Pi) throw new Error('window.Pi not available');

    // onIncompletePaymentFound is required by the SDK signature
    const result = await Pi.authenticate(
      ['username', 'payments'],
      (_incompletePayment: any) => {
        console.log('[Pi] Incomplete payment during auth — ignoring');
      }
    );

    if (result?.user) {
      setIsAuthenticated(true);
      setUser({ uid: result.user.uid, username: result.user.username || '' });
    } else if (result?.accessToken) {
      // Some SDK versions return accessToken at root level
      setIsAuthenticated(true);
    }
    return result;
  };

  const createPayment = async (amount: number, memo: string) => {
    const Pi = getPi();
    setPaymentStatus('pending');
    setDebugLog([]);
    addLog(`createPayment: ${amount}π`);
    addLog(`isAuthenticated: ${isAuthenticated}`);
    addLog(`window.Pi: ${!!Pi}`);

    if (!Pi) {
      addLog('ERROR: window.Pi not available');
      setPaymentStatus('error');
      return;
    }

    if (!isAuthenticated) {
      addLog('Not authenticated — calling Pi.authenticate now...');
      try {
        await authenticate();
        addLog('Auth OK');
      } catch (e) {
        addLog(`Auth FAILED: ${e}`);
        setPaymentStatus('error');
        return;
      }
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
    addLog('Calling Pi.createPayment...');

    // Pre-warm the serverless function so the cold-start delay doesn't consume
    // the 60-second approval window that Pi gives us.
    // Ping the approve route specifically (not just health) to warm the exact code path.
    try {
      await fetch(`${apiBase}/api/payments/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: '__warmup__' }),
      });
      addLog('Server warm');
    } catch (_) {
      addLog('Server pre-warm failed — continuing anyway');
    }

    try {
      await Pi.createPayment(
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
    isAuthenticated,
    user,
    authenticate,
    createPayment,
    paymentStatus,
    debugLog,
    resetPaymentStatus: () => { setPaymentStatus('idle'); setDebugLog([]); },
  };
};
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
    const line = `${ts} ${msg}`;
    console.log(`[Pi] ${line}`);
    setDebugLog(prev => {
      const next = [...prev.slice(-20), line];
      try { localStorage.setItem('pi_debug_log', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  // Restore log from localStorage on mount (survives Pi Browser navigation away/back)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pi_debug_log');
      if (saved) setDebugLog(JSON.parse(saved));
    } catch (_) {}
  }, []);

  const approvePayment = (paymentId: string, apiBase: string) => {
    // Store in localStorage immediately — survives page reload if beacon fails
    try { localStorage.setItem('pi_pending_approval', JSON.stringify({ paymentId, apiBase, ts: Date.now() })); } catch (_) {}

    const url = `${apiBase}/api/payments/approve`;
    const body = JSON.stringify({ paymentId });

    // sendBeacon fires even when the page is frozen/navigating away
    const sent = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    addLog(`sendBeacon approve: ${sent ? 'queued' : 'failed — trying fetch'}`);

    if (!sent) {
      // Fallback: keepalive fetch
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
        .then(async r => { const d = await r.json(); addLog(`APPROVE ${r.ok ? 'OK' : 'FAILED ' + r.status}: ${JSON.stringify(d).slice(0,60)}`); })
        .catch(err => addLog(`APPROVE FETCH ERROR: ${err}`));
    }
  };

  // On mount: check for a pending approval that survived a page reload
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
    try {
      const raw = localStorage.getItem('pi_pending_approval');
      if (raw) {
        const { paymentId, ts } = JSON.parse(raw);
        const age = Date.now() - ts;
        if (age < 55000) { // still within Pi's 60s window
          addLog(`Retrying pending approval from ${Math.round(age/1000)}s ago: ${paymentId.slice(0,10)}...`);
          localStorage.removeItem('pi_pending_approval');
          fetch(`${apiBase}/api/payments/approve`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          }).then(async r => {
            const d = await r.json();
            addLog(`RETRY APPROVE ${r.ok ? 'OK' : 'FAILED ' + r.status}: ${JSON.stringify(d).slice(0,60)}`);
          }).catch(err => addLog(`RETRY APPROVE ERROR: ${err}`));
        } else {
          addLog(`Pending approval expired (${Math.round(age/1000)}s old) — clearing`);
          localStorage.removeItem('pi_pending_approval');
        }
      }
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // onIncompletePaymentFound is Pi's built-in retry mechanism:
    // if a previous payment was created but not approved, Pi calls this on auth.
    const result = await Pi.authenticate(
      ['username', 'payments'],
      (incompletePayment: any) => {
        const paymentId = incompletePayment?.identifier;
        console.log('[Pi] Incomplete payment found:', paymentId);
        if (paymentId) {
          const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
          addLog(`Incomplete payment found: ${paymentId.slice(0,10)}... approving now`);
          approvePayment(paymentId, apiBase);
        }
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
            addLog(`onReadyForServerApproval: ${paymentId.slice(0,10)}...`);
            approvePayment(paymentId, apiBase);
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
    resetPaymentStatus: () => {
      setPaymentStatus('idle');
      setDebugLog([]);
      try { localStorage.removeItem('pi_debug_log'); } catch (_) {}
    },
  };
};
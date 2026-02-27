import { useState, useEffect, useRef } from 'react';
// Fully bypasses @xhilo/pi-sdk — calls window.Pi directly.
// The wrapper was silently swallowing callbacks in Pi Browser.

interface PiUser {
  username: string;
  uid: string;
}

// Returns window.Pi unless in dev mode (localhost or VITE_DEV_NO_PI)
const isDevMode = () => {
  // Vite sets import.meta.env.DEV to true in dev mode
  if (import.meta.env.DEV) return true;
  // Allow override via env var
  if (import.meta.env.VITE_DEV_NO_PI === 'true') return true;
  // Fallback: check if running on localhost
  if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') return true;
  return false;
};

const getPi = () => {
  if (isDevMode()) return null;
  return (window as any).Pi ?? null;
};

export const usePiNetwork = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<PiUser | null>(null);
  // Track in-flight auth promise so we never call Pi.authenticate twice simultaneously
  const authPromiseRef = useRef<Promise<any> | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'cancelled' | 'error'>('idle');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const ts = new Date().toISOString().slice(11, 23);
    const line = `${ts} ${msg}`;
    console.log(`[Pi] ${line}`);
    // Write to localStorage SYNCHRONOUSLY — before React state update
    // so it survives Pi Browser freezing the JS thread
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('pi_debug_log') || '[]');
      const next = [...existing.slice(-20), line];
      localStorage.setItem('pi_debug_log', JSON.stringify(next));
      localStorage.setItem('pi_debug_log_ts', String(Date.now()));
    } catch (_) {}
    setDebugLog(prev => [...prev.slice(-20), line]);
  };

  // Restore log from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pi_debug_log');
      if (saved) {
        const lines: string[] = JSON.parse(saved);
        setDebugLog(lines);
        // Only restore pending state if the log is very recent (< 30s old)
        // to avoid showing stale payment state after app reload
        const savedTs = localStorage.getItem('pi_debug_log_ts');
        const age = savedTs ? Date.now() - parseInt(savedTs) : 99999999;
        const last = lines[lines.length - 1] ?? '';
        if (age < 30000 && (last.includes('sendBeacon') || last.includes('onReadyForServer'))) {
          setPaymentStatus('pending');
        }
      }
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

  // Init Pi SDK and authenticate on mount
  useEffect(() => {
    if (isDevMode()) {
      setIsAuthenticated(true);
      setUser({ uid: 'devuser', username: 'devuser' });
      console.log('[Pi] Dev mode: skipping Pi SDK init/auth');
      return;
    }
    const Pi = getPi();
    if (!Pi) return;
    try {
      Pi.init({ version: '2.0', sandbox: false }); // false = production / externally-hosted app
      console.log('[Pi] SDK init OK (sandbox: false)');
    } catch (e) {
      console.warn('[Pi] SDK init error:', e);
      return;
    }
    // Authenticate immediately on load — store promise in ref so createPayment can await it
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
    console.log('[Pi] Starting auth on mount...');
    authPromiseRef.current = Pi.authenticate(
      ['username', 'payments'],
      (incompletePayment: any) => {
        const paymentId = incompletePayment?.identifier;
        if (paymentId) {
          console.log('[Pi] Incomplete payment on auth, approving:', paymentId);
          fetch(`${apiBase}/api/payments/approve`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          }).catch(() => {});
        }
      }
    ).then((result: any) => {
      if (result?.user) {
        setIsAuthenticated(true);
        setUser({ uid: result.user.uid, username: result.user.username || '' });
        console.log('[Pi] Auth on mount OK:', result.user.username);
      } else if (result?.accessToken) {
        setIsAuthenticated(true);
        console.log('[Pi] Auth on mount OK (accessToken)');
      }
      return result;
    }).catch((e: any) => {
      console.warn('[Pi] Auth on mount failed:', e);
      authPromiseRef.current = null;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authenticate = async () => {
    if (isDevMode()) {
      setIsAuthenticated(true);
      setUser({ uid: 'devuser', username: 'devuser' });
      return { user: { uid: 'devuser', username: 'devuser' } };
    }
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
    if (isDevMode()) {
      // Simulate payment flow in dev mode
      setPaymentStatus('pending');
      setDebugLog([]);
      addLog(`DEV MODE: createPayment: ${amount}π`);
      setTimeout(() => {
        addLog('DEV MODE: Payment success');
        setPaymentStatus('success');
      }, 1000);
      return;
    }
    const Pi = getPi();
    // Clear old localStorage log immediately so DebugPanel shows fresh data
    try { localStorage.removeItem('pi_debug_log'); } catch (_) {}
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
      addLog('Waiting for auth...');
      try {
        // Reuse the in-flight auth promise from mount — never call Pi.authenticate twice
        // Race against 20s timeout so we never hang forever
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('auth timeout (20s)')), 20000)
        );
        const result = await Promise.race([
          authPromiseRef.current ?? Promise.resolve(null),
          timeoutPromise,
        ]);
        if (result?.user || result?.accessToken) {
          addLog('Auth OK');
          // isAuthenticated state may not have updated yet — continue anyway since result is valid
        } else {
          addLog('Auth returned no user — aborting');
          setPaymentStatus('error');
          return;
        }
      } catch (e) {
        let errMsg = (typeof e === 'object' && e && 'message' in e) ? (e as any).message : String(e);
        addLog(`Auth FAILED: ${errMsg}`);
        setPaymentStatus('error');
        // Store error for UI display if needed
        try { localStorage.setItem('pi_auth_error', errMsg); } catch (_) {}
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
      Pi.createPayment(
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
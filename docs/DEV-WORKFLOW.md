# 🛠️ Device Sync Workflow: Desktop & Mobile

Use this checklist to maintain the link between your local code (Desktop) and your Pi Identity (Mobile).

---

## 1. Setup Phase (One-Time)
* [ ] **Local Server:** Start the app on Desktop (e.g., `npm run dev` or `live-server`).
* [ ] **Identify URL:** Note your local address (usually `http://localhost:3000`).
* [ ] **Developer Portal:** Open `pi://develop.pinet.com` on your **Phone**.
* [ ] **App Entry:** Ensure "Development URL" matches your local address exactly.

## 2. The "Handshake" (Every Session)
1. **On Desktop:** * Open the Sandbox URL provided by the Developer Portal in Chrome/Edge.
   * Keep the 8-digit **Authorization Code** visible.
2. **On Mobile (Pi Browser):**
   * Go to **Pi Utilities** > **Authorize Sandbox**.
   * Enter the code from your Desktop.
3. **On Desktop:**
   * Your local app should now refresh. `Pi.authenticate()` will now work using your phone's credentials.

## 3. Recording the Demo Video
* **Option A (Screen Recording):** Record the Desktop Sandbox window. This is the cleanest way to show the UI and the "Authenticated as..." status.
* **Option B (Mobile Mirroring):** Use a tool like **Vysor** or **AirPlay** to show your phone screen while you interact with the app.
* **Key Shot:** Make sure to capture the moment the **Pi Consent Popup** appears and you tap "Allow."

### Resetting Authentication (To show the popup again)
If you are already authorized, you won't see the consent popup. To force it to appear for your video:
1. **Revoke Permissions:** 
   * Open the main **Pi Network App** (mining app) on your phone.
   * Menu > **Settings** > **App Permissions**.
   * Find your app and tap **Remove/Revoke**.
2. **Clear Application Cache:**
   * In the Pi Browser, you may need to clear the app cache or use the `logout()` function if available in your UI to ensure the state resets.
3. **Re-Initialize:** The next time you open the app, `Pi.authenticate()` will trigger the system prompt again.

## 4. Troubleshooting
* **Refresh Issue:** If the desktop app loses connection, re-run the "Authorize Sandbox" step on the phone.
* **White Screen:** Ensure your Desktop Firewall isn't blocking the local port (3000, 8080, etc.).
* **SDK Error:** Double-check that `sandbox: true` is set in your `Pi.init` code.

---
*Reference: Pi Network 2026 Developer Guidelines*
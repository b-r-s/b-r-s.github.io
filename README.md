# Checkers4Pi: Advanced AI Strategy

> **A high-performance, mobile-optimized Checkers engine built for the Pi Network Ecosystem.**

---

## 📖 Overview

Pi Checkers is a decentralized web application (dApp) that brings professional-grade AI strategy to the Pi Network. Built with React and TypeScript, it features a custom-built Minimax engine with Alpha-Beta pruning, offering three levels of difficulty for Pioneers worldwide.

---

## Key Features
- **Three AI Difficulties:** From "Beginner" (Randomized) to "Advanced" (Deep-thinking Minimax)
- **Mandatory Jump Logic:** Fully compliant with standard American Checkers rules
- **Mobile-First Design:** Optimized for the Pi Browser web-view with zero-latency touch controls
- **Pi SDK Integration:** Seamless Pioneer authentication and Pi-specific UI themes

---

## 🛠 Technical Stack
- **Frontend:** React 19 + TypeScript
- **State Management:** Custom React Hooks (`useGameState`)
- **AI Engine:** Minimax Algorithm with Alpha-Beta Pruning
- **Styling:** Tailwind CSS (Optimized for Pi Network purple/gold palette)

---
## 📚 Internal Documentation
For deeper dives into specific parts of this app, see:
* [Architecture](./docs/ARCHITECTURE.md)
* [AI Strategy & Minimax Logic](./docs/ARCHITECTURE.md)
* [Tax Data Extraction Guide](./docs/TAX-PROCESSING.md)
* [Pi Network Theme Guidelines](./docs//UI-GUIDELINES.md)

---

## 🏗 Pi Network Integration
This application is designed to function within the Pi Browser environment.

### 1. SDK Authentication
We utilize `window.Pi.authenticate()` to ensure every user is a verified Pioneer.

```typescript
// Sample integration found in usePiSDK.ts
const scopes = ['username'];
const onIncompletePaymentFound = (payment) => { /* ... */ };

window.Pi.authenticate(scopes, onIncompletePaymentFound).then(function(auth) {
  console.log(`Hi, ${auth.user.username}!`);
});
```

### 2. PiOS Compliance
This project is licensed under the PiOS (Pi Open Source) License.

> **Trademark Note:** "Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company."

This code is intended for use exclusively within the Pi Ecosystem.

---

## 🚀 Installation & Local Development
If you are a community developer looking to contribute or audit the code:

1. **Clone the repo:**
   ```sh
   git clone https://github.com/your-username/pi-checkers.git
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Run in Sandbox Mode:**
   Set `REACT_APP_PI_SANDBOX=true` in your `.env` to test SDK features without the Pi Browser.
4. **Launch:**
   ```sh
   npm start
   ```

---

## 📝 Roadmap
- [x] Core Game Engine & Mandatory Jumps
- [x] Advanced Minimax AI (v1.0)
- [ ] Next: Pi Ad Network integration for developer rewards
- [ ] Next: Multi-Pioneer "Live" Matches via WebSockets

---

## 🤝 Contributing
Contributions are welcome! Please ensure all PRs include updated TypeScript types and pass the useEffect hygiene audit.

**Developer:** [Your Name/Handle]  
**Pi Wallet (Testnet):** [Your Testnet Address]

---

## Why this might be "Better"

<!-- Add your unique value proposition here -->
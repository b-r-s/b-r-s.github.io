# Checkers4Pi: Advanced AI Strategy

> **A high-performance, mobile-optimized Checkers engine built for the Pi Network Ecosystem.**

---

## 📖 Overview

**Checkers4Pi** is a decentralized web application (dApp) that brings professional-grade AI strategy to the Pi Network. Built with React and TypeScript, it features a custom-built Minimax engine with Alpha-Beta pruning, offering three levels of difficulty for Pioneers worldwide.

---

## ✨ Key Features
- **Three AI Difficulties:** From "Beginner" to "Advanced" (4-6 ply search depth).
- **Mandatory Jump Logic:** Fully compliant with standard American Checkers rules.
- **Mobile-First Design:** Optimized for the Pi Browser web-view with zero-latency touch controls.
- **Privacy-First:** No collection of personal data; all game logic runs client-side.

---


## 🛠 Technical Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Deployment:** Hosted on Vercel (Optimized for Pi Browser Webviews)
- **AI Engine:** Minimax Algorithm with Alpha-Beta Pruning ([Strategy Doc](./docs/AI-STRATEGY.md))
- **Styling:** Custom Vanilla CSS (Zero-framework architecture for high-contrast mobile play and minimal bundle size)

---

## 📚 Documentation
- [AI Strategy & Logic](./docs/AI-STRATEGY.md)
- [Privacy Policy](./docs/PRIVACY.md)
- [UI & Theme Guidelines](./docs/UI-GUIDELINES.md)

---

## 🏗 Pi Network Integration
This application is designed to function exclusively within the Pi Browser.

### 1. SDK Authentication
We utilize `window.Pi.authenticate()` to ensure every user is a verified Pioneer.

### 2. PiOS Compliance
This project is licensed under the PiOS (Pi Open Source) License.
> **Trademark Note:** Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company.

---

## 🚀 Local Development
1. **Clone & Install:** `git clone ... && npm install`
2. **Sandbox Mode:** Set `REACT_APP_PI_SANDBOX=true` in `.env`.
3. **Launch:** `npm run dev`
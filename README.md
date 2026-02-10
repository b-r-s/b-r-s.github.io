# Checkers4Pi: Advanced AI Strategy

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white) [![License](https://img.shields.io/badge/License-PiOS-674198)](./LICENSE)

> **A high-performance, mobile-optimized Checkers engine built for the Pi Network Ecosystem.**

---

## 📖 Overview

**Checkers4Pi** is a decentralized web application (dApp) that brings professional-grade AI strategy to the Pi Network. Built with React and TypeScript, it features a custom-built Minimax engine with Alpha-Beta pruning, offering three levels of difficulty for Pioneers worldwide. This game has been developed specifically for the Pi Network Ecosystem; the application and documentation provide significant value to developers wishing to contribute to the growing collection of Pi-native games.

---

## ✨ Key Features
- **Three AI Difficulties:** From "Beginner" to "Advanced" (4-6 ply search depth).
- **Mandatory Jump Logic:** Fully compliant with standard American Checkers rules.
- **Mobile-First Design:** Optimized for the Pi Browser web-view with zero-latency touch controls.
- **Privacy-First:** No collection of personal data; all game logic runs client-side.

---

## 🛠 Technical Stack

- **Frontend:** ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite&logoColor=white)
- **Deployment:** ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white) (Optimized for Pi Browser Webviews)
- **AI Engine:** ![Strategy](https://img.shields.io/badge/Logic-Minimax--Alpha--Beta-red) ([Strategy Doc](./docs/AI-STRATEGY.md))
- **Styling:** ![CSS3](https://img.shields.io/badge/Styling-Vanilla--CSS-1572B6?logo=css3&logoColor=white) (Zero-framework architecture for high-contrast mobile play)

---

## 📚 Documentation
- [AI Strategy & Logic](./docs/AI-STRATEGY.md)
- [Privacy Policy](./docs/PRIVACY.md)
- [UI & Theme Guidelines](./docs/UI-GUIDELINES.md)

---

## 📸 App Walkthrough

<table align="center" style="border-spacing: 10px;">
  <tr>
    <td align="center"><b>1. Splash Screen</b></td>
    <td align="center"><b>2. Game Play</b></td>
    <td align="center"><b>3. Checker Colors</b></td>
  </tr>
  <tr>
    <td><img src="./docs/readme-images/Splash Screen.png" width="200" alt="Splash Screen"></td>
    <td><img src="./docs/readme-images/Game Play Screen.png" width="200" alt="Game Play Screen"></td>
    <td><img src="./docs/readme-images/Checker Color Selector.png" width="200" alt="Checker Color Selector"></td>
  </tr>
  <tr>
    <td align="center"><small>Start game or view instructions</small></td>
    <td align="center"><small>Rules and options menu</small></td>
    <td align="center"><small>Customize your pieces</small></td>
  </tr>
  <tr>
    <td align="center"><b>4. Board Colors</b></td>
    <td align="center"><b>5. AI Difficulty</b></td>
    <td></td>
  </tr>
  <tr>
    <td><img src="./docs/readme-images/Game Stats Panel.png" width="200" alt="Game Stats Panel"></td>
    <td><img src="./docs/readme-images/AI Difficulty Selector.png" width="200" alt="AI Difficulty Selector"></td>
    <td></td>
  </tr>
  <tr>
    <td align="center"><small>Customize square colors</small></td>
    <td align="center"><small>Set the AI challenge level</small></td>
    <td></td>
  </tr>
</table>

---

## 🏗 Pi Network Integration
This application is designed to function exclusively within the Pi Browser.

### 1. SDK Authentication
We utilize `window.Pi.authenticate()` to ensure every user is a verified Pioneer.

### 2. PiOS Compliance
This project is licensed under the [PiOS (Pi Open Source) License](./LICENSE).
> **Trademark Note:** Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company.

---

## 🚀 Local Development

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/b-r-s/Checkers4Pi.git
   cd Checkers4Pi
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env` file in the root directory and add:
   ```env
   REACT_APP_PI_SANDBOX=true
   ```
4. **Launch Application:**
   ```bash
   npm run dev
   ```
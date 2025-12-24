# Checkers4Pi - Deployment Checklist

## 🚨 Critical Issues to Address

### 1. Sandbox Mode Configuration
**Status:** ⚠️ TO DO  
**Location:** `src/hooks/usePiNetwork.ts` (Line 83)  
**Current:** `sandbox: true`  
**Action:**
- Keep `sandbox: true` for TestNet testing
- Change to `sandbox: false` ONLY when moving to MainNet

### 2. Environment Variables
**Status:** ⚠️ PARTIALLY DONE  
**Current State:**
- ✅ `PI_API_KEY` is set
- ❌ `PI_APP_ID` needs to be updated from "your_app_id_here"

**Action:**
1. Go to [Pi Developer Portal](https://developers.minepi.com/)
2. Create or access your app
3. Copy your actual `PI_APP_ID`
4. Update `.env` file

### 3. Production API URL
**Status:** ⚠️ TO DO  
**Location:** `src/hooks/piNetworkCallbacks.ts` (Line 6)  
**Current:** Defaults to `http://localhost:3000/api`

**Action:**
1. Get your production server URL from your friend
2. Create a `.env` file with:
   ```
   VITE_API_BASE_URL=https://your-server-domain.com/api
   ```

---

## 📋 Before Uploading to Server

### Required Steps:
- [ ] Update `PI_APP_ID` in `.env` file
- [ ] Set `VITE_API_BASE_URL` environment variable
- [ ] Test locally with `npm run build` && `npm start`
- [ ] Verify the built `dist/` folder works correctly

### Files to Upload:
- [ ] All source code (`src/`, `server/`, etc.)
- [ ] Configuration files (`package.json`, `vite.config.ts`, etc.)
- [ ] `.env` file (with production values)
- [ ] **DO NOT** upload: `node_modules/`, `.git/`, `dist/`

### On the Server:
- [ ] Run `npm install --production`
- [ ] Run `npm run build`
- [ ] Start server with `npm start`
- [ ] Ensure server has Node.js 18+ installed
- [ ] Configure firewall to allow traffic on your PORT (default 3000)

---

## 🧪 Testing Phase (TestNet)

### Initial Testing:
- [ ] Access game through Pi Browser on mobile device
- [ ] Test Pi authentication flow
- [ ] Test gameplay (AI, moves, etc.)
- [ ] Verify the game works without payment features

### Payment Testing (if/when implemented):
- [ ] Test payment creation flow
- [ ] Test payment approval
- [ ] Test payment completion
- [ ] Verify transaction appears in Pi Blockchain Explorer

---

## 🚀 Moving to MainNet (Future)

### Code Changes Required:
- [ ] Change `sandbox: false` in `src/hooks/usePiNetwork.ts`
- [ ] Update CORS configuration in `server/index.js`:
  ```javascript
  app.use(cors({ origin: 'https://your-actual-domain.com' }));
  ```

### Infrastructure:
- [ ] Ensure HTTPS is enabled (required for production)
- [ ] Add rate limiting to prevent API abuse
- [ ] Set up payment logging/database (optional but recommended)
- [ ] Set `NODE_ENV=production` in `.env`

### Security:
- [ ] Restrict CORS to your actual domain
- [ ] Add request validation and sanitization
- [ ] Implement proper error handling without exposing internals
- [ ] Review and test all payment flows thoroughly

---

## 📱 Pi Network Submission Requirements

### What You Need:
- [ ] App URL (your friend's server URL)
- [ ] Screenshots of your game (recommended 3-5 screenshots):
  - Game board/main screen
  - Gameplay in progress
  - Any unique features
  - Game over/results screen
  
- [ ] App Description (prepare in advance):
  - Clear description of what the game does
  - How to play
  - Any unique features

- [ ] App Icon (square, PNG, recommended 512x512px)

### Submit Through:
- Pi Developer Portal: https://developers.minepi.com/
- Your app dashboard

---

## ⚠️ Payment Implementation Notes

**CURRENT STATE:** The payment infrastructure code is in place but NOT actively used in the game.

**FOR PI TEAM REVIEW:**
- The Pi team primarily reviews apps for security, user experience, and proper Pi SDK integration
- Payment code that exists but isn't used should not cause issues
- They mainly care that:
  - Your app properly authenticates users
  - Payment flows (if used) follow their API correctly
  - Your app provides value to users
  - No security vulnerabilities

**IF YOU DON'T USE PAYMENTS YET:**
- You can still submit and get approved
- Many Pi apps start without payments
- You can add monetization later
- Focus on making a great game experience first

---

## 🔍 Testing Checklist

### Local Testing (Before Upload):
- [ ] Game starts without errors
- [ ] AI opponent works correctly
- [ ] All game features work (undo, restart, settings, etc.)
- [ ] Board themes and colors work
- [ ] Sound effects play correctly
- [ ] No console errors

### Production Testing (After Upload):
- [ ] Game loads in Pi Browser on mobile
- [ ] Pi authentication works
- [ ] Username displays correctly
- [ ] Game performance is smooth
- [ ] All features work on mobile

---

## 📞 Troubleshooting

### If Pi Authentication Fails:
1. Verify `PI_APP_ID` is correct
2. Check Pi Developer Portal for app status
3. Ensure app URL matches what's registered
4. Check browser console for error messages

### If Server Doesn't Start:
1. Verify `.env` file exists and has correct values
2. Check `PORT` isn't already in use
3. Verify `npm install` completed successfully
4. Check server logs for specific errors

### If Game Doesn't Load:
1. Check server is running (`npm start`)
2. Verify `VITE_API_BASE_URL` is set correctly
3. Check CORS settings allow your domain
4. Inspect browser console for errors

---

## 📚 Useful Resources

- **Pi Developer Portal:** https://developers.minepi.com/
- **Pi SDK Documentation:** https://github.com/pi-apps/pi-platform-docs
- **Pi Network Blockchain Explorer:** https://blockexplorer.minepi.com/

---

## ✅ Quick Status Check

Current readiness level: **75% Ready for TestNet**

**What's Done:**
- ✅ Code cleaned up (no debugging code)
- ✅ Mock files removed
- ✅ Production-ready code structure
- ✅ Payment infrastructure in place (optional to use)
- ✅ `PI_API_KEY` configured

**What's Needed:**
- ⚠️ Update `PI_APP_ID`
- ⚠️ Set production `VITE_API_BASE_URL`
- ⚠️ Upload to friend's server
- ⚠️ Test in Pi Browser

---

## ❓ Frequently Asked Questions

### Q: Will the Pi Team Review My Unused Payment Code?

**Answer:** No, they won't penalize you for having payment infrastructure that isn't used yet.

**What the Pi Team Actually Reviews:**
- ✅ **User Experience** - Is the app useful, well-designed, and functional?
- ✅ **Security** - Are there vulnerabilities? Proper authentication?
- ✅ **Pi SDK Integration** - Is authentication implemented correctly?
- ✅ **Terms Compliance** - No scams, gambling, or prohibited content
- ✅ **Basic Functionality** - Does the app work as described?

**What They Don't Do:**
- ❌ Deep code audits of unused features
- ❌ Reject apps for having payment code that isn't activated
- ❌ Require monetization to be implemented

**Your Situation:** 
Having payment infrastructure in place but not using it is **completely fine** and very common. Many successful Pi apps start without monetization and add it later. The Pi team understands this is a normal development approach.

**Bottom Line:** Focus on making a great game experience first. Add payments when it makes sense for your users.

---

### Q: What Do I Need to Submit to Pi Network?

**Required for Pi Developer Portal Submission:**

#### 1. App Information
- **App Name:** Checkers4Pi (or your chosen name)
- **App URL:** Your friend's server URL (e.g., `https://checkers.yourserver.com`)
- **Category:** Games
- **Description:** Clear explanation of your checkers game
  ```
  Example:
  "Classic Checkers game with AI opponent. Play against smart AI 
  with adjustable difficulty levels. Features beautiful themes, 
  move history, undo functionality, and game statistics. 
  Authenticate with your Pi account to save your progress."
  ```

#### 2. Visual Assets
- **App Icon** 
  - Square PNG format
  - Recommended size: 512x512px
  - Should be clear and recognizable
  - Represents your game (checker piece, game board, etc.)

- **Screenshots** (3-5 images recommended)
  - Main game board/start screen
  - Gameplay in progress (showing pieces, valid moves)
  - Game over screen with results
  - Settings or special features screen
  - Any unique features you want to highlight
  
  **Tips:**
  - Take screenshots in Pi Browser on mobile
  - Show the app in action, not just static screens
  - Highlight what makes your game fun/unique

#### 3. Technical Details
- **App Type:** Web App / Mini App
- **Permissions Needed:**
  - Username (for displaying player name)
  - Payments (even if not currently used)

#### 4. Optional (But Helpful)
- Short video demo (30-60 seconds)
- Support email or contact method
- Privacy policy (if collecting any data)
- Terms of service

**Where to Submit:**
- Go to: https://developers.minepi.com/
- Navigate to "My Apps" or "Create App"
- Fill out the submission form
- Upload assets
- Submit for TestNet review

#### 📁 Important: Where Screenshots & Description Go

**🚫 NOT in Your Project Files:**
- Screenshots are NOT uploaded to your codebase
- App description is NOT in your repository
- App icon is NOT in your source code
- These materials are NOT part of your GitHub/project files

**✅ Uploaded During Pi Network Registration:**
- Everything uploads directly through the Pi Developer Portal web interface
- You'll see upload buttons and text fields in the portal submission form
- Just drag & drop screenshots when prompted
- Copy/paste your description from GAME_DESCRIPTION.md into the portal text field
- Upload your icon through the portal's file picker

**📝 The GAME_DESCRIPTION.md File is For:**
- Your reference when filling out the Pi Developer Portal forms
- Easy copy/paste of your description into the portal
- Future reference if you need to update your app listing
- Documentation of your app's marketing materials
- NOT part of the actual app submission to your server

**When You Register:**
When you go to https://developers.minepi.com/, you'll see a web form with fields for:
- App name (text input)
- Description (text area - paste from GAME_DESCRIPTION.md)
- Icon upload (drag & drop or file picker)
- Screenshots upload (drag & drop multiple images)
- Category selection (dropdown)
- App URL (text input - your friend's server)

All of these are entered/uploaded through the portal interface - nothing goes in your codebase!

---

### Q: Can I Test on My Cell Phone? Do I Need Pi Browser?

**YES - You MUST use Pi Browser for proper testing!**

#### Testing Environments:

**1. Local Development (Desktop Browser)**
- ✅ Good for: UI development, game logic, styling
- ❌ Limitations: 
  - No real Pi SDK access
  - No Pi authentication
  - Can't test payment flows
  - Not representative of real user experience

**2. Production Server (Pi Browser - Mobile)**
- ✅ This is the REAL test environment
- ✅ Full Pi SDK functionality
- ✅ Real Pi authentication
- ✅ Actual user experience
- ✅ **Required for submission**

**3. Production Server (Regular Mobile Browser)**
- ❌ Won't work properly
- ❌ No Pi SDK access
- ❌ No Pi authentication
- ❌ Don't test this way

#### How to Test on Your Cell Phone:

**Step 1: Install Pi Network App**
```
1. Download "Pi Network" app from App Store or Google Play
2. Log in with your Pi account
3. Complete KYC if needed (for full testing)
```

**Step 2: Access Pi Browser**
```
1. Open Pi Network app
2. Tap the menu (hamburger icon)
3. Find "Pi Browser" or "Develop" section
4. Tap to open Pi Browser
```

**Step 3: Navigate to Your Game**
```
1. In Pi Browser, enter your friend's server URL
   Example: https://checkers.yourserver.com
2. Your game should load
3. Pi authentication will work automatically
4. Test all game features
```

**Step 4: Test Everything**
- [ ] Game loads without errors
- [ ] Pi authentication displays your username
- [ ] All game features work (moves, AI, undo, etc.)
- [ ] Touch controls work smoothly
- [ ] Board is visible and properly sized
- [ ] Sound effects work (if enabled)
- [ ] Settings save properly

#### Important Notes:

**Cannot Test Without Pi Browser:**
- Pi SDK only works in Pi Browser
- Regular browsers won't authenticate
- Desktop testing is limited to UI/UX only

**Must Be on Actual Server:**
- `localhost` won't work from phone
- Must be publicly accessible URL
- Your friend's server must be reachable

**Mobile-Specific Issues to Check:**
- Screen size / responsive design
- Touch targets (buttons big enough?)
- Loading speed on mobile network
- Battery usage
- Portrait vs landscape orientation

---

## 🎯 Your Next Steps (In Order)

### Step 1: Update Environment Variables
**Time Required:** 5 minutes

```bash
# Edit your .env file
PI_APP_ID=your_actual_app_id_from_pi_portal
```

**How to Get PI_APP_ID:**
1. Go to https://developers.minepi.com/
2. Create new app or open existing app
3. Copy the App ID
4. Paste into `.env` file

### Step 2: Prepare Visual Assets
**Time Required:** 30-60 minutes

- [ ] Create app icon (512x512px PNG)
- [ ] Take 3-5 screenshots of your game
- [ ] Write app description (2-3 paragraphs)
- [ ] Prepare any additional images/videos

**Tips:**
- Use your game's logo or checker piece for icon
- Make screenshots clear and attractive
- Show the best features of your game
- Describe what makes it fun/unique

### Step 3: Upload to Friend's Server
**Time Required:** 30 minutes

**What to Upload:**
- All source files (src/, server/, etc.)
- Configuration files (package.json, vite.config.ts, etc.)
- `.env` file (with production values)

**What NOT to Upload:**
- `node_modules/` folder
- `.git/` folder  
- `dist/` folder (will be built on server)
- Any local test files

**Commands for Your Friend's Server:**
```bash
# On the server:
npm install --production
npm run build
npm start

# Or use PM2 for production:
npm install -g pm2
pm2 start server/index.js --name "checkers4pi"
pm2 save
```

### Step 4: Get Production URL
**Time Required:** 5 minutes

1. Ask your friend for the server URL
2. Should look like: `https://yourserver.com` or `https://subdomain.server.com`
3. Create `.env` file with:
   ```
   VITE_API_BASE_URL=https://yourserver.com/api
   ```
4. Rebuild: `npm run build`

### Step 5: Test in Pi Browser
**Time Required:** 30 minutes

1. Open Pi app on your phone
2. Navigate to Pi Browser
3. Go to your game URL
4. Test thoroughly:
   - [ ] Game loads
   - [ ] Authentication works
   - [ ] Can play against AI
   - [ ] All moves work correctly
   - [ ] Undo works
   - [ ] Settings work
   - [ ] Game restart works
   - [ ] No errors in gameplay

### Step 6: Submit to Pi Network
**Time Required:** 30 minutes

1. Go to https://developers.minepi.com/
2. Navigate to your app in developer portal
3. Fill out submission form:
   - App URL
   - Description
   - Upload icon
   - Upload screenshots
   - Select category (Games)
   - Add any additional info
4. Submit for TestNet review
5. Wait for approval (typically 1-7 days)

### Step 7: Monitor and Iterate
**Ongoing**

- Monitor for any user feedback
- Check Pi Developer Portal for messages
- Fix any bugs that appear
- Consider adding new features
- Think about monetization strategy (optional)

---

## 🚦 Current Status: Ready for TestNet

**What You Have:**
- ✅ Clean, production-ready code
- ✅ Pi SDK integration in place
- ✅ Payment infrastructure ready (optional to use)
- ✅ Professional game experience
- ✅ No debugging code
- ✅ Mobile-friendly design

**What You Need:**
- ⚠️ Update `PI_APP_ID` (5 min)
- ⚠️ Upload to friend's server (30 min)
- ⚠️ Test in Pi Browser (30 min)
- ⚠️ Create visual assets (1 hour)
- ⚠️ Submit to Pi Network (30 min)

**Estimated Time to Launch:** 2-3 hours of work + approval wait time

---

**Last Updated:** December 23, 2025

# Checkers4Pi - Deployment Checklist

## 🚨 Critical Issues to Address

### 1. Sandbox Mode Configuration
**Status:** ⚠️ TO DO  
**Location:** `src/hooks/usePiNetwork.ts` (Line 83)  
**Current:** `sandbox: true`  
**Action:**
- Keep `sandbox: true` for TestNet testing
- Change to `sandbox: false` ONLY when moving to MainNet

### 2. Environment Variables - Complete Guide
**Status:** ⚠️ PARTIALLY DONE  

#### Understanding Your .env File

Your `.env` file contains configuration that changes between development and production. Here's what each variable does:

**Current .env Structure:**
```dotenv
PI_API_KEY=c7lzy1y5uoeol9rfmpnao!
PI_APP_ID=your_app_id_here
NODE_ENV=development
PORT=3000
```

#### Environment Variables Explained:

**1. PI_API_KEY** ✅ (You have this)
- **What it is:** Secret key to authenticate your backend server with Pi Network API
- **Used by:** Backend server only (never exposed to browser)
- **Where to get it:** Pi Developer Portal (https://developers.minepi.com/)
- **Security:** Keep secret, never commit to public repos
- **Status:** Already configured ✅

**2. PI_APP_ID** ⚠️ (Needs updating)
- **What it is:** Unique identifier for your app in Pi Network
- **Used by:** Backend server for Pi Network integration
- **Where to get it:** Pi Developer Portal after registering your app
- **Action needed:** Replace "your_app_id_here" with actual App ID from portal
- **When to update:** Before deploying to TestNet

**3. NODE_ENV** ⚠️ (Change for production)
- **What it is:** Tells your app whether it's in development or production mode
- **Current value:** `development`
- **When to change:** 
  - Keep as `development` for local testing
  - Change to `production` when deploying to friend's server
- **What it affects:**
  - Server logging behavior
  - Error message verbosity
  - Static file serving
  - Performance optimizations

**4. PORT** ✅ (You have this)
- **What it is:** The port your server runs on
- **Current value:** `3000`
- **When to change:** Only if port 3000 is already in use on server
- **Status:** Default is fine ✅

**5. VITE_API_BASE_URL** ⚠️ (Should be added)
- **What it is:** Tells your frontend where to send API requests
- **Used by:** Frontend code (the `VITE_` prefix makes it available to browser)
- **Important:** This is NOT a Vite API key - it's just a configuration variable
- **Current default:** `http://localhost:3000/api` (hardcoded in piNetworkCallbacks.ts)
- **For local development:**
  ```
  VITE_API_BASE_URL=http://localhost:3000/api
  ```
- **For production:**
  ```
  VITE_API_BASE_URL=https://your-server-domain.com/api
  ```

#### Complete .env Examples:

**For TestNet to MainNet Migration Guide

### Overview: The Two-Stage Process

Pi Network uses a two-stage approval process:

**Stage 1: TestNet (Sandbox Mode)**
- Your app runs with `sandbox: true`
- Uses Pi Testnet blockchain
- No real Pi currency involved
- For testing and validation
- Review and approval by Pi team
- Can have multiple iterations/fixes

**Stage 2: MainNet (Production)**
- Your app runs with `sandbox: false`
- Uses real Pi blockchain
- Real Pi currency transactions
- Requires separate MainNet approval
- Higher security standards

### 📋 TestNet Deployment Checklist

**Environment Configuration:**
- [ ] `NODE_ENV=production` in `.env`
- [ ] `sandbox: true` in `src/hooks/usePiNetwork.ts` (keep this!)
- [ ] `PI_APP_ID` set to your TestNet App ID
- [ ] `VITE_API_BASE_URL` points to your server
- [ ] HTTPS enabled on your server (recommended but may not be strict requirement)

**What "Production" NODE_ENV Means:**
- Your app is running on a production server (not localhost)
- Optimized build and performance
- Production logging behavior
- Does NOT mean MainNet - you're still on TestNet!

**Why Keep sandbox: true:**
- TestNet apps MUST use sandbox mode
- Allows Pi team to test without real currency
- Transactions use test Pi, not real Pi
- Can be reset/tested multiple times

### 🔄 Moving from TestNet to MainNet

After TestNet approval, you'll need to make these changes:

#### 1. Code Changes
**File:** `src/hooks/usePiNetwork.ts` (Line 83)
```typescript
// Change from:
sandbox: true,

// To:
sandbox: false,
```

**File:** `server/index.js` (Line 14)
```javascript
// Change from:
app.use(cors());

// To:
app.use(cors({ 
  origin: 'https://your-actual-domain.com',
  credentials: true 
}));
```

#### 2. Environment Variables
**Update your `.env` file:**
```dotenv
PI_API_KEY=your_mainnet_api_key
PI_APP_ID=your_mainnet_app_id
NODE_ENV=production
PORT=3000
VITE_API_BASE_URL=https://your-server-domain.com/api
```

**Important Notes:**
- You may get a NEW App ID for MainNet (check Pi Portal)
- API keys might be different for MainNet
- Verify all credentials in Pi Developer Portal

#### 3. Infrastructure Requirements
- [ ] **HTTPS is REQUIRED** for MainNet (not optional)
- [ ] Valid SSL certificate (Let's Encrypt is fine)
- [ ] Stable server with good uptime
- [ ] Database for payment logging (highly recommended)
- [ ] Rate limiting to prevent abuse
- [ ] Proper error handling and monitoring

#### 4. Security Hardening
- [ ] Restrict CORS to your domain only
- [ ] Add request validation and sanitization
- [ ] Implement proper authentication checks
- [ ] Set up payment logging/audit trail
- [ ] Add server monitoring and alerts
- [ ] Review all payment flows thoroughly
- [ ] Test extensively before MainNet launch

#### 5. Rebuild and Deploy
```bash
# After making all changes:
npm run build
# Upload new build to server
# Restart server
pm2 restart checkers4pi
```

### ⚠️ Critical Differences: TestNet vs MainNet

| Feature | TestNet (Sandbox) | MainNet (Production) |
|---------|-------------------|---------------------|
| sandbox setting | `true` | `false` |
| NODE_ENV | `production` | `production` |
| HTTPS Required | Recommended | **REQUIRED** |
| Blockchain | Pi Testnet | Pi Mainnet |
| Currency | Test Pi (fake) | Real Pi |
| Reversible | Yes | No |
| App ID | TestNet ID | MainNet ID (may differ) |
| Security Level | Standard | **Very High** |
| Payment Logging | Optional | **Highly Recommended** |
| Error Tolerance | More lenient | Very strict |
- [ ] Update PI_APP_ID in .env file
- [ ] Add VITE_API_BASE_URL to .env file
- [ ] Change NODE_ENV to "production" when deploying to server
- [ ] Rebuild app after changing environment variables: `npm run build`

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

## 📱 Pi Network Submission & Review Process

### Step-by-Step Submission Guide

#### 1. Pre-Submission Preparation
- [ ] App is deployed and accessible at a public URL
- [ ] Pi authentication works in Pi Browser
- [ ] All game features tested and working
- [ ] Screenshots taken (3-5 high-quality images)
- [ ] App icon created (512x512px PNG)
- [ ] Description written (use GAME_DESCRIPTION.md)
- [ ] Environment variables configured correctly
- [ ] `PI_APP_ID` obtained and set

#### 2. Submit Through Pi Developer Portal

**Portal URL:** https://developers.minepi.com/

**What You'll Do:**
1. Log in with your Pi account
2. Navigate to "My Apps" or "Create App" 
3. Click "Submit App" or "New App"
4. Fill out the submission form:
   - **App Name:** Checkers4Pi (or your chosen name)
   - **App URL:** `https://your-server-domain.com`
   - **Category:** Games > Board Games
   - **Description:** Paste from GAME_DESCRIPTION.md
   - **Icon:** Upload 512x512px PNG
   - **Screenshots:** Upload 3-5 images
   - **Permissions:** Username, Payments (even if not used yet)
   - **Support Email:** Your contact email
   - **Privacy Policy URL:** (optional but recommended)

5. Review all information carefully
6. Click "Submit for Review"
7. You'll receive a submission confirmation

#### 3. What Happens Next: The Review Process

**Timeline:**
- **Initial Review:** Typically 1-7 days
- **Can vary:** Depending on submission volume and complexity
- **Holidays/Weekends:** May extend the timeline
- **Resubmissions:** Usually faster (1-3 days)

**What Pi Team Reviews:**

✅ **Functionality Check:**
- App loads correctly in Pi Browser
- No crashes or critical errors
- Core features work as described
- Good user experience

✅ **Pi SDK Integration:**
- Authentication works properly
- SDK implemented correctly
- No errors in Pi integration
- Proper error handling

✅ **Security Review:**
- No obvious security vulnerabilities
- Proper data handling
- No malicious code
- Safe for users

✅ **Policy Compliance:**
- Follows Pi Network Terms of Service
- No prohibited content
- No misleading descriptions
- Age-appropriate content

✅ **Quality Standards:**
- Professional appearance
- Works well on mobile
- Good performance
- Clear purpose and value

**What They DON'T Review (Usually):**
- ❌ Deep code audits of every file
- ❌ Unused features or infrastructure code
- ❌ Your specific coding style
- ❌ Backend architecture details

### 📬 How You'll Be Notified

#### Notification Methods:

**1. Email Notification**
- Sent to the email associated with your Pi account
- Contains approval status
- Lists any issues found (if rejected)
- Includes next steps

**2. Pi Developer Portal**
- Check "My Apps" dashboard
- Status updates appear there
- Messages from review team
- Detailed feedback (if applicable)

**3. In-App Notification (Pi App)**
- May receive notification in Pi Network app
- Check your Pi notifications

#### Possible Outcomes:

**✅ APPROVED**
```
Subject: Your Pi App "Checkers4Pi" has been approved for TestNet

Congratulations! Your app has been approved for Pi Network TestNet.

Your app is now live and accessible to Pi users through the Pi Browser.

App Status: Active on TestNet
Next Steps:
- Monitor your app for any issues
- Gather user feedback
- When ready, you can apply for MainNet approval

[View in Developer Portal]
```

**What to do after approval:**
- [ ] Test the app in Pi Browser to confirm it's live
- [ ] Monitor for any user-reported issues
- [ ] Check analytics in Developer Portal
- [ ] Consider gathering user feedback
- [ ] Plan for MainNet migration (if desired)

**⚠️ CHANGES REQUESTED**
```
Subject: Your Pi App "Checkers4Pi" requires changes

Your app submission requires some changes before approval.

Issues Found:
1. [Specific issue description]
2. [Another issue if applicable]

Required Actions:
- [What you need to fix]
- [Any other requirements]

Please make the necessary changes and resubmit.

[View Details in Portal]
```

**What to do after changes requested:**
- [ ] Carefully read all feedback
- [ ] Address each issue mentioned
- [ ] Test fixes thoroughly
- [ ] Update your server with fixes
- [ ] Reply in Developer Portal if clarification needed
- [ ] Resubmit through portal
- [ ] Wait for re-review (usually faster, 1-3 days)

**❌ REJECTED**
```
Subject: Your Pi App "Checkers4Pi" submission has been rejected

Unfortunately, your app does not meet Pi Network requirements at this time.

Reasons for Rejection:
- [Specific violation or issue]
- [Policy violation if applicable]

You may revise and resubmit if you can address these concerns.

[View Details in Portal]
```

**What to do after rejection:**
- [ ] Review rejection reasons carefully
- [ ] Check if issues are fixable
- [ ] Revise app to address all concerns
- [ ] Consider reaching out to Pi support if unclear
- [ ] Resubmit when issues are resolved

### 🔍 Common Reasons for Rejection/Changes

**Technical Issues:**
- App doesn't load properly in Pi Browser
- Authentication fails or has errors
- Critical bugs or crashes
- Poor mobile experience
- Extremely slow loading times

**Policy Violations:**
- Misleading app description
- Copyright/trademark issues
- Age-inappropriate content
- Spam or low-quality content
- Attempts to game the system

**SDK Integration Issues:**
- Pi SDK not implemented correctly
- Authentication flow broken
- Error handling missing
- Payment flows incorrect (if used)

**Quality Issues:**
- Extremely poor user interface
- No clear value proposition
- Broken core features
- Unprofessional appearance

### 📞 Getting Help During Review

**If you have questions or concerns:**

1. **Pi Developer Portal Support**
   - Check documentation: https://developers.minepi.com/docs
   - Look for "Support" or "Help" section
   - May be able to message review team

2. **Pi Developer Community**
   - Pi Developer forums or Discord
   - Other developers may have experienced similar issues
   - Share experiences and solutions

3. **Response Time**
   - Support responses can take several days
   - Be patient and professional
   - Provide clear, detailed questions

### ✅ After TestNet Approval - Next Steps

**Immediate Actions:**
1. **Test Your Live App**
   - Open Pi Browser on your phone
   - Navigate to your app
   - Verify everything works
   - Check that it shows up in Pi app directory (if applicable)

2. **Monitor Performance**
   - Check server logs for errors
   - Monitor server resource usage
   - Watch for any user-reported issues
   - Review analytics in Developer Portal

3. **Gather Feedback**
   - Share with friends/family
   - Ask users to test
   - Note any issues or suggestions
   - Consider improvements

**Planning for MainNet:**
4. **When You're Ready for MainNet:**
   - Ensure app is stable (few/no bugs)
   - Have good user feedback
   - Plan security improvements
   - Set up payment logging (if using payments)
   - Prepare for higher standards

5. **MainNet Submission:**
   - Update code (`sandbox: false`)
   - Update environment variables
   - Ensure HTTPS is configured
   - Enhance security measures
   - Submit MainNet application through portal
   - Wait for MainNet review (similar process)

**Timeline Expectations:**
- TestNet approval → Stay on TestNet as long as needed
- No rush to move to MainNet
- Many apps stay on TestNet for months while perfecting features
- Move to MainNet only when you're confident and ready

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

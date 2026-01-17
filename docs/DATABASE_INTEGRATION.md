# Database Integration Guide for Pi Network Apps

## Overview

**Pi Network fully supports external database connections.** There are no restrictions on using databases with your Pi app. Most production Pi apps use databases for user data, payment tracking, and feature persistence.

---

## ✅ What's Allowed

### Database Technologies
You can use any standard database:
- **SQL:** PostgreSQL, MySQL, MariaDB, SQLite
- **NoSQL:** MongoDB, CouchDB, DynamoDB
- **Cloud Services:** Firebase, Supabase, AWS RDS, Google Cloud SQL
- **Caching/Session:** Redis, Memcached
- **Graph Databases:** Neo4j, ArangoDB
- **Time Series:** InfluxDB, TimescaleDB

### Hosting Options
- Self-hosted on your server
- Cloud-hosted (AWS, Google Cloud, Azure)
- Database-as-a-Service providers
- Free tier services
- Any combination of the above

### Pi Network Only Cares About:
✅ Your frontend properly integrates with Pi SDK  
✅ Your backend correctly handles Pi API calls  
✅ Your app is secure and provides value to users  
✅ User data is handled responsibly  

### Pi Network Does NOT Restrict:
- What database technology you use
- Where your database is hosted
- How you structure your data
- What external services you connect to
- Number of database connections

---

## 🏗️ Typical Pi App Architecture

```
┌─────────────────┐
│   Pi Browser    │ (User's Mobile Device)
│   (User/Client) │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  Your Frontend  │ (React, Vue, etc.)
│  (Static Files) │ - Hosted on your server
└────────┬────────┘ - Integrates Pi SDK
         │
         ↓
┌─────────────────┐
│ Your Backend    │ (Node.js, Python, etc.)
│   API Server    │ - Express, FastAPI, etc.
└────────┬────────┘ - Handles Pi API calls
         │          - Business logic
         ↓
┌─────────────────┐
│  Your Database  │ (PostgreSQL, MongoDB, etc.)
│                 │ - Stores user data
└─────────────────┘ - Transaction records
                    - App state
```

**Pi Network Connection:**
- Your backend calls Pi API: `https://api.minepi.com/v2`
- Pi SDK in frontend handles authentication
- Your database is completely separate and private

---

## 🎯 Why Use a Database

### For Games (like Checkers4Pi):

**1. User Progress & Statistics**
```javascript
{
  piUserId: "user123",
  username: "pioneer_gamer",
  stats: {
    totalGames: 150,
    wins: 95,
    losses: 55,
    winStreak: 7,
    highestStreak: 12,
    favoriteOpponent: "hard"
  },
  achievements: ["first_win", "100_games", "king_master"]
}
```

**2. Cross-Device Sync**
- User plays on phone A
- Stats automatically available on phone B
- No data loss when clearing browser

**3. Leaderboards**
```sql
SELECT username, wins, losses, (wins * 1.0 / (wins + losses)) as win_rate
FROM users
ORDER BY wins DESC
LIMIT 100;
```

**4. Game History**
```javascript
{
  gameId: "game_001",
  piUserId: "user123",
  opponent: "AI_hard",
  result: "win",
  moves: 45,
  duration: 1200, // seconds
  timestamp: "2025-12-23T10:30:00Z"
}
```

### For Payment-Enabled Apps:

**5. Transaction Tracking (Critical!)**
```javascript
{
  paymentId: "pi_payment_123",
  piUserId: "user123",
  amount: 1.5,
  memo: "Premium upgrade",
  status: "completed",
  txid: "0x123abc...",
  verified: true,
  createdAt: "2025-12-23T10:30:00Z",
  completedAt: "2025-12-23T10:31:30Z"
}
```

**Why This Matters:**
- Audit trail for compliance
- Fraud prevention
- Dispute resolution
- Tax records
- Refund processing

**6. User Entitlements**
```javascript
{
  piUserId: "user123",
  purchases: {
    premiumThemes: true,
    adFree: true,
    purchasedOn: "2025-12-23T10:30:00Z"
  }
}
```

### General App Features:

**7. User Preferences**
- Theme selections
- Language preferences
- Notification settings
- Personalization

**8. Social Features**
- Friend lists
- Chat history
- User profiles
- Multiplayer matchmaking

**9. Content Management**
- Dynamic content
- User-generated content
- Comments/reviews
- Media uploads

---

## 📅 When to Add a Database

### Priority Levels:

#### ⚠️ HIGH PRIORITY - Add Before Production
- **Payment transaction logging** (if using payments)
- **Fraud detection data**
- **Compliance/audit trails**
- **Critical user data that can't be lost**

#### 🟡 MEDIUM PRIORITY - Add After TestNet Approval
- **Cross-device sync**
- **User statistics/progress**
- **Leaderboards**
- **Social features**

#### 🟢 LOW PRIORITY - Can Be Added Anytime
- **Analytics tracking**
- **A/B testing data**
- **Non-critical preferences**
- **Optional features**

### Development Stages:

**Stage 1: Initial Development (localhost)**
- Can use browser localStorage
- Quick prototyping
- No database needed yet

**Stage 2: TestNet Submission**
- Database optional for basic apps
- Recommended if using payments
- Consider user experience

**Stage 3: After TestNet Approval**
- Good time to add database
- Iterate based on user feedback
- Prepare for scaling

**Stage 4: MainNet Preparation**
- Database highly recommended
- Essential if handling payments
- Required for serious apps

---

## 🛠️ Database Options & Recommendations

### Option 1: MongoDB Atlas (Recommended for Beginners)

**Pros:**
- ✅ Free tier (512MB)
- ✅ No server management
- ✅ Very easy to set up
- ✅ Great for rapid development
- ✅ Flexible schema

**Free Tier:** Perfect for small-medium apps
**Pricing:** Free up to 512MB, then ~$0.10/GB/month

**Setup:**
```javascript
// Install
npm install mongoose

// server/config/database.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// server/models/User.js
const userSchema = new mongoose.Schema({
  piUserId: { type: String, required: true, unique: true },
  username: String,
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

**Environment Variable:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-db-name
```

---

### Option 2: PostgreSQL (Recommended for Production)

**Pros:**
- ✅ Structured data with ACID compliance
- ✅ Strong data integrity
- ✅ Great for complex queries
- ✅ Industry standard

**Free Hosting Options:**
- **Supabase:** 500MB free, includes auth & storage
- **Neon.tech:** 10GB free
- **Railway.app:** Free tier available
- **ElephantSQL:** 20MB free (limited)

**Setup:**
```javascript
// Install
npm install pg

// server/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // For cloud providers
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
```

**Schema Example:**
```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  pi_user_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table (if needed)
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  pi_user_id VARCHAR(255) NOT NULL,
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  memo TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  txid VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  FOREIGN KEY (pi_user_id) REFERENCES users(pi_user_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_pi_user_id ON users(pi_user_id);
CREATE INDEX idx_payments_pi_user_id ON payments(pi_user_id);
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
```

**Environment Variable:**
```env
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

---

### Option 3: Supabase (Best All-in-One Solution)

**Pros:**
- ✅ PostgreSQL database
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ File storage
- ✅ Auto-generated REST API
- ✅ Great free tier

**Free Tier:** 500MB database, 1GB file storage, 50MB file uploads

**Setup:**
```javascript
// Install
npm install @supabase/supabase-js

// client/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
```

**Usage:**
```javascript
// Save user stats
const { data, error } = await supabase
  .from('users')
  .upsert({
    pi_user_id: userId,
    username: username,
    wins: wins
  });

// Get leaderboard
const { data: leaders } = await supabase
  .from('users')
  .select('username, wins, losses')
  .order('wins', { ascending: false })
  .limit(100);
```

**Environment Variables:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### Option 4: Redis (For Caching/Sessions)

**Use Cases:**
- Session management
- Caching frequent queries
- Real-time leaderboards
- Rate limiting
- Temporary data storage

**Setup:**
```javascript
// Install
npm install redis

// server/config/redis.js
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.connect();

module.exports = client;
```

**Usage:**
```javascript
// Cache user stats
await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(userData));

// Get cached data
const cached = await redisClient.get(`user:${userId}`);
if (cached) return JSON.parse(cached);
```

**Free Options:**
- **Upstash:** Generous free tier
- **Redis Cloud:** 30MB free

---

## 🔐 Security Best Practices

### 1. Environment Variables
**Never hardcode credentials!**

```javascript
// ❌ WRONG - Never do this!
const db = connect('mongodb://admin:password123@server.com');

// ✅ CORRECT - Use environment variables
const db = connect(process.env.MONGODB_URI);
```

**Your .env file:**
```env
# Add to .gitignore!
DATABASE_URL=postgresql://user:pass@host:5432/db
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
REDIS_URL=redis://user:pass@host:6379
```

### 2. Input Validation
**Always validate and sanitize inputs**

```javascript
// ❌ DANGEROUS - SQL Injection risk
const query = `SELECT * FROM users WHERE username = '${username}'`;

// ✅ SAFE - Use parameterized queries
const query = 'SELECT * FROM users WHERE username = $1';
const result = await db.query(query, [username]);

// ✅ SAFE - Mongoose handles this
const user = await User.findOne({ username: username });
```

### 3. Authentication
**Verify Pi user before database operations**

```javascript
// Verify Pi authentication
router.post('/save-stats', async (req, res) => {
  const { piUserId, accessToken } = req.body;
  
  // Verify with Pi API
  const verified = await verifyPiUser(piUserId, accessToken);
  if (!verified) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Now safe to update database
  await User.updateOne({ piUserId }, { $set: req.body.stats });
});
```

### 4. Connection Security
**Always use SSL/TLS for database connections**

```javascript
// For PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// For MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  ssl: true,
  sslValidate: true
});
```

### 5. Rate Limiting
**Prevent abuse of database operations**

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);
```

### 6. Data Privacy
**Only store what you need**

```javascript
// ❌ Don't store sensitive Pi data unnecessarily
{
  piUserId: "123",
  accessToken: "token", // Don't store this!
  piApiKey: "key"       // Definitely don't store this!
}

// ✅ Store only what's needed
{
  piUserId: "123",
  username: "pioneer",
  lastLogin: "2025-12-23"
}
```

---

## 📝 Implementation Examples

### Example 1: Save Game Statistics

```javascript
// server/routes/stats.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Save game result
router.post('/save-game', async (req, res) => {
  try {
    const { piUserId, won, duration, moves } = req.body;
    
    // Update or create user stats
    const user = await User.findOneAndUpdate(
      { piUserId },
      { 
        $inc: { 
          gamesPlayed: 1,
          wins: won ? 1 : 0,
          losses: won ? 0 : 1
        },
        $push: {
          gameHistory: {
            result: won ? 'win' : 'loss',
            duration,
            moves,
            timestamp: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, stats: user.stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// Get user stats
router.get('/stats/:piUserId', async (req, res) => {
  try {
    const user = await User.findOne({ piUserId: req.params.piUserId });
    
    if (!user) {
      return res.json({ gamesPlayed: 0, wins: 0, losses: 0 });
    }
    
    res.json(user.stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaders = await User.find()
      .sort({ wins: -1 })
      .limit(100)
      .select('username wins losses gamesPlayed');
    
    res.json(leaders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
```

### Example 2: Payment Transaction Logging

```javascript
// server/routes/payments.js
const Payment = require('../models/Payment');

// Log payment approval
router.post('/approve', async (req, res) => {
  const { paymentId } = req.body;
  
  try {
    // Call Pi API to approve payment
    const response = await axios.post(
      `${config.PI_API_BASE_URL}/payments/${paymentId}/approve`,
      {},
      { headers: { 'Authorization': `Key ${config.PI_API_KEY}` }}
    );
    
    // Log to database
    await Payment.create({
      paymentId,
      piUserId: response.data.user_uid,
      amount: response.data.amount,
      memo: response.data.memo,
      status: 'approved',
      approvedAt: new Date()
    });
    
    res.json({ success: true, payment: response.data });
  } catch (error) {
    // Log error too
    await Payment.findOneAndUpdate(
      { paymentId },
      { 
        status: 'error',
        errorMessage: error.message,
        errorAt: new Date()
      },
      { upsert: true }
    );
    
    res.status(500).json({ error: 'Payment approval failed' });
  }
});

// Complete payment and verify
router.post('/complete', async (req, res) => {
  const { paymentId, txid } = req.body;
  
  try {
    // Call Pi API to complete payment
    const response = await axios.post(
      `${config.PI_API_BASE_URL}/payments/${paymentId}/complete`,
      { txid },
      { headers: { 'Authorization': `Key ${config.PI_API_KEY}` }}
    );
    
    // Update database record
    await Payment.findOneAndUpdate(
      { paymentId },
      {
        status: 'completed',
        txid,
        verified: response.data.transaction.verified,
        completedAt: new Date()
      }
    );
    
    res.json({ 
      success: true, 
      verified: response.data.transaction.verified 
    });
  } catch (error) {
    await Payment.findOneAndUpdate(
      { paymentId },
      { 
        status: 'failed',
        errorMessage: error.message,
        failedAt: new Date()
      }
    );
    
    res.status(500).json({ error: 'Payment completion failed' });
  }
});

// Get user's payment history
router.get('/history/:piUserId', async (req, res) => {
  try {
    const payments = await Payment.find({ 
      piUserId: req.params.piUserId,
      status: 'completed'
    })
    .sort({ completedAt: -1 })
    .limit(50);
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});
```

### Example 3: User Preferences Sync

```javascript
// server/routes/preferences.js

// Save preferences
router.post('/preferences', async (req, res) => {
  try {
    const { piUserId, preferences } = req.body;
    
    const user = await User.findOneAndUpdate(
      { piUserId },
      { 
        $set: { 
          'preferences.theme': preferences.theme,
          'preferences.difficulty': preferences.difficulty,
          'preferences.soundEnabled': preferences.soundEnabled,
          'preferences.playerColor': preferences.playerColor,
          'preferences.updatedAt': new Date()
        }
      },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// Load preferences
router.get('/preferences/:piUserId', async (req, res) => {
  try {
    const user = await User.findOne({ 
      piUserId: req.params.piUserId 
    });
    
    if (!user || !user.preferences) {
      // Return defaults
      return res.json({
        theme: 'classic',
        difficulty: 'medium',
        soundEnabled: true,
        playerColor: 'red'
      });
    }
    
    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load preferences' });
  }
});
```

---

## 🚀 Performance Optimization

### 1. Use Indexes
```javascript
// MongoDB
userSchema.index({ piUserId: 1 });
userSchema.index({ wins: -1 }); // For leaderboards

// PostgreSQL
CREATE INDEX idx_users_pi_user_id ON users(pi_user_id);
CREATE INDEX idx_users_wins ON users(wins DESC);
```

### 2. Connection Pooling
```javascript
// PostgreSQL
const pool = new Pool({
  max: 20, // maximum number of clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// MongoDB (mongoose does this automatically)
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 5
});
```

### 3. Caching with Redis
```javascript
// Check cache first
const cached = await redis.get(`user:${userId}:stats`);
if (cached) {
  return res.json(JSON.parse(cached));
}

// If not cached, get from database
const user = await User.findOne({ piUserId: userId });

// Cache for 5 minutes
await redis.setEx(
  `user:${userId}:stats`, 
  300, 
  JSON.stringify(user.stats)
);

res.json(user.stats);
```

### 4. Limit Query Results
```javascript
// ❌ Don't fetch everything
const allUsers = await User.find();

// ✅ Limit and paginate
const users = await User.find()
  .limit(100)
  .skip(page * 100)
  .select('username wins losses'); // Only needed fields
```

### 5. Batch Operations
```javascript
// ❌ Multiple individual updates
for (const user of users) {
  await User.updateOne({ piUserId: user.id }, { active: true });
}

// ✅ Bulk update
await User.updateMany(
  { piUserId: { $in: userIds } },
  { $set: { active: true } }
);
```

---

## 📊 Monitoring & Maintenance

### Database Health Checks
```javascript
// server/routes/health.js
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});
```

### Backup Strategy
**Important:** Always have backups!

**MongoDB Atlas:**
- Automatic daily backups
- Point-in-time recovery
- Manual snapshots available

**PostgreSQL:**
```bash
# Automated backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20251223.sql
```

**Supabase:**
- Daily backups on paid plans
- Export data via dashboard
- Use `pg_dump` for manual backups

### Monitoring Tools
- **MongoDB Atlas:** Built-in monitoring dashboard
- **Supabase:** Real-time metrics and logs
- **PostgreSQL:** pg_stat_statements extension
- **External:** New Relic, Datadog, CloudWatch

---

## 🎓 Summary & Recommendations

### For Your Checkers4Pi App:

**Current State (No Database):**
- ✅ Fine for initial TestNet submission
- ✅ Quick development and testing
- ❌ Stats reset when browser cleared
- ❌ No cross-device sync
- ❌ Can't implement leaderboards

**With Database Added:**
- ✅ Persistent user statistics
- ✅ Cross-device sync
- ✅ Leaderboards possible
- ✅ Better user experience
- ✅ Ready for future features

### Recommended Path:

**Phase 1: TestNet Launch (Now)**
- Submit without database
- Use localStorage for stats
- Focus on core gameplay
- Get approved and gather feedback

**Phase 2: Post-TestNet (After Approval)**
- Add MongoDB or Supabase
- Implement user stats sync
- Add leaderboard feature
- Improve user retention

**Phase 3: MainNet Preparation**
- If adding payments: Add payment logging
- Implement security hardening
- Set up monitoring
- Create backup strategy

### Quick Start Recommendation:

**For simplicity: Supabase**
- Free tier is generous
- PostgreSQL + auth + storage
- Quick to set up
- Great documentation
- No server management

**For learning: MongoDB Atlas**
- Very beginner-friendly
- Flexible schema
- Great free tier
- Large community

**For production: PostgreSQL (Neon/Supabase)**
- Industry standard
- Strong data integrity
- Better for complex queries
- Excellent for payments

---

## 📚 Additional Resources

**Official Documentation:**
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- PostgreSQL: https://www.postgresql.org/docs/
- Supabase: https://supabase.com/docs
- Redis: https://redis.io/docs/

**Free Hosting Providers:**
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Supabase: https://supabase.com/
- Neon (PostgreSQL): https://neon.tech/
- Railway: https://railway.app/
- Upstash (Redis): https://upstash.com/

**Security Best Practices:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- MongoDB Security: https://www.mongodb.com/docs/manual/security/
- PostgreSQL Security: https://www.postgresql.org/docs/current/security.html

---

**Last Updated:** December 23, 2025  
**Applicable to:** All Pi Network Apps (Games, Utilities, Social, etc.)

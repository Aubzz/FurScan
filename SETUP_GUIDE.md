# Quick Start Guide - Chat System Setup

## 🔧 Prerequisites

- Node.js 16+ installed
- PostgreSQL 12+ running
- Expo CLI installed
- Backend already initialized (`Furemedy-Backend-main`)

---

## ⚡ Step-by-Step Setup

### Phase 1: Backend Database Setup (5 minutes)

```bash
# 1. Connect to PostgreSQL
psql -U postgres

# 2. Create/switch to your database
\c furemedy_db  -- or your database name

# 3. Run the migration
\i /path/to/migrations/001_create_chat_tables.sql

# 4. Verify tables were created
\dt chat_sessions
\dt chat_messages
\dt token_usage_stats
```

✅ You should see 3 new tables in your database.

---

### Phase 2: Backend API Setup (5 minutes)

```bash
# 1. Navigate to backend
cd ../Furemedy-Backend-main

# 2. Verify chat routes are imported in src/server.js
# Look for:
#   const chatRoutes = require('./routes/chat');
#   app.use('/api/chat', chatRoutes);

# 3. Start the backend
npm run dev

# Expected output:
# PostgreSQL connection successful!
# Server is running on port 8080
```

✅ Server running at http://localhost:8080

---

### Phase 3: Frontend Setup (5 minutes)

```bash
# 1. Navigate to DermaPaw frontend
cd ../DermaPaw

# 2. Update backend IP if using mobile/external device
# Edit: app/services/chatApi.ts
# Change the IP address in API_URL to your server IP

# 3. Start the Expo server
npx expo start

# You'll see options:
# Press i for iOS simulator
# Press a for Android emulator
# Press w for web
```

✅ Chat is now live!

---

## 🧪 Testing the Integration

### Test 1: Create a Chat Session

1. Open the app and navigate to Chat
2. Tap "New Chat" button in the sidebar
3. Check console for: `✅ Chat session created for user 5: 3`

**Expected Result**: New chat session appears in sidebar with "New Chat" title.

### Test 2: Send a Message

1. Type "What is ringworm?" in the chat input
2. Tap the send button
3. Watch token counter update

**Expected Result**: 
- User message appears in chat
- Token counter shows approximately 5 tokens used
- Bot responds with information from Gemini API
- Response tokens are added to counter

### Test 3: Verify Database Persistence

1. Check database with:
   ```sql
   SELECT * FROM chat_sessions WHERE user_id = 5;
   SELECT * FROM chat_messages WHERE session_id = 3;
   ```

**Expected Result**: Messages appear in database exactly as shown in UI

### Test 4: Responsive Sidebar

**Mobile View** (< 768px width):
- Menu button (⋯) appears in header
- Tap to open full-screen sidebar modal
- Select session to close modal and load chat

**Desktop View** (≥ 768px width):
- Persistent sidebar always visible on left
- Click session to load it immediately
- Sidebar takes ~250px of width

---

## 🔐 Authentication Flow

The system automatically handles authentication:

1. **App Start**: Check for stored JWT token
2. **If Token Exists**: Load user profile from `/api/profile/me`
3. **Load Sessions**: Automatically fetch user's chat sessions
4. **API Calls**: Include token in all headers: `Authorization: Bearer {token}`

⚠️ **Important**: Token is required for all chat operations. User must be logged in.

---

## 📊 Testing Token Limiting

To verify token limit enforcement:

1. **Reduce the max limit temporarily** (for testing):
   ```typescript
   // In chatbot.tsx sendChatMessage function
   max_token_limit: 50  // Was 1000, now just 50 for testing
   ```

2. **Send several messages** until you hit the limit

3. **Expected behavior**:
   - Token counter turns RED
   - Input button becomes disabled
   - Error message: "Token limit reached. Please start a new chat."
   - "Start New Chat" button appears

4. **Tap "Start New Chat"**:
   - New session created
   - Messages cleared
   - Token counter resets to 0
   - Input enabled again

---

## 🐛 Troubleshooting

### Sidebar Not Showing Chat History

**Problem**: "No chats yet" message appears

**Checklist**:
- [ ] Is user logged in? Check `AuthContext`
- [ ] Is backend running? Check console for API errors
- [ ] Does database have chat_sessions table? Run: `\dt chat_sessions`

**Fix**: Create a new chat - it will appear immediately

### Messages Not Saving

**Problem**: Messages appear in UI but don't persist on reload

**Checklist**:
- [ ] Is backend API running?
- [ ] Check Network tab in browser DevTools
- [ ] Are POST requests to `/api/chat/messages` succeeding (200)?
- [ ] Check database: `SELECT * FROM chat_messages;`

**Fix**: Verify backend is running and database is accessible

### Token Counter Shows Wrong Values

**Problem**: Token counter doesn't match actual message length

**Why**: Token estimation uses 1 token ≈ 4 characters rule

**Example**:
- "Hello" = 5 chars ÷ 4 = 1.25 → rounds up to 2 tokens
- This is intentionally conservative to avoid exceeding limits

**To verify**: Add actual token counting with Gemini API (see enhancements)

### Responsive Layout Issues

**Problem**: Sidebar shows on mobile instead of modal

**Check**: `Dimensions.get('window').width`

**Fix**: Restart the app or change device orientation

---

## 📝 Environment Variables

Ensure your `.env` file in Furemedy-Backend has:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=furemedy_db

# JWT (existing)
JWT_SECRET=your_secret_key

# Port
PORT=8080
```

---

## 🔄 Developer Workflow

### Adding New Chat Features

```typescript
// 1. Add API endpoint in backend (src/routes/chat.js)
router.post('/messages/custom', verifyToken, async (req, res) => {
  // Your logic here
  res.json({ success: true, data: result });
});

// 2. Add service method in frontend (app/services/chatApi.ts)
export const customChatAction = async (token: string, ...args) => {
  const response = await axios.post('/messages/custom', {...});
  return response.data.data;
};

// 3. Use in component (app/(tabs)/chatbot.tsx)
const result = await customChatAction(token, ...);
setState(result);
```

---

## 📈 Monitoring & Analytics

### Check Session Activity

```sql
-- Most active session
SELECT session_id, COUNT(*) as message_count 
FROM chat_messages 
GROUP BY session_id 
ORDER BY message_count DESC LIMIT 1;

-- Total tokens consumed by user
SELECT SUM(total_tokens_used) as total_tokens 
FROM chat_sessions 
WHERE user_id = 5;

-- Average tokens per session
SELECT AVG(total_tokens_used) as avg_tokens 
FROM chat_sessions;
```

---

## ✅ Final Checklist

- [ ] Backend running on port 8080
- [ ] Database tables created
- [ ] Frontend connected to correct backend IP
- [ ] User can create new chat session
- [ ] Messages save and display correctly
- [ ] Token counter updates
- [ ] Can switch between sessions on desktop (persistent sidebar)
- [ ] Can open/close sidebar on mobile (modal)
- [ ] Responsive design works (test at different screen widths)
- [ ] No console errors

---

## 📞 Need Help?

1. **Check logs**: Look at browser console (F12) and terminal
2. **Verify setup**: Run through Phase 1-3 again
3. **Test API**: Use cURL or Postman:
   ```bash
   curl -H "Authorization: Bearer {token}" http://localhost:8080/api/chat/sessions
   ```
4. **Review code**: Check `CHAT_SYSTEM_DOCUMENTATION.md` for architecture details

---

**Happy chatting! 🎉**

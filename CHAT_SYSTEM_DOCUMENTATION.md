# DermaPaw Chat System Refactoring Documentation

## 🎯 Overview

This document explains the comprehensive refactoring of the DermaPaw chat system. The system now includes:

1. **Persistent ChatGPT-style Sidebar** with chat history management
2. **Database-backed Conversations** using PostgreSQL
3. **Token Tracking & Limits** to manage Google Gemini API usage
4. **Modular React Architecture** with clean separation of concerns
5. **Responsive Design** that works on mobile, tablet, and desktop

---

## 📚 Architecture

### Frontend Structure

```
components/
├── ChatMessage.tsx      # Individual message bubble component
├── ChatInput.tsx        # Input field with token awareness
├── TokenCounter.tsx     # Token usage progress bar
└── ChatSidebar.tsx      # Persistent/modal chat history sidebar

app/
├── (tabs)/
│   └── chatbot.tsx      # Main chat screen with orchestration
└── services/
    ├── chatApi.ts       # REST API service for backend communication
    ├── tokenCounter.ts  # Token estimation and tracking utilities
    └── botpressApi.ts   # Gemini API integration (existing)
```

### Backend Structure

```
src/
├── routes/
│   ├── auth.js          # User authentication (existing)
│   ├── profile.js       # User profile (existing)
│   └── chat.js          # NEW: Chat session & message API
├── config/
│   └── db.js            # PostgreSQL connection
└── server.js            # Express server with route registration

migrations/
└── 001_create_chat_tables.sql  # Database schema for chat
```

---

## 🗄️ Database Schema

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,  -- Links to users table
  title VARCHAR(255),         -- Auto-generated or custom
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  total_tokens_used INTEGER,  -- Cumulative token count
  max_token_limit INTEGER,    -- Default: 1000
  is_archived BOOLEAN
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER,         -- Links to chat_sessions
  role VARCHAR(20),           -- 'user' or 'assistant'
  content TEXT,               -- Message text
  tokens_used INTEGER,        -- Tokens for this message
  created_at TIMESTAMP
);
```

### Token Usage Stats Table (Optional)
```sql
CREATE TABLE token_usage_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  usage_date DATE,
  tokens_consumed INTEGER,
  messages_count INTEGER
);
```

---

## 🚀 Setup Instructions

### Backend Setup

1. **Run the migration to create chat tables**:
   ```bash
   cd Furemedy-Backend-main
   psql -U postgres -d your_db_name -f migrations/001_create_chat_tables.sql
   ```

2. **Verify new routes are registered** in `src/server.js`:
   ```javascript
   const chatRoutes = require('./routes/chat');
   app.use('/api/chat', chatRoutes);
   ```

3. **Start the backend server**:
   ```bash
   npm run dev  # or: npm run start
   ```

### Frontend Setup

1. **Install the new package files**:
   ```bash
   npx expo install expo-router  # Already installed
   ```

2. **Verify token storage is configured** in `AuthContext.tsx`
   - The `useAuth()` hook provides `token` to all components
   - Token is used in all API requests

3. **Update API URLs if needed** in `services/chatApi.ts`:
   ```typescript
   const API_URL = Platform.select({
     web: 'http://localhost:8080',
     default: 'http://YOUR_IP:8080', // Update with your backend IP
   });
   ```

4. **Start the app**:
   ```bash
   npx expo start
   ```

---

## 📋 API Endpoints Reference

All endpoints require `Authorization: Bearer {token}` header.

### Chat Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/sessions` | Create new chat session |
| GET | `/api/chat/sessions` | List user's chat sessions |
| GET | `/api/chat/sessions/:id` | Get session with all messages |
| PATCH | `/api/chat/sessions/:id` | Update session title or archive status |
| DELETE | `/api/chat/sessions/:id` | Delete session and messages |

### Chat Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/messages` | Add message to session (auto-deducts tokens) |
| GET | `/api/chat/messages/:sessionId` | List messages with pagination |
| DELETE | `/api/chat/messages/:id` | Delete message (refunds tokens) |

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/stats` | Get user's token usage statistics |

---

## 🎛️ Component API Reference

### TokenCounter Component
```tsx
<TokenCounter
  currentTokens={100}           // Tokens used so far
  maxTokens={1000}              // Maximum allowed
  isLimitExceeded={false}       // Show critical state
  showLabel={true}              // Show "Token Usage" label
  size="medium"                 // 'small' | 'medium' | 'large'
/>
```

### ChatMessage Component
```tsx
<ChatMessage
  role="user"                   // 'user' or 'assistant'
  text="Hello..."               // Message content
  onOptionPress={(option) => {}} // Callback for button clicks
  answerOptions={['Yes', 'No']} // Optional quick buttons
/>
```

### ChatInput Component
```tsx
<ChatInput
  value={message}
  onChangeText={setMessage}
  onSendMessage={handleSend}
  isLoading={false}
  isDisabled={tokenLimitExceeded}
  currentTokens={100}
  maxTokens={1000}
/>
```

### ChatSidebar Component
```tsx
<ChatSidebar
  sessions={sessions}
  currentSessionId={1}
  onSelectSession={(id) => {}}
  onNewChat={() => {}}
  onDeleteChat={(id) => {}}
  onClose={() => {}}
  isLoading={false}
  isModal={true}  // false for persistent, true for modal
/>
```

---

## 📊 Token Tracking System

### How Tokens Are Estimated

The system uses a conservative rule: **1 token ≈ 4 characters** (English text)

```typescript
// Example:
text = "What is ringworm?"  // 18 characters
estimatedTokens = Math.ceil(18 / 4) = 5 tokens
```

This is slightly generous to avoid exceeding limits.

### Token Flow

1. **User sends message**: Tokens estimated before sending
2. **Check limit**: If (currentTokens + newTokens) > max, reject
3. **Add message**: Saved to database with token count
4. **Update session**: total_tokens_used incremented
5. **Bot responds**: Response tokens estimated and saved
6. **Refresh UI**: Token counter updates

### Default Limits

- **Max token limit per session**: 1000 (configurable per session)
- **Estimated tokens per message**: ~50-200 (varies with length)

Users can create multiple sessions once a limit is reached.

---

## 🎨 UI/UX Features

### Responsive Sidebar

- **Mobile** (< 768px): Sidebar opens as full-screen modal when menu icon is tapped
- **Tablet/Desktop** (≥ 768px): Persistent sidebar on the left

### Token Display

- **Green** (< 50%): Plenty of tokens remaining
- **Orange** (50-80%): Warning state shown
- **Red** (> 80%): Critical with message suggesting new chat

### Chat Features

- **Auto-scroll**: Messages scroll to bottom automatically
- **Typing indicator**: Shows "..." while bot is responding
- **Quick replies**: Buttons for Yes/No appear automatically
- **Message formatting**: Bold text via `**text**` syntax
- **Session titles**: Auto-generated from first message

---

## 🔄 Data Flow Diagram

```
User sends message
    ↓
[ChatInput] component validates token limit
    ↓
Message added to local state
    ↓
[chatApi.addChatMessage] → POST /api/chat/messages
    ↓
Backend saves message & updates session tokens
    ↓
Frontend calls Gemini API via [botpressApi]
    ↓
Bot response tokens estimated
    ↓
[chatApi.addChatMessage] → Save bot response
    ↓
[chatApi.getChatSession] → Fetch updated session
    ↓
[TokenCounter] updates with new totals
```

---

## 🐛 Debugging

### Enable Console Logs

All API calls and token operations log to console:

```
✅ Chat session created for user 5: 3
❌ Error loading sessions: Network error
✅ Message added to session 3
```

### Common Issues

**Problem**: "Token limit exceeded"
- **Solution**: User needs to start a new chat session
- **Frontend**: TokenCounter shows "Token limit reached. Please start a new chat"

**Problem**: 401 Unauthorized on API calls
- **Check**: Is token valid and not expired?
- **Fix**: User needs to log in again

**Problem**: Sessions not loading
- **Check**: Is backend running? Database accessible?
- **Test**: `curl -H "Authorization: Bearer {token}" http://localhost:8080/api/chat/sessions`

---

## 📱 Responsive Breakpoints

```typescript
const screenWidth = Dimensions.get('window').width;
const isMobile = screenWidth < 768;

// Usage:
if (isMobile) {
  // Show modal sidebar
} else {
  // Show persistent sidebar
}
```

---

## 🎓 Code Examples

### Creating a New Chat

```typescript
const startNewChat = async () => {
  const newSession = await createChatSession(token, 'New Chat');
  setCurrentSession(newSession);
  setMessages([]);
  setTokenLimitExceeded(false);
};
```

### Sending a Message with Token Tracking

```typescript
const sendChatMessage = async (text: string) => {
  // Estimate tokens
  const userTokens = estimateTokens(text);
  
  // Check if within limit
  if (userTokens + currentSession.total_tokens_used > limit) {
    setTokenLimitExceeded(true);
    return;
  }
  
  // Add to backend
  await addChatMessage(token, sessionId, 'user', text, userTokens);
  
  // Get bot response
  const response = await sendMessage(text);
  
  // Add response to backend
  await addChatMessage(token, sessionId, 'assistant', response, estimateTokens(response));
};
```

### Rendering the Sidebar (Responsive)

```typescript
const isMobile = screenWidth < 768;

return (
  <View>
    {!isMobile && (
      <ChatSidebar isModal={false} />  // Persistent
    )}
    
    <MainChatArea />
    
    {isMobile && sidebarVisible && (
      <ChatSidebar isModal={true} />   // Modal
    )}
  </View>
);
```

---

## ✅ Testing Checklist

- [ ] Backend running at correct IP/port
- [ ] Database tables created (`SELECT * FROM chat_sessions;`)
- [ ] User can create new chat session
- [ ] Messages save to database and appear in chat history
- [ ] Token counter updates correctly
- [ ] Can switch between chat sessions
- [ ] Can delete a chat session
- [ ] Token limit prevents new messages
- [ ] Sidebar works on mobile (modal) and desktop (persistent)
- [ ] Messages from Gemini API appear correctly formatted
- [ ] TypeScript compiles without errors

---

## 🚀 Next Steps & Enhancements

### Possible Improvements

1. **Advanced Token Counting**:
   - Use Gemini's actual token counting API
   - Account for conversation context tokens

2. **Message Editing/Deletion**:
   - Allow users to edit messages and recalculate tokens
   - Implement message regeneration for bot responses

3. **Session Sharing**:
   - Generate shareable session links
   - View-only or collaborative editing

4. **Analytics Dashboard**:
   - Token usage over time (use `token_usage_stats` table)
   - Most active users
   - Average tokens per session

5. **Caching**:
   - Cache frequently accessed sessions
   - Reduce database queries for pagination

6. **Real-time Updates**:
   - WebSocket integration for live message sync
   - Multi-device synchronization

---

## 📞 Support

For issues or questions:
1. Check console logs for error messages
2. Verify backend is running and accessible
3. Check CORS settings if cross-origin errors occur
4. Review database connection in `.env` file

---

## 📄 File Summary

| File | Purpose | Modified |
|------|---------|----------|
| `chatbot.tsx` | Main chat screen | ✅ Refactored |
| `ChatMessage.tsx` | Message bubble | ✅ New |
| `ChatInput.tsx` | Input field | ✅ New |
| `TokenCounter.tsx` | Token progress bar | ✅ New |
| `ChatSidebar.tsx` | Chat history sidebar | ✅ New |
| `chatApi.ts` | Backend API service | ✅ New |
| `tokenCounter.ts` | Token utilities | ✅ New |
| `chat.js` (backend) | Chat API routes | ✅ New |
| `001_create_chat_tables.sql` | Database schema | ✅ New |

---

**Last Updated**: March 3, 2026
**Version**: 1.0.0

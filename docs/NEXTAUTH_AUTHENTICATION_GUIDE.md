# 🔐 NextAuth Authentication Flow Guide

## 📋 Overview
This document explains the complete authentication flow in the Next.js dating app, from user login to backend integration.

---

## 🎯 What Happens When User Clicks Login

### Step 1: User Interaction
```
User enters credentials:
- Email: yash.samtariya@gmail.com
- Password: 123456
- Clicks [Login Button]
```

### Step 2: Frontend Calls NextAuth
```
LoginForm.tsx → signIn('credentials', {
  email: 'yash.samtariya@gmail.com',
  password: '123456',
  redirect: false
})
```

### Step 3: NextAuth Internal Flow
```
Browser → POST /api/auth/callback/credentials
↓
NextAuth Server → Calls authorize() function in auth.ts
↓
authorize() → Calls your actual backend
```

### Step 4: Backend API Call
```
POST https://localhost:3000/auth/login
Headers: {
  'Content-Type': 'application/json',
  'User-Agent': 'NextAuth-Client'
}
Body: {
  "email": "yash.samtariya@gmail.com",
  "password": "123456"
}
```

### Step 5: Backend Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEwLCJlbWFpbCI6Inlhc2guc2FtdGFyaXlhQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzczMjA4NTYzLCJleHAiOjE3NzMyMzczNjN9.zeFQfDpLe6R7uYnVoUO1uVcfk3LPOV1_-v9FHfnfF-c"
}
```

### Step 6: NextAuth Session Creation
```
NextAuth stores token in JWT session
NextAuth creates user object
Browser receives successful login
Redirect to /dashboard
```

---

## 🌐 Network Tab Analysis

### What You SEE in Browser Network Tab:
| Request | Who Makes It | Purpose |
|---------|---------------|----------|
| `POST /api/auth/callback/credentials` | Browser → NextAuth | NextAuth callback endpoint |
| `GET /api/auth/providers` | Browser → NextAuth | Get auth providers |
| `GET /api/auth/csrf` | Browser → NextAuth | Get CSRF token |
| `GET /api/auth/session` | Browser → NextAuth | Check session status |

### What You DON'T See (Server-Side):
| Request | Who Makes It | Why Hidden |
|---------|---------------|------------|
| `POST https://localhost:3000/auth/login` | NextAuth Server → Backend | Server-to-server call |

---

## 🔑 Key Concepts

### Client-Side vs Server-Side
- **Client-Side**: Browser makes calls directly (visible in Network tab)
- **Server-Side**: Node.js server makes calls (NOT visible in Network tab)

### NextAuth as Middleman
```
Browser ↔ NextAuth ↔ Your Backend
   ↑         ↑         ↑
 Visible    Middleman   Hidden
```

### Why Backend Call is Hidden
1. Browser calls NextAuth endpoint
2. NextAuth server runs your `authorize()` function
3. Your function uses `fetch()` (server-side)
4. Server-to-server calls don't appear in browser Network tab

---

## 🐛 Common Issues & Solutions

### Issue 1: TLS/HTTPS Certificate Error
**Error**: `HTTPParserError: Response does not match the HTTP/1.1 protocol`
**Cause**: Node.js rejecting self-signed SSL certificate
**Solution**: 
```bash
# Add to package.json dev script:
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

### Issue 2: CORS Errors
**Error**: `Access-Control-Allow-Origin` header missing
**Cause**: Browser trying to call backend directly
**Reality**: NextAuth handles CORS server-side
**Solution**: Ensure backend calls go through NextAuth, not direct browser calls

### Issue 3: Invalid Credentials
**Error**: `401 Unauthorized` from backend
**Cause**: Wrong email/password or backend expects different format
**Solution**: Check backend logs and compare with Postman request

---

## 🔧 Configuration Details

### Environment Variables
```bash
NEXTAUTH_URL=https://localhost:3001          # Next.js server URL
NEXTAUTH_SECRET=dev-dating-local-secret    # JWT signing secret
NEXT_PUBLIC_API_URL=https://localhost:3000 # Your backend URL
NODE_TLS_REJECT_UNAUTHORIZED=0              # Ignore self-signed certs
```

### Key Files
| File | Purpose |
|------|---------|
| `src/config/auth.ts` | NextAuth configuration and backend calls |
| `src/components/forms/login-form.tsx` | Login form UI and NextAuth signIn |
| `src/hooks/use-api.ts` | API hooks for authenticated requests |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth API route handler |

---

## 🧪 Testing & Debugging

### Step 1: Check Backend Connectivity
```bash
curl -k https://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### Step 2: Check Console Logs
Browser Console should show:
```
🔐 Login form submitted: {email: "...", password: "..."}
📤 Calling NextAuth signIn with: {email: "...", redirect: false}
🔐 NextAuth authorize called with: {email: "...", backendBaseUrl: "..."}
🧪 Backend test response: 200
📤 Sending request to: https://localhost:3000/auth/login
📥 Response status: 200
✅ Login successful, token found: eyJhbGciOiJIUzI1NiIs...
```

### Step 3: Verify Session
```
GET /api/auth/session
Response: {
  "user": { "email": "...", "name": "...", "id": "..." },
  "expires": "...",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 🎯 Success Criteria

### ✅ Working Login Should:
1. User submits form → Console shows form data
2. NextAuth calls backend → Console shows backend URL
3. Backend responds → Console shows success response
4. Session created → `/api/auth/session` returns user data
5. Redirect to dashboard → User lands on protected page
6. API calls work → Dashboard loads matches/chats with auth token

### ❌ Broken Login Shows:
1. TLS errors → Certificate/HTTPS issues
2. Network errors → Backend not running
3. 401 errors → Wrong credentials
4. Redirect loops → Session not created
5. 404 on dashboard → Route protection issues

---

## 📚 Quick Reference

### Debug Commands
```bash
# Kill any running Next.js processes
pkill -f "next dev"

# Start with TLS bypass
npm run dev

# Test backend directly
curl -k https://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"yash.samtariya@gmail.com","password":"123456"}'
```

### Important URLs
- Frontend: `http://localhost:3001`
- Backend: `https://localhost:3000`
- NextAuth API: `http://localhost:3001/api/auth/*`
- Backend Login: `https://localhost:3000/auth/login`

---

## 🎉 Summary

**NextAuth acts as a secure bridge between your frontend and backend:**
- Handles authentication flow
- Manages sessions securely
- Prevents direct backend exposure
- Provides built-in security features (CSRF, etc.)

**Your backend only needs to:**
- Accept POST `/auth/login` with `{email, password}`
- Return `{accessToken}` on success
- Accept `Authorization: Bearer <token>` for protected routes

**The key insight:** You don't see backend calls in Network tab because NextAuth handles them server-side. Check your terminal/console for backend communication logs!

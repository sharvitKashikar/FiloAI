# Frontend Updates - Authentication & Chat History

## ✅ What Was Preserved
1. **Branding**: "ShardulAI" title (no logo)
2. **Layout**: Single column centered layout (max-width: 896px)
3. **Design**: All shadcn/ui components and styling
4. **Components**: FileUpload and ChatInterface (enhanced, not replaced)

## 🆕 What Was Added

### New Pages
- `src/pages/Login.tsx` - Login page
- `src/pages/Signup.tsx` - Signup page

### New Components
- `src/components/Header.tsx` - Header with user info, logout, new chat button
- `src/components/ChatSidebar.tsx` - Chat history sidebar
- `src/components/ProtectedRoute.tsx` - Auth wrapper for protected routes

### New Context
- `src/contexts/AuthContext.tsx` - Authentication state management

### New API Helper
- `src/lib/api.ts` - Axios instance with auth interceptors

## 📁 File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx (new)
│   │   ├── ChatSidebar.tsx (new)
│   │   ├── ProtectedRoute.tsx (new)
│   │   ├── FileUpload.tsx (enhanced)
│   │   └── ChatInterface.tsx (enhanced)
│   ├── contexts/
│   │   └── AuthContext.tsx (new)
│   ├── lib/
│   │   └── api.ts (new)
│   ├── pages/
│   │   ├── Index.tsx (updated with sidebar)
│   │   ├── Login.tsx (new)
│   │   ├── Signup.tsx (new)
│   │   └── NotFound.tsx
│   └── App.tsx (updated with routing)
└── .env (VITE_API_URL=http://localhost:3000/api)
```

## 🚀 How to Run

1. Backend:
   ```bash
   cd backend
   npm start
   ```

2. Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Visit: http://localhost:5173

## 🔐 New Features

### Authentication
- Login/Signup pages
- JWT token stored in localStorage
- Auto-redirect to login if not authenticated
- Logout functionality

### Chat History
- Sidebar showing all user's chats
- Click to load previous conversations
- Delete chats
- New chat button
- Persistent chat sessions in PostgreSQL

### Protected Routes
- Main app only accessible when logged in
- Auto-validation on page load
- 401 errors redirect to login

## 🎯 User Flow

1. Visit app → Redirect to Login
2. Signup/Login → Get JWT token
3. Main app loads with sidebar
4. Upload document → Ask questions
5. Chat saved to database
6. Can switch between chats
7. Logout → Redirect to login

## 📝 Environment Variables

Frontend `.env`:
```
VITE_API_URL=http://localhost:3000/api
```

Backend `.env` (required):
```
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=...
```

## ✨ Preserved Customizations

- Title: "ShardulAI" (not "Document Q&A")
- No logo icon in header
- Single column layout (not 2-column grid)
- Responsive design maintained
- shadcn/ui styling preserved

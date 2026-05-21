# Worknoon Chat Frontend

Next.js chat client for the Worknoon real-time support system (buyer to agent/designer/merchant).

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Socket.IO client
- Lucide icons

## Current Features

- JWT auth flow (login, signup, profile)
- Inbox with conversation list + active chat panel
- Real-time receive/send, presence, typing, and read receipts
- Unread counters with live updates
- Chat deletion from conversation actions menu
- Admin dashboard (admin-only page) with live online indicators
- Admin user settings modal with role update UI

## Important ACL Notes

- Non-admin users do not call admin-only user listing APIs.
- Admin-only role updates are wired via backend endpoint.
- Frontend route guards are UX-level; backend is source of truth.

## Project Structure

```text
src/
    app/
        inbox/page.tsx
        admin/page.tsx
        profile/page.tsx
        login/page.tsx
        signup/page.tsx
    components/
        ChatList.tsx
        ChatPanel.tsx
        MessageBubble.tsx
        TypingIndicator.tsx
        Sidebar.tsx
        RoleBadge.tsx
    context/
        AuthContext.tsx
        SocketContext.tsx
    lib/
        api.ts
        types.ts
```

## Local Development

### Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:3001`

### Install + run

```bash
npm install
npm run dev
```

App URL: `http://localhost:3000`

### Build

```bash
npm run build
npm run start
```

## Environment

- `NEXT_PUBLIC_API_URL` (optional)
    - Default: `http://localhost:3001`

## API Integration Summary

- Auth/profile endpoints
- Conversation + message endpoints
- Upload endpoint helper exists in API client

## Known Gap

- Upload UI buttons in chat panel are not fully wired to the upload flow yet (API support exists, UX wiring is pending).


# Worknoon Chat Frontend

Real-time chat frontend for the Worknoon eCommerce platform, built with Next.js 16, Tailwind CSS v4, and Socket.IO.

## Technologies

- **Next.js 16** (App Router) — React framework
- **Tailwind CSS v4** — Utility-first styling
- **TypeScript** — Type safety
- **Socket.IO Client** — Real-time WebSocket
- **Framer Motion** — Animations
- **Lucide React** — Icon library
- **JWT Decode** — Token parsing

## Features

- Glassmorphism design system with HSL color tokens
- Light/dark theme support
- Responsive split-pane inbox (desktop) with sliding drawer (mobile)
- Real-time messaging with typing indicators and presence status
- File upload support (images, documents)
- Role-based colored badges
- Product context cards (WooCommerce integration)
- Profile page with instant role switcher for testing
- Admin dashboard with user directory and live stats
- Protected routes with auth guard

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Design system, themes, animations
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Auth-based redirect
│   ├── login/page.tsx       # Login page
│   ├── signup/page.tsx      # Registration page
│   ├── inbox/page.tsx       # Split-pane chat inbox
│   ├── profile/page.tsx     # User profile & role switcher
│   └── admin/page.tsx       # Admin dashboard
├── context/
│   ├── AuthContext.tsx      # Auth state management
│   └── SocketContext.tsx    # Socket.IO connection
├── lib/
│   ├── api.ts               # Typed API client
│   └── types.ts             # TypeScript interfaces
└── components/
    ├── ChatList.tsx         # Conversation sidebar
    ├── ChatPanel.tsx        # Active conversation view
    ├── MessageBubble.tsx    # Individual message display
    ├── ProductContextCard.tsx
    ├── TypingIndicator.tsx
    └── RoleBadge.tsx
```

## Setup

### Prerequisites

- Node.js 18+
- Backend server running on port 5000

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:3000`.

### Build

```bash
npm run build
npm start
```

## Design

The UI uses a glassmorphism aesthetic with:
- Semi-transparent backgrounds with backdrop blur
- HSL color tokens for consistent theming
- Scrollability affordance hints (gradient shadows at scroll edges)
- Smooth CSS animations (fade-in, slide, typing bounce)
- Custom scrollbar styling

## Challenges

- **Socket.IO + React state sync** — Managing real-time message delivery alongside REST API message history without duplicates.
- **Responsive split-pane** — Desktop shows side-by-side layout; mobile uses an overlay drawer with smooth transitions.
- **Type-safe API layer** — All 12 backend endpoints wrapped in typed functions with proper error handling and 401 auto-logout.

## Demo

[Demo video walkthrough](#) — *Add your Loom/YouTube link here*

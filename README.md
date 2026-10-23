# 🚉 StationTalk — Real-Time Group Voice Rooms

**Phase 1 MVP**: Station-based group voice rooms with real-time audio powered by [LiveKit](https://livekit.io).

## Features

- 🎙️ **Real-time voice rooms** — actual browser microphone capture, audio publication, and playback via LiveKit
- 🚉 **12 seed stations** across 5 regions (North, South, East, West, Central)
- 🔍 **Search & filter** — find stations by name or region
- 👥 **Live participant counts** — see who's in each room
- 🎧 **Listener-first** — join as listener, request to speak
- 🔒 **Secure tokens** — server-side identity generation and short-lived JWT tokens
- 📱 **Mobile-first** — responsive design with accessible controls
- ⚡ **Rate limiting** — in-memory sliding-window rate limiter (dev-only)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Real-time Audio | LiveKit Cloud |
| Client SDK | `livekit-client`, `@livekit/components-react` |
| Server SDK | `livekit-server-sdk` |
| Testing | Jest + ts-jest |
| Deployment | Vercel |

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A [LiveKit Cloud](https://cloud.livekit.io) account (free tier available)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd stationtalk
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your LiveKit Cloud credentials:

```env
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

> Get credentials from: https://cloud.livekit.io → Settings → Keys

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test in multiple tabs

Open the same room in two browser tabs to test real-time audio between participants.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:ci` | Run tests with coverage |
| `npm run typecheck` | TypeScript type checking |
| `npm run verify` | Run lint + tests + build (CI pipeline) |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:ci

# Run specific test file
npx jest src/__tests__/stations.test.ts
```

### What's tested

- **Station validation**: slug normalization, registry lookups, search, region filtering, injection attacks
- **Token permissions**: listener-only defaults (`canPublish: false`), speaker grants, identity uniqueness
- **Rate limiting**: window enforcement, remaining count tracking, blocking on limit exceeded

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: StationTalk MVP Phase 1"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Add environment variables:
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `NEXT_PUBLIC_LIVEKIT_URL`
5. Deploy

### 3. Verify

- Open the deployed URL
- Join a station
- Test audio in two browser windows

## Architecture

```
src/
├── app/
│   ├── layout.tsx           # Root layout with dark theme
│   ├── page.tsx             # Landing page: station grid
│   ├── globals.css          # Global styles
│   ├── room/[slug]/
│   │   └── page.tsx         # Room page: join form + LiveKit room
│   └── api/token/
│       └── route.ts         # POST: issue LiveKit access tokens
├── components/
│   ├── StationGrid.tsx      # Filterable station card grid
│   ├── StationCard.tsx      # Station card with live count
│   ├── RegionFilter.tsx     # Region filter pills
│   ├── SearchBar.tsx        # Station search input
│   ├── ParticipantTile.tsx  # Participant avatar with speaking indicator
│   └── RoomControls.tsx     # Mute, request-to-speak, leave controls
├── lib/
│   ├── stations.ts          # Station registry + validation
│   ├── livekit.ts           # Server-side token generation
│   ├── identity.ts          # Participant identity generation
│   └── rate-limit.ts        # In-memory rate limiter
└── __tests__/
    ├── stations.test.ts     # Station validation tests
    └── token.test.ts        # Token + identity + rate-limit tests
```

## Security

- ✅ **Secrets stay server-side** — `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are only accessed in API routes
- ✅ **No token logging** — tokens and secrets are never logged
- ✅ **Validated room names** — only registered station slugs are accepted; arbitrary room names are rejected
- ✅ **Server-generated identities** — UUID-based, not user-controlled
- ✅ **Listener-only by default** — `canPublish: false`, `canSubscribe: true`
- ✅ **Short-lived tokens** — 4-hour TTL
- ✅ **Rate limiting** — 10 req/min per IP (in-memory)

## Known Limitations (Phase 1)

> ⚠️ These are documented, intentional limitations for the MVP.

| Limitation | Detail |
|-----------|--------|
| **No server-side speaker cap** | A 7-speaker limit is NOT enforced server-side. Any participant can self-promote via the dev button. |
| **Dev-only speaker promotion** | The [DEV MODE] promote button is client-side and insecure. Production requires server-side moderation with LiveKit webhooks. |
| **In-memory rate limiting** | Resets on server restart. Not shared across instances. Use Redis or edge-based rate limiting in production. |
| **No persistent storage** | No database. Station data is static. Participant counts are live from LiveKit only when connected. |
| **No authentication** | No user accounts or login. Identity is ephemeral per session. |
| **No live counts on landing page** | Participant counts on station cards require LiveKit server API integration (not yet implemented). |

## What's NOT Built (Per Spec)

- ❌ One-to-one matching
- ❌ Paid plans / subscriptions
- ❌ Text chat
- ❌ Video

## License

Private — All rights reserved.

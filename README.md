# SecretTunnel 🔐

> Zero-knowledge `.env` secret sharing for developers. Secrets are encrypted in your browser before they ever leave your machine — the server stores only ciphertext.

![SecretTunnel Banner](https://placehold.co/1200x400/0f172a/38bdf8?text=SecretTunnel+—+Zero+Knowledge+Secret+Sharing)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-red)](https://upstash.com/)

---

## The Problem

When collaborating on a codebase, sharing `.env` files over WhatsApp, Discord, or email is common — and dangerous. Those messages live in logs, backups, and screenshots forever.

**SecretTunnel fixes this.** Paste your secrets → get a one-time link → share it → link self-destructs after first view.

---

## How It Works

```
Browser (yours)                 Server                   Browser (theirs)
──────────────────────────────────────────────────────────────────────────
Paste .env content
        │
AES-256 encrypt                                          
(Web Crypto API)                
        │
POST /api/secrets ──────► Store ciphertext in Redis ◄── GET /api/secrets/:token
                              (with TTL + burn flag)              │
        │                                               Decrypt in browser
Receive token + key ◄───────── Return token                      │
        │                                               Plaintext shown once
Share link with key                                               │
(key never hits server)                                  Redis entry deleted
```

The **encryption key lives only in the URL fragment** (`#key=...`). Fragments are never sent to the server. The server is provably blind to your plaintext.

---

## Features

- 🔐 **Client-side AES-256-GCM encryption** via Web Crypto API
- 🔥 **Burn after read** — secret deleted from Redis on first view
- ⏱️ **Configurable TTL** — 1 hour, 24 hours, or 7 days
- 🔑 **Optional password protection** — adds a second decryption layer
- 📋 **Audit trail** — view timestamp and IP logged per secret
- 🚦 **Rate limiting** — sliding window via Redis, prevents abuse
- 👤 **GitHub OAuth** — optional login for workspace history
- 📱 **Fully responsive** — works on mobile

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | API routes + SSR in one repo |
| Language | TypeScript | Type-safe throughout |
| Storage | Redis (Upstash) | Native TTL, instant reads |
| Auth | NextAuth.js | GitHub OAuth in <30 min |
| Encryption | Web Crypto API | Native browser, no library bloat |
| Styling | Tailwind CSS | Rapid UI |
| Deployment | AWS / Vercel | Live production URL |

> **Why single Next.js and not Next.js + Express?**
> Next.js API routes handle everything this project needs — Redis, rate limiting, auth, and REST endpoints. Adding Express introduces a second port, CORS configuration, and dual deployment complexity for zero benefit here.

---

## Folder Structure

```
secrettunnel/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page (create secret form)
│   │
│   ├── s/
│   │   └── [token]/
│   │       └── page.tsx          # Secret view page (decrypt + burn)
│   │
│   ├── dashboard/
│   │   └── page.tsx              # Auth-gated: view your created secrets + audit log
│   │
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # GitHub OAuth login
│   │
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts      # NextAuth handler
│       │
│       ├── secrets/
│       │   ├── route.ts          # POST /api/secrets → create & store ciphertext
│       │   └── [token]/
│       │       └── route.ts      # GET → fetch ciphertext | DELETE → manual burn
│       │
│       └── audit/
│           └── route.ts          # GET /api/audit → fetch logs for dashboard
│
├── components/
│   ├── ui/                       # Reusable primitives (Button, Input, Badge...)
│   ├── SecretForm.tsx            # Main create-secret form with encryption logic
│   ├── SecretViewer.tsx          # Decrypt + display component
│   ├── AuditTable.tsx            # Dashboard audit log table
│   └── Navbar.tsx
│
├── lib/
│   ├── crypto.ts                 # Web Crypto API: encrypt(), decrypt(), generateKey()
│   ├── redis.ts                  # Upstash Redis client + helper functions
│   ├── rate-limit.ts             # Sliding window rate limiter
│   ├── auth.ts                   # NextAuth config
│   └── constants.ts              # TTL options, limits, etc.
│
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
│
├── middleware.ts                 # Edge middleware: rate limiting on /api routes
│
├── .env.example                  # (ironic) template for required env vars
├── .env.local                    # Local secrets — never committed
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Redis](https://upstash.com/) instance (Upstash free tier works)
- A GitHub OAuth App for auth ([create one here](https://github.com/settings/developers))

### Installation

```bash
# Clone the repo
git clone https://github.com/devsharmagit/secrettunnel
cd secrettunnel

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# .env.example

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

```bash
# Run locally
npm run dev
```

---

## Key Implementation Details

### Client-side Encryption (`lib/crypto.ts`)

```ts
// Key generation — stays in browser, appended to URL fragment
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt before POST /api/secrets
export async function encrypt(plaintext: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}
```

### Redis Schema

```
secret:{token}  →  { ciphertext, iv, ttl, passwordHash?, burned }
audit:{token}   →  { createdAt, viewedAt?, viewerIp? }
ratelimit:{ip}  →  sliding window counter
```

### Burn After Read (`api/secrets/[token]/route.ts`)

```ts
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const secret = await redis.get(`secret:${params.token}`);
  if (!secret) return Response.json({ error: "Secret not found or already viewed" }, { status: 404 });

  // Atomic delete — burn on read
  await redis.del(`secret:${params.token}`);
  await redis.set(`audit:${params.token}`, { viewedAt: Date.now(), viewerIp: req.headers.get("x-forwarded-for") });

  return Response.json(secret);
}
```

---

## Security Model

| Threat | Mitigation |
|---|---|
| Server compromise | Server stores only AES-256 ciphertext. Key is never transmitted. |
| Link interception | Key lives in URL `#fragment` — not sent in HTTP requests or server logs |
| Replay attacks | Burn-after-read — Redis entry deleted on first GET |
| Brute force | Rate limiting: 10 secrets/hour per IP |
| Weak passwords | Optional password stretching via PBKDF2 |
| Stale secrets | Mandatory TTL — Redis auto-expires all entries |

---

## Roadmap

- [x] Core encrypt → share → burn flow
- [x] Configurable TTL
- [x] GitHub OAuth + dashboard
- [x] Audit trail
- [ ] Team workspaces (share history within a GitHub org)
- [ ] CLI tool: `npx secrettunnel push .env.local`
- [ ] Webhook on view (notify creator when secret is accessed)

---

## Contributing

PRs are welcome. Please open an issue first for major changes.

```bash
git checkout -b feature/your-feature
git commit -m "feat: your feature"
git push origin feature/your-feature
```

---

## License

[MIT](LICENSE) © [Dev Sharma](https://devsharma.me)

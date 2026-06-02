https://github.com/user-attachments/assets/02c1cc18-643b-4318-b786-f8a20f80ad37

# SecretTunnel 🔐

**Zero-knowledge `.env` secret sharing for developers.** Secrets are encrypted in your browser before they ever leave your machine — the server stores only ciphertext.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](#license)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-red)](https://upstash.com/)

---

## The Problem

Sharing `.env` files over WhatsApp, Discord, or email is common — and dangerous. Those messages live in logs, backups, and screenshots forever.

**SecretTunnel fixes this.** Paste your secrets → get a one-time link → share it → link self-destructs after first view.

---

## How It Works

```
Your browser                    Server                  Their browser
──────────────────────────────────────────────────────────────────────
Paste .env content
        │
AES-256-GCM encrypt
(runs entirely in browser)
        │
POST ciphertext ───────────► Store in Redis ◄──── GET ciphertext
                              (TTL + burn flag)         │
        │                                         Decrypt in browser
Share link ◄─── Receive token                          │
(key never hits server)                          Plaintext shown once
                                                       │
                                                 Redis entry deleted
```

The encryption key lives only in the URL fragment (`#key=...`). Fragments are never sent to the server — it's provably blind to your plaintext.

---

## Features

- 🔐 **Client-side AES-256-GCM encryption** — secrets never leave your browser unencrypted
- 🔥 **Burn after read** — secret deleted on first view
- ⏱️ **Configurable TTL** — set expiry from minutes to weeks
- 🔑 **Optional password protection** — adds a second layer of encryption
- 💻 **CLI tool** — `npx secrettnl` for terminal-based workflows
- 📊 **Audit logs** — see when your secret was accessed
- 🔔 **Webhook notifications** — get notified the moment a secret is viewed
- 🔄 **Versioned secrets** — manage multiple versions of a secret group
- 👤 **Authentication** — GitHub OAuth or email/password

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Framework | Next.js 16, TypeScript, Turborepo |
| Frontend | React 19, Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API Routes, Prisma, PostgreSQL |
| Auth | NextAuth.js (GitHub OAuth + credentials) |
| Infrastructure | Upstash Redis (TTL/caching), Upstash QStash (webhooks) |
| Encryption | Web Crypto API (browser-native, AES-256-GCM) |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Bun ≥ 1.2.23
- PostgreSQL database
- Upstash account (Redis + QStash) — optional for local dev

### Installation

```bash
git clone https://github.com/yourusername/secrettunnel.git
cd secrettunnel
bun install
```

### Environment Variables

Create `apps/web/.env.local`:

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/secrettunnel
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=SecretTunnel <noreply@example.com>

# Optional
GITHUB_ID=your-github-oauth-id
GITHUB_SECRET=your-github-oauth-secret
UPSTASH_REDIS_REST_URL=https://your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-token
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key
```

### Run

```bash
# Database setup
cd apps/web && bun prisma migrate deploy

# Start dev server
bun dev   # from root — starts web app at localhost:3000
```

---

## CLI Usage

```bash
# Push a secret
npx secrettnl push "content" [--ttl 24h] [--password pass] [--file .env]

# Pull a secret
npx secrettnl pull <share-url> [--password pass] [--output .env]
```

---

## API Reference

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/secrets` | — | Create a secret |
| `GET` | `/api/secrets/:token` | — | Retrieve a secret |
| `GET` | `/api/audit` | ✅ | List audit logs |
| `GET` | `/api/versioned-secrets/groups` | ✅ | List secret groups |
| `POST` | `/api/versioned-secrets` | ✅ | Create versioned secret |

---

## Deployment

Supports Vercel, Docker, or any Node.js ≥ 18 host.

```bash
# Vercel
vercel deploy

# Build manually
bun run build
cd apps/web && bun run start
```

For production, generate a strong secret: `openssl rand -base64 32`

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

**Node.js** ≥18 · **Package Manager:** Bun ≥1.2.23 · **Last updated:** April 2026

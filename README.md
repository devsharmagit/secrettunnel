# SecretTunnel 🔐

**Zero-knowledge `.env` secret sharing for developers.** Secrets are encrypted in your browser before they ever leave your machine — the server stores only ciphertext.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](#license)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Turbo](https://img.shields.io/badge/Turbo-2.9-orange)](https://turborepo.dev/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-red)](https://upstash.com/)

---

## 🎯 The Problem

When collaborating on a codebase, sharing `.env` files over WhatsApp, Discord, or email is common — and dangerous. Those messages live in logs, backups, and screenshots forever.

**SecretTunnel fixes this.** Paste your secrets → get a one-time link → share it → link self-destructs after first view.

---

## ✨ How It Works

```
Browser (yours)                 Server                   Browser (theirs)
──────────────────────────────────────────────────────────────────────────
Paste .env content
        │
AES-256-GCM encrypt              
(Web Crypto API)                
        │
POST /api/secrets ───────► Store ciphertext in Redis ◄── GET /api/secrets/:token
                             (with TTL + burn flag)          │
        │                                             Decrypt in browser
Receive token + key ◄────── Return token                     │
        │                                             Plaintext shown once
Share link with key                                          │
(key never hits server)                               Redis entry deleted
```

**The encryption key lives only in the URL fragment** (`#key=...`). Fragments are never sent to the server. The server is provably blind to your plaintext.

---

## 🚀 Features

- 🔐 **Client-side AES-256-GCM encryption** via Web Crypto API
- 🔥 **Burn after read** — secret deleted from Redis on first view
- ⏱️ **Configurable TTL** — from minutes to weeks
- 🔑 **Optional password protection** — adds a second decryption layer
- 🌐 **Web UI** — intuitive interface for sharing secrets
- 💻 **CLI tool** — `secrettnl` command-line interface for automation
- 📊 **Audit logging** — track who viewed your secrets
- 🔗 **Webhook notifications** — get notified when secrets are accessed
- 🔄 **Versioned secrets** — manage multiple versions of secret groups
- 👤 **User authentication** — GitHub OAuth and credential-based auth
- 🎨 **Modern UI** — built with shadcn/ui and Tailwind CSS

---

## 📦 Tech Stack

### Core Framework
- **[Turbo](https://turborepo.dev/)** — Monorepo management
- **[Next.js 16](https://nextjs.org/)** — React framework with API routes
- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe development

### Frontend
- **[React 19](https://react.dev/)** — UI library
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** — Component library
- **[React Hook Form](https://react-hook-form.com/)** — Form state management
- **[Zod](https://zod.dev/)** — Schema validation
- **[Sonner](https://sonner.emilkowal.ski/)** — Toast notifications

### Backend & Database
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** — Serverless backend
- **[Prisma](https://www.prisma.io/)** — ORM for PostgreSQL
- **[PostgreSQL](https://www.postgresql.org/)** — Main database
- **[@prisma/adapter-pg](https://www.prisma.io/)** — Prisma PostgreSQL adapter

### Authentication
- **[NextAuth.js](https://next-auth.js.org/)** — Authentication library
- **GitHub OAuth** — Social login
- **Credential-based auth** — Email/password authentication
- **Password hashing** — scrypt with salt for secure storage

### Infrastructure & Services
- **[@upstash/redis](https://upstash.com/)** — Serverless Redis for caching & TTL
- **[@upstash/qstash](https://upstash.com/)** — Messaging queue for webhook delivery
- **[Axios](https://axios-http.com/)** — HTTP client
- **[Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)** — Browser-native encryption

### Development Tools
- **[ESLint](https://eslint.org/)** — Code linting
- **[Prettier](https://prettier.io/)** — Code formatting
- **[tsup](https://tsup.egoist.dev/)** — TypeScript bundler

---

## 📁 Project Structure

```
secrettunnel/
├── apps/                          # Applications
│   ├── cli/                       # Command-line interface
│   │   ├── src/
│   │   │   ├── index.ts           # CLI entry point
│   │   │   ├── push.ts            # Push (create secret) command
│   │   │   ├── pull.ts            # Pull (read secret) command
│   │   │   ├── config.ts          # Configuration
│   │   │   ├── type.ts            # TypeScript types
│   │   │   └── utils.ts           # Shared utilities
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   │
│   └── web/                       # Next.js web application
│       ├── src/
│       │   ├── app/               # App router (Next.js)
│       │   │   ├── api/           # API routes
│       │   │   │   ├── audit/     # Audit log endpoint
│       │   │   │   ├── auth/      # NextAuth.js routes
│       │   │   │   ├── secrets/   # Secret CRUD endpoints
│       │   │   │   ├── test/      # Test endpoint
│       │   │   │   ├── versioned-secrets/  # Versioned secrets API
│       │   │   │   └── webhooks/  # Webhook delivery
│       │   │   ├── dashboard/     # Dashboard page
│       │   │   ├── signin/        # Sign-in page
│       │   │   ├── signup/        # Sign-up page
│       │   │   ├── s/             # Public secret view page
│       │   │   └── vs/            # Versioned secrets view
│       │   ├── components/        # React components
│       │   │   ├── auth/          # Auth components (forms, buttons)
│       │   │   ├── ui/            # shadcn/ui components
│       │   │   ├── AppHeader.tsx  # Navigation header
│       │   │   ├── SecretForm.tsx # Secret creation form
│       │   │   ├── SecretViewer.tsx
│       │   │   ├── AuditTable.tsx # Audit log display
│       │   │   └── VersionedSecretsSection.tsx
│       │   ├── lib/               # Server/shared utilities
│       │   │   ├── auth.ts        # NextAuth configuration
│       │   │   ├── prisma.ts      # Prisma client
│       │   │   ├── password.ts    # Password hashing
│       │   │   ├── redis.ts       # Redis client
│       │   │   ├── rate-limit.ts  # Rate limiting
│       │   │   ├── schema.ts      # Zod validation schemas
│       │   │   ├── user-store.ts  # User data management
│       │   │   ├── utils.ts       # Utilities
│       │   │   └── webhook-url.ts # Webhook URL handling
│       │   ├── types/             # TypeScript types
│       │   │   └── next-auth.d.ts # NextAuth type extensions
│       │   ├── proxy.ts           # Request proxy
│       │   └── globals.css        # Global styles
│       ├── prisma/                # Database schema
│       │   ├── schema.prisma      # Prisma schema
│       │   └── migrations/        # Database migrations
│       ├── public/                # Static assets
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       ├── tailwind.config.ts
│       └── eslint.config.js
│
├── packages/                      # Shared packages
│   ├── encryption/                # Encryption utilities
│   │   ├── src/
│   │   │   ├── crypto.ts          # Crypto functions
│   │   │   └── index.ts           # Export
│   │   └── package.json
│   ├── eslint-config/             # Shared ESLint configurations
│   │   ├── base.js
│   │   ├── next.js
│   │   └── react-internal.js
│   └── typescript-config/         # Shared TypeScript configurations
│       ├── base.json
│       ├── nextjs.json
│       └── react-library.json
│
├── package.json                   # Root package.json
├── turbo.json                     # Turbo configuration
└── README.md                      # This file
```

---

## 🗄️ Database Schema

SecretTunnel uses PostgreSQL with Prisma ORM. Key models:

### `User`
- Stores user account information
- Fields: `id`, `name`, `email`, `profilePhoto`, `emailVerified`, `createdAt`, `updatedAt`
- Relations: Has many `Account`s

### `Account`
- Oauth/credential provider accounts linked to users
- Fields: `id`, `userId`, `provider`, `providerAccountId`, `access_token`, `refresh_token`, `expires_at`, `password_hash`, etc.
- Supports GitHub OAuth and credential-based auth
- Relations: Belongs to `User`

### `SecretGroup`
- Groups of versioned secrets (e.g., "production .env")
- Fields: `id`, `userId`, `name`, `createdAt`
- Relations: Has many `SecretVersion`s

### `SecretVersion`
- Individual versions of secrets within a group
- Fields: `id`, `groupId`, `versionNumber`, `ciphertext`, `iv`, `createdAt`
- Encrypted content stored as ciphertext + IV
- Relations: Belongs to `SecretGroup`

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Bun** ≥ 1.2.23 (or npm/yarn as fallback)
- **PostgreSQL** database (or Docker PostgreSQL)
- Optional: **Redis/Upstash** for session/TTL
- Optional: **GitHub OAuth credentials** for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/secrettunnel.git
   cd secrettunnel
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in `apps/web/`:
   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/secrettunnel

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # GitHub OAuth (optional)
   GITHUB_ID=your-github-oauth-app-id
   GITHUB_SECRET=your-github-oauth-app-secret

   # Upstash Redis (for TTL/caching)
   UPSTASH_REDIS_REST_URL=https://your-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-token

   # Upstash QStash (for webhooks)
   QSTASH_TOKEN=your-qstash-token
   QSTASH_CURRENT_SIGNING_KEY=your-signing-key
   QSTASH_NEXT_SIGNING_KEY=your-next-signing-key

   # Optional: API URL for CLI
   SECRETTUNNEL_API_URL=http://localhost:3000
   API_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   cd apps/web
   bun prisma migrate deploy  # Apply migrations
   # or
   bun prisma db push         # For development
   ```

5. **Run the development server**
   ```bash
   # From root
   bun dev
   ```

   This starts:
   - **Web app**: http://localhost:3000
   - **Turbo UI**: http://localhost:3000

   Individual apps:
   ```bash
   # Web app only
   cd apps/web && bun run dev

   # CLI
   cd apps/cli && bun run dev
   ```

---

## 📝 Available Commands

### Root Commands (Turbo)

```bash
# Development
bun dev              # Run all apps in dev mode

# Building
bun run build        # Build all apps and packages

# Type checking
bun run check-types  # Type-check all apps

# Linting
bun run lint         # Lint all apps

# Formatting
bun run format       # Format code with Prettier
```

### Web App Commands

```bash
cd apps/web

# Development
bun run dev          # Start dev server on :3000

# Building
bun run build        # Production build
bun run start        # Start production server

# Type checking & linting
bun run check-types  # TypeScript check
bun run lint         # ESLint

# Database
bun prisma migrate dev          # Create and apply migration
bun prisma migrate deploy       # Apply migrations
bun prisma db push              # Sync schema (dev)
bun prisma studio              # Open Prisma Studio
```

### CLI Commands

```bash
cd apps/cli

# Development
bun run dev

# Build
bun run build

# Usage examples
bun src/index.ts push "my secret"
bun src/index.ts pull <share-url>
```

---

## 🔐 Security Architecture

### Encryption
- **Algorithm**: AES-256-GCM (Web Crypto API)
- **Key location**: URL fragment only (`#key=...`)
- **Server**: Receives and stores only ciphertext
- **Key derivation**: Not exposed to server; derived client-side

### Password Protection (Optional)
- **Algorithm**: scrypt with salt
- **Storage**: Password hash stored in Redis/PostgreSQL
- **Comparison**: Timing-safe comparison to prevent timing attacks
- **Implementation**: `lib/password.ts` using Node.js crypto

### Authentication
- **Provider 1**: GitHub OAuth via NextAuth.js
- **Provider 2**: Credential-based (email + password)
- **Session**: HTTP-only cookies (NextAuth.js default)
- **Type safety**: Custom `next-auth.d.ts` type extensions

### Network Security
- **HTTPS**: Required in production
- **Rate limiting**: Implemented in `lib/rate-limit.ts`
- **CORS**: Configured as needed
- **Webhook timeout**: 5 seconds (configurable)

---

## 🔗 API Endpoints

### Public Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/secrets` | Create a secret |
| `GET` | `/api/secrets/:token` | Retrieve a secret |
| `GET` | `/api/test` | Health check |

### Authenticated Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/audit` | List audit logs |
| `GET` | `/api/versioned-secrets/groups` | List secret groups |
| `POST` | `/api/versioned-secrets` | Create versioned secret |
| `GET` | `/api/versioned-secrets/:id` | Get versioned secret |

### Webhook Delivery

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/webhooks/deliver` | Deliver webhook notifications |

---

## 🗂️ App Overview

### `apps/cli`

**SecretTunnel CLI** — Node.js command-line tool for secret management without UI.

**Features:**
- Push secrets from command line or files
- Pull secrets with optional password
- Configure TTL and webhooks
- Custom API endpoints via environment variables

**Commands:**
```bash
# Push secret
bun src/index.ts push "content" [--ttl 24h] [--password pass] [--webhook url] [--file path]

# Pull secret
bun src/index.ts pull <url-or-token> [--key base64] [--password pass] [--output path|->]
```

**API endpoints used:**
- `POST /api/secrets` — Create secret
- `GET /api/secrets/:token` — Retrieve secret

---

### `apps/web`

**SecretTunnel Web App** — Next.js full-stack application with UI, authentication, and versioned secrets.

**Key routes:**

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Landing page |
| `/signin` | Sign in | User login |
| `/signup` | Sign up | User registration |
| `/dashboard` | Dashboard | User's secret groups |
| `/s/:token` | Secret viewer | Public secret view |
| `/vs/:groupId` | Versioned secrets | Versioned secret group |

**Key features:**
- User authentication (GitHub + credentials)
- Create, view, and delete secrets
- Versioned secret management
- Audit logging
- Webhook integration
- Dark mode support (next-themes)

---

## 📦 Packages

### `@repo/encryption`

Shared encryption utilities for AES-256-GCM encryption and decryption.

**Exports:**
- `encrypt()` — Encrypt plaintext to ciphertext
- `decrypt()` — Decrypt ciphertext to plaintext
- Type utilities for working with encrypted data

**Used by:**
- Web app (frontend + backend)
- CLI (encryption/decryption)

### `@repo/eslint-config`

Shared ESLint configuration files:
- `base.js` — Core ESLint rules
- `next.js` — Next.js-specific rules
- `react-internal.js` — React rules for internal use

### `@repo/typescript-config`

Shared TypeScript configuration files:
- `base.json` — Base tsconfig
- `nextjs.json` — Next.js specific
- `react-library.json` — React library specific

---

## 🔄 Webhook Flow

1. User creates a secret with a webhook URL
2. Webhook URL stored in Redis with secret metadata
3. When secret is viewed:
   - Secret marked as "delivered"
   - QStash queues webhook task
4. QStash triggers `/api/webhooks/deliver`:
   - Makes HTTP POST to webhook URL
   - Sends: `{ token, viewedAt, viewerIp }`
   - Timeout: 5 seconds
5. Webhook status stored: `pending` → `enqueued` → `delivered|failed`

**Webhook retry logic:**
- Handled by QStash (configurable)
- Failed webhooks can be retried manually

---

## 🧪 Testing

### Type Checking
```bash
bun run check-types   # All apps
cd apps/web && bun run check-types
```

### Linting
```bash
bun run lint         # All apps with no warnings
cd apps/web && bun run lint
```

### Manual Testing
- Access web app: http://localhost:3000
- CLI: `cd apps/cli && bun run dev`
- Prisma Studio: `cd apps/web && bun prisma studio`

---

## 🚀 Deployment

### Environment Setup

**For production:**
- Use strong `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
- Set `NEXTAUTH_URL` to your production domain
- Configure GitHub OAuth for your domain
- Use Upstash Redis and QStash for prod instances
- Enable HTTPS only

### Building for Production

```bash
# Build all apps
bun run build

# Build web app specifically
cd apps/web && bun run build

# Preview production build
cd apps/web && bun run start
```

### Deployment Platforms

**Supported:**
- Vercel (Next.js optimized)
- Docker (containerization-ready)
- Self-hosted (Node.js ≥18)

**Example Vercel deployment:**
```bash
vercel deploy
```

---

## 📚 Environment Variables Reference

| Variable | Used By | Required | Purpose |
|----------|---------|----------|---------|
| `DATABASE_URL` | Web | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | Web | ✅ | NextAuth callback URL |
| `NEXTAUTH_SECRET` | Web | ✅ | NextAuth session secret |
| `GITHUB_ID` | Web | ❌ | GitHub OAuth app ID |
| `GITHUB_SECRET` | Web | ❌ | GitHub OAuth app secret |
| `UPSTASH_REDIS_REST_URL` | Web | ❌ | Redis URL for TTL/caching |
| `UPSTASH_REDIS_REST_TOKEN` | Web | ❌ | Redis auth token |
| `QSTASH_TOKEN` | Web | ❌ | QStash API token |
| `QSTASH_CURRENT_SIGNING_KEY` | Web | ❌ | QStash signing key |
| `QSTASH_NEXT_SIGNING_KEY` | Web | ❌ | QStash next signing key |
| `SECRETTUNNEL_API_URL` | CLI | ❌ | Web API URL (default: localhost:3000) |
| `API_URL` | CLI | ❌ | Fallback API URL |
| `NODE_ENV` | Both | ❌ | Environment (dev/production) |

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -am "Add feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Open a Pull Request

### Code Quality

- Run type checking: `bun run check-types`
- Run linting: `bun run lint`
- Format code: `bun run format`
- All checks must pass before merging

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — React framework
- [Prisma](https://www.prisma.io/) — Database ORM
- [shadcn/ui](https://ui.shadcn.com/) — Component library
- [Turborepo](https://turborepo.dev/) — Monorepo management
- [Upstash](https://upstash.com/) — Serverless Redis & QStash
- [NextAuth.js](https://next-auth.js.org/) — Authentication

---

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Last updated:** April 2026 | **Node.js:** ≥18 | **Package Manager:** Bun ≥1.2.23

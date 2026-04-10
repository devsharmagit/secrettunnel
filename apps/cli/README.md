# SecretTunnel CLI

CLI for creating and reading one-time encrypted secrets.

## Setup

Install dependencies from the monorepo root:

```bash
bun install
```

Run commands from this folder:

```bash
cd apps/cli
```

The CLI talks to the web API at:

```txt
http://localhost:3000/api/secrets
```

You can override this with environment variables:

```txt
SECRETTUNNEL_API_URL=http://localhost:3000
```

Fallback behavior:

1. `SECRETTUNNEL_API_URL` (preferred)
2. `API_URL`
3. `NODE_ENV=production` -> `https://secrettunnel.vercel.app/api/secrets`
4. Otherwise -> `http://localhost:3000/api/secrets`

Make sure the web app is running before using CLI commands.

## Command Summary

```bash
bun src/index.ts push <content> [--ttl <duration>] [--file <path>] [--password <value>] [--webhook <url>]
bun src/index.ts pull <share-url> [--password <value>] [--output <path|->]
bun src/index.ts pull <token> --key <base64Key> [--password <value>] [--output <path|->]
```

`--ttl` accepts either:

1. Raw seconds (example: `3600`)
2. Human-readable values using `s|m|h|d` (examples: `30m`, `1h`, `7d`)

Default TTL is `24h`.

Important: Command is required. Running bun src/index.ts "message" will fail. Use push or pull explicitly.

## Push Command

Create a secret and print a share URL.

### Push with direct content

```bash
bun src/index.ts push "my secret message"
```

If you press Enter at the password prompt, the secret is created without password protection.

### Push with file content

```bash
bun src/index.ts push --file .env
```

### Push with custom TTL

```bash
bun src/index.ts push "temporary secret" --ttl 1h
```

### Push with explicit password

```bash
bun src/index.ts push "top secret" --password mypass123
```

### Push with webhook callback

```bash
bun src/index.ts push --file .env --ttl 24h --webhook https://api.clientapp.com/secret/sharing
```

On success, CLI prints:

1. Tokenized URL path (`/s/<token>`)
2. Decryption key in hash fragment (`#key=...`)

Example:

```txt
http://localhost:3000/s/abc123#key=base64EncodedKey
```

## Pull Command

Read and decrypt a secret.

### Pull using full share URL

```bash
bun src/index.ts pull "http://localhost:3000/s/abc123#key=base64EncodedKey"
```

The CLI extracts both:

1. `token` from path
2. `key` from URL hash

### Pull using token + key

```bash
bun src/index.ts pull abc123 --key "base64EncodedKey"
```

### Pull password-protected secret

If the secret is password-protected, CLI prompts:

```txt
Enter secret password:
```

You can also provide it directly:

```bash
bun src/index.ts pull "http://localhost:3000/s/abc123#key=base64EncodedKey" --password mypass123
```

### Pull secret directly to file

```bash
bun src/index.ts pull "http://localhost:3000/s/abc123#key=base64EncodedKey" --output .env
```

If the output file already exists, CLI asks for confirmation before overwriting it.

### Explicit stdout output

Use `--output -` to force plaintext output to stdout.

```bash
bun src/index.ts pull "http://localhost:3000/s/abc123#key=base64EncodedKey" --output -
```

## Behavior Notes

1. Secrets are one-time read (burn after read).
2. After a successful pull, running pull again with the same token returns not found.
3. `pull` requires both token and key (either inside URL or key passed with `--key`).

## Common Errors

### Missing key

```txt
Missing key. Provide a full URL containing #key=... or pass --key <base64Key>
```

### Secret already viewed or expired

```txt
Secret not found. It may have expired or already been viewed.
```

### Wrong password or corrupted key

```txt
Failed to decrypt secret. Incorrect password or corrupted key.
```

### Invalid flags

Examples:

```txt
Missing value for --ttl
Unknown option for pull command: --ttl
```

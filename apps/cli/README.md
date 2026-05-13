# SecretTunnel CLI (`secrettnl`)

A secure, terminal-based tool for generating and retrieving one-time, end-to-end encrypted secrets. The CLI interfaces seamlessly with the SecretTunnel web system, ensuring your sensitive data is safely encrypted locally before it ever leaves your machine.

---

## 🛠️ Usage

### 1. Push a Secret
Encrypt data locally and push it to the server. You receive a unique, one-time link.

**Command Signature:**
```bash
secrettnl push <content> [--ttl <duration>] [--file <path>] [--password <value>] [--webhook <url>]
```

**Examples:**

* **Push inline text:**
  ```bash
  secrettnl push "my super secret message"
  ```
  *(Press `Enter` when prompted for a password if you want an unprotected secret).*

* **Push from a file:**
  ```bash
  secrettnl push --file .env.production
  ```

* **Push with a custom TTL (Time-to-Live):**
  Supported formats: seconds (`3600`) or duration strings (`30m`, `1h`, `7d`). Default is `24h`.
  ```bash
  secrettnl push "temporary secret" --ttl 1h
  ```

* **Push with an explicit password:**
  ```bash
  secrettnl push "top secret" --password mypass123
  ```

* **Push with a webhook notification:**
  Get notified when your secret gets viewed:
  ```bash
  secrettnl push "notifiable secret" --webhook https://api.my-app.com/webhooks/secret-viewed
  ```

**Success Output:**
Produces a token URL containing the decryption key within the hash fragment (ensuring the server never sees the key):
```txt
http://localhost:3000/s/abc12345#key=base64EncodedKey...
```

---

### 2. Pull a Secret
Retrieve and decrypt a one-time secret. **Warning: This destroys the secret on the server.**

**Command Signature:**
```bash
secrettnl pull <share-url | token> [--key <base64Key>] [--password <value>] [--output <path|->]
```

**Examples:**

* **Pull using the full URL (Recommended):**
  ```bash
  secrettnl pull "http://localhost:3000/s/abc12345#key=base64EncodedKey..."
  ```
  *(The CLI automatically extracts the `token` and the `key` from the URL fragment).*

* **Pull using an explicit Token and Key:**
  ```bash
  secrettnl pull abc12345 --key "base64EncodedKey..."
  ```

* **Pull and save directly to a file:**
  ```bash
  secrettnl pull "http://localhost:3000/s/abc12345#key=..." --output my-decrypted-config.env
  ```
  *(If the file exists, the CLI will safely prompt for confirmation before overwriting).*

* **Stream plaintext directly to standard output (Stdout):**
  Useful for piping or scripting.
  ```bash
  secrettnl pull "http://localhost:3000/s/abc12345#key=..." --output - > secure-data.txt
  ```

---

## ⚙️ Configuration

The CLI communicates with the SecretTunnel web API. By default, it targets `http://localhost:3000/api/secrets`. 

You can override the API destination using environment variables:

```bash
export SECRETTUNNEL_API_URL="https://your-production-url.com"
```

**Resolution Priority:**
1. `SECRETTUNNEL_API_URL` (Highest priority)
2. `API_URL`
3. If `NODE_ENV=production` -> `https://secrettunnel.vercel.app/api/secrets`
4. Default -> `http://localhost:3000/api/secrets`

---

## 📓 Core Behaviors & Specifications

- **Burn After Reading:** Secrets are permanently destroyed once successfully retrieved. Running `pull` a second time will fail.
- **Client-Side Encryption:** The server stores an encrypted `ciphertext` and `iv`. It never receives your encryption key. The key travels strictly via the URL hash segment, preventing server/infrastructure interception.
- **Strict Decryption:** The pull command fundamentally requires both the `token` and the decryption `key`. Without the exact key, recovery is mathematically impossible.

---

## ⚠️ Troubleshooting & Common Errors

* **`Missing key.`**  
  You likely passed a URL without the `#key=...` hash, or forgot the `--key` flag.

* **`Secret not found.`**  
  The secret was already accessed by someone else, or its Time-to-Live (TTL) has expired.

* **`Failed to decrypt secret` / `Incorrect password or corrupted key.`**  
  The decryption math failed. You either provided the wrong manual password or part of the `key` hash was truncated during copy/paste.

* **`Unknown option...`**  
  Check your flags (e.g., passing `--ttl` to `pull`). Flags are strictly validated for their specific commands.

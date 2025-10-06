# Codex CLI Agent — Dockerize Single Webapp + Caddy Reverse Proxy

> **Purpose:**  
> Automate Docker + Caddy setup for **one full-stack webapp** (frontend + backend) located at project root.  
> The agent generates `.env`, `docker-compose.yml`, and `Caddyfile` — safely, without overwriting source code.

---

## 🧠 Capabilities

- Detect or create `.env`, `docker-compose.yml`, `Caddyfile` at project root.
- Build using your existing `frontend/` and `backend/` directories.
- Map ports internally (no public backend exposure).
- Use **Caddy** as HTTPS reverse proxy and certificate manager (Let’s Encrypt).
- Non-destructive (creates `.bak` backups on conflicts).
- Validate via `docker compose config -q`.

---

## ⚙️ Questions to Ask User

| Key | Description | Default |
|-----|--------------|----------|
| `APP_DOMAIN` | Full domain for your webapp | `app.example.com` |
| `API_PORT` | Internal backend port (inside container) | `4000` |
| `ACME_EMAIL` | Email for Let’s Encrypt notifications | `admin@example.com` |
| `NODE_ENV` | Runtime environment | `production` |

---

## 🏗️ Target Folder Layout
```
/srv/app
├─ .env
├─ docker-compose.yml
├─ Caddyfile
├─ caddy_data/
├─ caddy_config/
├─ frontend/
│  ├─ Dockerfile
│  └─ (your React/Vite code)
└─ backend/
   ├─ Dockerfile
   └─ (your Node/Express code)
```

---

## 🪄 Templates to Generate

### 1. `.env`
```dotenv
APP_DOMAIN=app.example.com
API_PORT=4000
ACME_EMAIL=admin@example.com
NODE_ENV=production
```

---

### 2. `docker-compose.yml`
```yaml
version: "3.9"

x-common-node-env: &common-node-env
  NODE_ENV: ${NODE_ENV:-production}

services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      APP_DOMAIN: ${APP_DOMAIN}
      ACME_EMAIL: ${ACME_EMAIL}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy_data:/data
      - ./caddy_config:/config
    depends_on:
      - web-frontend
      - web-backend

  web-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: web-frontend:latest
    restart: unless-stopped

  web-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    image: web-backend:latest
    restart: unless-stopped
    environment:
      <<: *common-node-env
      PORT: ${API_PORT}
    expose:
      - "${API_PORT}"
```

---

### 3. `Caddyfile`
```caddyfile
{
  email {$ACME_EMAIL}
  # debug
}

{$APP_DOMAIN} {
  encode gzip zstd

  @api path /api/*
  handle @api {
    uri strip_prefix /api
    reverse_proxy web-backend:{$API_PORT}
  }

  handle {
    reverse_proxy web-frontend:80
  }
}
```

---

## 🚀 Usage Guide (README Auto-Insert)

```bash
# On Ubuntu droplet:
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker

# Prepare structure
mkdir -p caddy_data caddy_config
nano .env

# Build & run
docker compose up -d --build

# Check
docker compose ps
docker compose logs -f caddy
curl -I https://$APP_DOMAIN
curl https://$APP_DOMAIN/api/health || true
```

---

## 🧩 Validation Checklist
- ✅ `docker compose config -q` passes.
- ✅ `curl -I https://APP_DOMAIN` returns 200.
- ✅ Caddy logs show successful certificate issuance.
- ✅ Visiting `https://APP_DOMAIN` serves frontend.
- ✅ Visiting `https://APP_DOMAIN/api/health` serves backend.

---

## ♻️ Idempotency Rules
- If file exists → rename as `.bak` before overwrite.
- Preserve original code under `/frontend` and `/backend`.
- Safe re-runs update infra only, not app source.

---

## 🧰 CLI Agent Flow

1. Ask configuration inputs.  
2. Show a **preview** (list of files + diffs).  
3. On user confirmation:
   - Write `.env`, `docker-compose.yml`, and `Caddyfile`.  
   - Run syntax validation (`docker compose config -q`).  
   - Print post-install commands.  
4. If any error occurs, roll back to `.bak` files.

---

## ✅ Success Criteria
- `https://APP_DOMAIN` serves your webapp via HTTPS.
- `https://APP_DOMAIN/api/health` responds from backend.
- Caddy auto-renews certificates every 90 days.

---

**Filename suggestion:**  
`docker_single_webapp.agent.md`

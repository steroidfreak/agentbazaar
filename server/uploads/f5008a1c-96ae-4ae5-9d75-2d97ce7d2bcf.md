# Codex CLI Agent — Dockerize Two Apps + Caddy Multi‑Domain

> **Purpose**: Provision Docker/Compose + Caddy reverse proxy for **two separate webapps** (each with its own frontend & backend) on **one Linux droplet**. The agent creates all infra files (Dockerfiles, Compose, Caddyfile, `.env`), a structured folder skeleton, and a **step‑by‑step README**. It will **not modify your existing app code** unless missing essentials (e.g., `server.js`) are required for a minimal boot.

---

## High‑level Tasks
1. **Interview** user for config (domains, ports, email, project name).
2. **Generate folder layout** (non‑destructive if already exists).
3. **Create infra files**: `.env`, `docker-compose.yml`, `Caddyfile`, Dockerfiles for 2× frontends + 2× backends, optional `.dockerignore`s, optional `nginx.conf` for SPA fallback.
4. **(Optional)** generate minimal Node/Express backend and Vite frontend placeholders **only if** missing.
5. **Create a README** with copy‑paste commands for Ubuntu droplet and local dev.
6. **Validate**: syntax checks (`docker compose config -q`), port bindings, Caddy cert preflight (DNS A records), health checks.
7. **Idempotency**: re‑runs should update files safely; backup conflicting files as `*.bak`.

---

## Inputs to Ask
Ask these, then confirm a summary before proceeding:
- **APP1**
  - Domain (e.g., `app1.example.com`)
  - Backend port **inside container** (default `4000`)
  - Frontend build command (default `npm run build`), dev is not used in prod
- **APP2**
  - Domain (e.g., `app2.example.com`)
  - Backend port **inside container** (default `5000`)
- **ACME email** for Let’s Encrypt notifications
- **Project root** on droplet (default `/srv/apps`)
- Should we **create minimal placeholder apps** if missing? (yes/no, default **no**)

> Use defaults if user declines to answer. Persist answers in `.env`.

---

## Target Folder Structure
```
/srv/apps
├─ .env
├─ docker-compose.yml
├─ Caddyfile
├─ caddy_data/        # persist ACME certs
├─ caddy_config/      # persist Caddy runtime config
├─ app1/
│  ├─ frontend/
│  │  ├─ Dockerfile
│  │  ├─ .dockerignore
│  │  └─ (existing app code or placeholder Vite app)
│  └─ backend/
│     ├─ Dockerfile
│     ├─ .dockerignore
│     └─ (existing app code or placeholder Express app)
└─ app2/
   ├─ frontend/
   │  ├─ Dockerfile
   │  ├─ .dockerignore
   │  └─ (existing app code or placeholder Vite app)
   └─ backend/
      ├─ Dockerfile
      ├─ .dockerignore
      └─ (existing app code or placeholder Express app)
```

---

## Files to Create / Update

### 1) `.env`
```dotenv
# ===== Domains =====
APP1_DOMAIN=app1.example.com
APP2_DOMAIN=app2.example.com

# ===== Backend internal ports (the app listens on these) =====
APP1_API_PORT=4000
APP2_API_PORT=5000

# ===== ACME (Let's Encrypt) =====
ACME_EMAIL=admin@example.com

# ===== Optional runtime hints =====
NODE_ENV=production
```

### 2) `docker-compose.yml`
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
      APP1_DOMAIN: ${APP1_DOMAIN}
      APP2_DOMAIN: ${APP2_DOMAIN}
      ACME_EMAIL: ${ACME_EMAIL}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy_data:/data
      - ./caddy_config:/config
    depends_on:
      - app1-frontend
      - app1-backend
      - app2-frontend
      - app2-backend

  # -------------------- APP 1 --------------------
  app1-frontend:
    build:
      context: ./app1/frontend
      dockerfile: Dockerfile
    image: app1-frontend:latest
    restart: unless-stopped

  app1-backend:
    build:
      context: ./app1/backend
      dockerfile: Dockerfile
    image: app1-backend:latest
    restart: unless-stopped
    environment:
      <<: *common-node-env
      PORT: ${APP1_API_PORT}
    expose:
      - "${APP1_API_PORT}"

  # -------------------- APP 2 --------------------
  app2-frontend:
    build:
      context: ./app2/frontend
      dockerfile: Dockerfile
    image: app2-frontend:latest
    restart: unless-stopped

  app2-backend:
    build:
      context: ./app2/backend
      dockerfile: Dockerfile
    image: app2-backend:latest
    restart: unless-stopped
    environment:
      <<: *common-node-env
      PORT: ${APP2_API_PORT}
    expose:
      - "${APP2_API_PORT}"

# networks:
#   default: { name: apps_net }
```

### 3) `Caddyfile`
```caddyfile
{
  email {$ACME_EMAIL}
  # debug
}

# --------------- APP 1 ---------------
{$APP1_DOMAIN} {
  encode gzip zstd
  @api path /api/*
  handle @api {
    uri strip_prefix /api
    reverse_proxy app1-backend:{$APP1_API_PORT}
  }
  handle {
    reverse_proxy app1-frontend:80
  }
}

# --------------- APP 2 ---------------
{$APP2_DOMAIN} {
  encode gzip zstd
  @api path /api/*
  handle @api {
    uri strip_prefix /api
    reverse_proxy app2-backend:{$APP2_API_PORT}
  }
  handle {
    reverse_proxy app2-frontend:80
  }
}
```

### 4) Frontend Dockerfile template (Vite/React → Nginx)
`appX/frontend/Dockerfile`
```dockerfile
# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# --- serve stage ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Optional SPA fallback:
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

`appX/frontend/.dockerignore`
```
node_modules
npm-debug.log
.git
.DS_Store
.vscode
coverage
build
/dist
```

Optional `appX/frontend/nginx.conf` (SPA fallback):
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  location / {
    try_files $uri /index.html;
  }
}
```

### 5) Backend Dockerfile template (Node/Express)
`appX/backend/Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY . .
ENV NODE_ENV=production
# must respect PORT from env
EXPOSE 4000
CMD ["node", "server.js"]
```

`appX/backend/.dockerignore`
```
node_modules
npm-debug.log
.git
.DS_Store
.vscode
coverage
```

### 6) Minimal placeholder backend (only if missing)
`appX/backend/server.js`
```js
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.send('AppX API alive'));

const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => console.log(`API listening on ${port}`));
```

`appX/backend/package.json`
```json
{
  "name": "appx-backend",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2"
  }
}
```

### 7) Minimal placeholder frontend (only if missing)
> Use `npm create vite@latest` for real apps; here’s a trivial static page fallback.

`appX/frontend/package.json`
```json
{
  "name": "appx-frontend",
  "private": true,
  "scripts": {
    "build": "mkdir -p dist && node build.js"
  },
  "dependencies": {}
}
```

`appX/frontend/build.js`
```js
import { mkdirSync, writeFileSync } from 'fs';
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>AppX</title></head><body><h1>AppX Frontend</h1></body></html>`);
console.log('Built minimal static index.html');
```

---

## README.md (to generate at project root)

Create `README.md` with the following content:

```markdown
# Two Apps on One Droplet with Docker Compose + Caddy

This stack serves **two separate webapps** (each with a frontend & backend) on the **same server**, using **Caddy** for HTTPS and virtual hosts.

## 1) Prerequisites (Ubuntu)
```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# re-login to apply docker group
```

## 2) DNS
Point these **A records** to your droplet IP **before** first start:
- `APP1_DOMAIN` → <your droplet IP>
- `APP2_DOMAIN` → <your droplet IP>

## 3) Configure
Copy `.env` and set values:
```bash
cd /srv/apps
nano .env
# APP1_DOMAIN, APP2_DOMAIN, ACME_EMAIL, ports...
```

## 4) Build & Run
```bash
docker compose up -d --build
```
First run may take a while as images build and Caddy obtains TLS certificates.

## 5) Verify
```bash
docker compose ps
docker compose logs -f caddy
curl -I https://$APP1_DOMAIN
curl -I https://$APP2_DOMAIN
curl https://$APP1_DOMAIN/api/health || true
```

## 6) Deploy Updates
```bash
docker compose up -d --build
```

## 7) Troubleshooting
- **Certs fail**: ensure ports 80/443 open and DNS A records correct.
- **404 on deep links**: enable SPA fallback (`nginx.conf`).
- **Backend unreachable**: confirm backend listens on `0.0.0.0:$PORT`.

## 8) Optional Databases
Add Mongo/Postgres services in `docker-compose.yml` and link only to the relevant backend.
```

---

## Validation & Safety Checks
- Run `docker compose config -q` to check YAML.
- Confirm no other service binds `:80` or `:443`.
- After first boot, `docker compose logs -f caddy` must show certificate issuance success.
- `curl http://localhost` on the droplet should redirect to HTTPS for the requested Host header.

---

## Idempotency & Backups
- When overwriting existing infra files, first create `*.bak` next to originals.
- Never delete application source code.

---

## Execution Notes for Codex CLI
- **Plan → Confirm → Apply**: present a plan (files to write, paths, diffs), wait for user confirmation, then write.
- Use the **templates above**. Replace `appX` with `app1` / `app2` and inject environment variables.
- Avoid hardcoding domains—use `.env` values and Caddy placeholders `{$VAR}`.
- After apply, print a **post‑install checklist** and the key commands block from README.

---

## Post‑Create Commands (print to user)
```bash
# On the droplet
cd /srv/apps
cp .env .env.backup-$(date +%F)
# Edit .env to set domains & ACME email
nano .env
# Build & run
docker compose up -d --build
# Tail Caddy
docker compose logs -f caddy
```

---

## Success Criteria
- Visiting `https://APP1_DOMAIN` serves app1 frontend; `https://APP1_DOMAIN/api/health` hits app1 backend.
- Visiting `https://APP2_DOMAIN` serves app2 frontend; `https://APP2_DOMAIN/api/health` hits app2 backend.
- Both sites have valid HTTPS certificates from Let’s Encrypt.


# AgentBazaar Platform

A full-stack platform for uploading, sharing, rating, and copying `agent.md` files. The stack pairs a React (Vite) frontend with an Express/MongoDB backend and adds community features plus monetization slots.

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB 6+ (Atlas or local instance)
- (Optional) Google AdSense / affiliate snippets for monetization slots

## Backend setup (`server/`)
1. Copy `.env.example` to `.env` and set values:
   - `MONGODB_URI` - connection string
   - `JWT_SECRET` - strong random string
   - `YOUTUBE_VIDEO_IDS` - comma-separated list of video IDs for the weekly spotlight
   - `OPENAI_API_KEY` - secret key used to contact OpenAI for metadata generation
   - `METADATA_MODEL` - (optional) model name for metadata generation, defaults to `gpt-4o-mini`
   - `METADATA_TEMPERATURE` - (optional) sampling temperature, defaults to `0.1`
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Start the API:
   ```bash
   npm run dev
   ```
   The API listens on `http://localhost:5000` by default.
   Uploads automatically call the metadata helper (see `OpenAIAgent.md`) whenever `OPENAI_API_KEY` is configured, deriving titles, descriptions, and tags from the uploaded markdown content.

## Frontend setup (`client/`)
1. Install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Launch the dev server:
   ```bash
   npm run dev
   ```
   Vite serves the app on `http://localhost:5173` and proxies API calls to the backend.

## Running the stack locally
- Start MongoDB (if running locally) before the backend.
- Run the backend and frontend in separate terminals as shown above.
- Register a user through the UI (registration can be disabled by setting `ALLOW_REGISTRATION=false` in the API `.env`).

## Building for production
- Backend: `npm run start` (after building your client). Deploy to Render, Railway, Fly.io, etc. Ensure the `uploads/` directory is writable or swap to object storage.
- Frontend: `npm run build` inside `client/`. Deploy the generated `dist/` folder to Netlify, Vercel, Cloudflare Pages, etc. Configure `VITE_API_URL` at build time to point to your deployed API.

## Docker deployment (single host)
The repository ships with a Docker + Caddy stack wired for `www.agentbazaar.net`. Update the values in the root `.env` to match your domain and contact email before building.

### 1. Prepare secrets and volumes
- Copy `server/.env.example` to `server/.env` and populate the production values (MongoDB URI, JWT secret, OpenAI key, etc.). The file stays out of version control but is read by the backend container.
- Review `.env` at the project root and set `ACME_EMAIL` to an inbox you monitor; Let's Encrypt uses it for renewal notices.
- Ensure the host keeps `server/uploads/` (user content) plus `caddy_data/` and `caddy_config/` (TLS assets) on durable storage. Bind mounts are already defined via `docker-compose.yml`.

### 2. Provision a DigitalOcean droplet
```bash
# Ubuntu 22.04 LTS example
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker

# Clone or copy the repository, then inside /srv/agentbazaar (or similar):
mkdir -p caddy_data caddy_config
cp server/.env.example server/.env  # edit this file with real secrets
nano .env                            # confirm domain + ACME email

# Build and start the stack
docker compose up -d --build
```

### 3. Post-deploy checks
- `docker compose ps` should show `caddy`, `web-frontend`, and `web-backend` healthy.
- Tail logs for the proxy and API: `docker compose logs -f caddy` and `docker compose logs -f web-backend`.
- Verify HTTPS once DNS points at the droplet: `curl -I https://www.agentbazaar.net`.
- Confirm the health endpoint: `curl https://www.agentbazaar.net/health` (or `/api/...` routes).
- Uploaded markdown files persist under `server/uploads/` on the host; back them up or repoint to object storage for long-term retention.

## Deployment notes
- Use HTTPS and secure cookies (configure reverse proxy) in production.
- Set CORS origin to your frontend domain in `src/app.js` if you need stricter rules.
- Configure Google AdSense or affiliate embed codes inside the `<AdSlot />` component.
- For scheduled "agent of the week" rotations, run the API continuously; it caches and refreshes based on `FEATURED_REFRESH_HOURS`.
- Consider using MongoDB Atlas and a managed object store (S3/GCS) for uploaded files in production environments.

## Optional enhancements
- Add email verification before allowing uploads.
- Hook the copy/download analytics into a dashboard provider for richer charts.
- Replace in-memory featured caching with Redis if you scale to multiple API instances.

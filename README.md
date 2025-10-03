# AgentBazaar Platform

A full-stack platform for uploading, sharing, rating, and copying `agent.md` files. The stack pairs a React (Vite) frontend with an Express/MongoDB backend and adds community features plus monetization slots.

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB 6+ (Atlas or local instance)
- (Optional) Google AdSense / affiliate snippets for monetization slots

## Backend setup (`server/`)
1. Copy `.env.example` to `.env` and set values:
   - `MONGODB_URI` – connection string
   - `JWT_SECRET` – strong random string
   - `YOUTUBE_VIDEO_IDS` – comma-separated list of video IDs for the weekly spotlight
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

## Deployment notes
- Use HTTPS and secure cookies (configure reverse proxy) in production.
- Set CORS origin to your frontend domain in `src/app.js` if you need stricter rules.
- Configure Google AdSense or affiliate embed codes inside the `<AdSlot />` component.
- For scheduled “agent of the week” rotations, run the API continuously; it caches and refreshes based on `FEATURED_REFRESH_HOURS`.
- Consider using MongoDB Atlas and a managed object store (S3/GCS) for uploaded files in production environments.

## Optional enhancements
- Add email verification before allowing uploads.
- Hook the copy/download analytics into a dashboard provider for richer charts.
- Replace in-memory featured caching with Redis if you scale to multiple API instances.
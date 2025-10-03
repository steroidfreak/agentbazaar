# Modular Chatbot Agent

This document explains how to stand up the modular chatbot agent contained in this repo and how to reproduce it inside another web application.

## 1. Features at a Glance
- Node/Express HTTP API (`src/server.js`) with JSON or Server-Sent Events responses.
- Session-scoped conversation memory (`src/memory/sessionMemory.js`).
- Tool-driven agent built with the **@openai/agents** SDK (`src/agent.js`).
- Pluggable knowledge sources: local file search or OpenAI Vector Store search.
- Optional file upload endpoint that indexes text content for retrieval-augmented answers.

## 2. Prerequisites
- Node.js 18+ and npm.
- An OpenAI API key with access to the model you plan to use.
- (Optional) An existing OpenAI Vector Store if you want remote file search.

## 3. Install Dependencies
```bash
npm install
```

## 4. Environment Variables
Copy `src/.env` to a new `.env` in the project root (never commit secrets) and adjust values:

```bash
OPENAI_API_KEY=sk-your-key
PORT=4000
MODEL=gpt-4o-mini          # or gpt-5 if you have access
EMBEDDING_MODEL=text-embedding-3-small
USE_OPENAI_FILE_TOOL=false # true switches to OpenAI Vector Store search
VECTOR_STORE_ID=vs_...     # required only when USE_OPENAI_FILE_TOOL=true
```

Key switches:
- `USE_OPENAI_FILE_TOOL=false` loads `local_file_search`, which embeds uploaded files on the fly.
- `USE_OPENAI_FILE_TOOL=true` replaces it with the OpenAI file search tool. Make sure the vector store already contains your documents.

## 5. Run the API
- Development (auto-reload): `npm run dev`
- Production: `npm start`

Express starts on `PORT` (default 4000). A basic health check is available at `GET /health`.

## 6. HTTP Endpoints
- `POST /chat` – body `{ "sessionId": "abc", "text": "Hello" }`. Returns `{ text, history }` once the agent finishes.
- `GET /chat/stream` – query params `sessionId` & `text`. Emits SSE events (`type: delta`, `type: done`, `type: error`).
- `POST /upload` – multipart field `file`. Stores the file under `uploads/` and indexes it for retrieval (local mode only).
- `GET /health` – basic status payload with currently configured model.

## 7. Agent & Tools
`src/agent.js` wires the agent:
- Core tools: `time_now` (current timestamp) and `get_weather` (stub; replace with a real API if needed).
- File tools: `local_file_search` or `openai_file_search`, controlled by `USE_OPENAI_FILE_TOOL`.
- Agent settings: low reasoning effort, low verbosity, and concise instructions. Adjust `instructions`, `model`, or `tools` to match your use case.

To add new capabilities, create a tool file under `src/tools/` that exports `tool({...})`, then include it in the `tools` array in `src/agent.js`.

## 8. Local File Retrieval Flow
- Upload files through `POST /upload`.
- `indexLocalFile` (in `src/tools/filesLocal.js`) extracts text, chunks it, and embeds each chunk with `embedTexts`.
- Queries invoke cosine similarity against cached embeddings and return top-k snippets.

For binary files or formats like PDF, extend `extractText` to use a proper parser before chunking.

## 9. Using OpenAI Vector Stores Instead
- Populate a vector store up-front (outside this service).
- Set `USE_OPENAI_FILE_TOOL=true` and supply `VECTOR_STORE_ID`.
- The agent will call the Responses API with the `file_search` tool to pull relevant excerpts.

## 10. Session Memory
- `sessionId` ties a request to a conversation history stored in-memory.
- Replace `src/memory/sessionMemory.js` with Redis, Postgres, or another shared store for production or multi-instance deployments.

## 11. Integrating into Another Web App
1. Drop the `src/` folder (or the parts you need) into your project.
2. Re-create the `agent.js`, `server.js`, and router files, preserving module paths or updating imports.
3. Mount the chat and upload routers on your existing Express app (or adapt to your framework’s routing).
4. Forward user messages from your UI to `POST /chat` or `GET /chat/stream` and display the returned text/stream chunks.
5. If you already have file storage, call `indexLocalFile` yourself after storing the file to keep the embeddings in sync.
6. Ensure your deployment platform provides the required env vars (`OPENAI_API_KEY`, `MODEL`, etc.).

If you only need the agent logic (no HTTP wrapper), you can import `agent` directly and call `run(agent, thread)` within your own request pipeline.

## 12. Utilities & Scripts
- `src/utils/chunker.js` – naive fixed-size text chunking.
- `src/utils/embeddings.js` – wraps the OpenAI embeddings API and cos-sim helper.
- `node src/scripts/list-models.js` – quick script to print available GPT/O series models under your key.

## 13. Deployment Notes
- Persist `uploads/` or use cloud storage if you rely on local file search.
- Treat `.env` secrets carefully (use platform-specific secret managers).
- When running multiple instances, externalize session storage and file embeddings.
- Add logging/observability around the `run()` call for production monitoring.

## 14. Next Customizations
- Swap the weather stub for a real weather API call.
- Add authentication middleware before the chat/upload routes.
- Implement rate limiting to protect your API key usage.
- Extend toolset with domain-specific APIs or databases.

With these steps you can reproduce the same chatbot agent in another web app, keep its modular tool architecture, and extend it as your product evolves.

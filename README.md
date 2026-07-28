# The Prompt Library

A full-stack AI Prompt Library — create, organize, search, and manage reusable AI prompts,
with a distinct "library card catalog" visual identity instead of the usual dashboard template.

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 (frontend) · Express + MongoDB/Mongoose (backend)

---

## Why this stands out

- **Works online *and* offline, transparently.** On load, the app pings the backend. If it's
  reachable, every action (create/update/delete/reorder) is persisted to MongoDB through the
  REST API. If the backend is down or not deployed yet, the app falls back to LocalStorage
  automatically — no broken UI, no error wall, just a small "Local mode" pill in the navbar
  instead of "Synced." This means the frontend is fully demoable on its own, and the full
  stack story is demoable when both are running.
- **A real design point of view.** Prompt cards are styled as library index cards (punch hole,
  folded corner for pinned items, dashed catalog rule), categories are rendered as card-catalog
  guide tabs, and the type system pairs a display serif (Fraunces) with Inter and IBM Plex Mono
  — not the default cream-and-terracotta AI look.
- **Optimistic UI everywhere.** Favoriting, pinning, and editing update instantly in the UI and
  sync to the server in the background; drag-and-drop reordering feels instant and persists via
  a single bulk PATCH call instead of one request per card.
- **Debounced search, memoized derived state, and a single reducer** driving all prompt state,
  so the codebase stays predictable as features grow.
- **Keyboard shortcuts**: press `/` to jump to search, `n` for a new prompt, `Esc` to close any
  modal or blur the search field.

---

## Project structure

```
ai-prompt-library/
├── frontend/          React + TypeScript + Vite app
│   └── src/
│       ├── api/           API client (fetch wrapper + health check)
│       ├── components/    Sidebar, Navbar, Dashboard, PromptCard, modals, toasts...
│       ├── context/        ThemeContext, ToastContext, PromptContext (state + sync)
│       ├── hooks/          useDebounce, useClipboard, useKeyboardShortcuts
│       ├── types/          Shared TypeScript types
│       └── utils/          LocalStorage + category metadata helpers
└── backend/            Express + MongoDB API
    └── src/
        ├── models/         Mongoose Prompt schema
        ├── routes/         CRUD + bulk reorder routes
        ├── middleware/     Centralized error handling
        ├── server.js       App entry point
        └── seed.js         Seeds the DB with sample prompts
```

---

## Feature checklist (matches the assessment brief)

- [x] Dashboard: total prompts, favorites, categories used, most recent
- [x] Create / Edit / Delete (with confirmation) / Duplicate
- [x] Favorite / Unfavorite, Pin to top, Copy to clipboard
- [x] Drag & drop reordering (persisted via bulk reorder endpoint)
- [x] Every field: Title, Prompt, Category, Tags, Description, Created/Updated dates, Favorite status
- [x] Search by title & content (debounced), filter by category, filter favorites only
- [x] Sort: Newest, Oldest, A→Z, Z→A
- [x] Exactly the 10 required categories
- [x] Import / Export as JSON, with validation and graceful handling of bad files
- [x] Dark / Light mode, persisted across reloads
- [x] Context API for state management
- [x] LocalStorage persistence (also used as an offline fallback/cache)
- [x] Full backend CRUD API backed by MongoDB
- [x] Responsive layout (mobile / tablet / desktop), keyboard shortcuts, loading & error states

---

## Running locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set MONGO_URI - either a local MongoDB instance:
#   MONGO_URI=mongodb://127.0.0.1:27017/ai_prompt_library
# or a free MongoDB Atlas cluster connection string.
npm run seed   # optional: populates the DB with 6 sample prompts
npm run dev    # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL defaults to http://localhost:5000/api
npm run dev             # starts the app on http://localhost:5173
```

Open `http://localhost:5173`. If the backend isn't running, the app still works — it just
switches to "Local mode" and everything is stored in your browser's LocalStorage instead.

---

## Deployment

### Database: MongoDB Atlas (free tier)
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow access from anywhere (`0.0.0.0/0`) for simplicity, or the
   specific IPs of your hosting provider.
3. Copy the connection string into `MONGO_URI`.

### Backend: Render / Railway (free tier)
1. Push this repo to GitHub.
2. Create a new Web Service pointing at the `backend/` directory.
3. Build command: `npm install` · Start command: `npm start`.
4. Set environment variables: `MONGO_URI`, `CLIENT_ORIGIN` (your deployed frontend URL),
   and optionally `PORT` (most providers set this automatically).

### Frontend: Vercel / Netlify (free tier)
1. Import the repo, set the project root to `frontend/`.
2. Build command: `npm run build` · Output directory: `dist`.
3. Set the environment variable `VITE_API_URL` to your deployed backend's `/api` URL,
   e.g. `https://your-backend.onrender.com/api`.

Once both are live, share the frontend URL as your live demo link and the GitHub repo as your
source link.

---

## API reference

| Method | Endpoint                     | Description                          |
|--------|-------------------------------|---------------------------------------|
| GET    | `/api/health`                 | Health check + DB connection state    |
| GET    | `/api/prompts`                | List all prompts                      |
| GET    | `/api/prompts/:id`            | Get a single prompt                   |
| POST   | `/api/prompts`                | Create a prompt                       |
| PUT    | `/api/prompts/:id`            | Full update of a prompt               |
| PATCH  | `/api/prompts/:id`            | Partial update (e.g. favorite/pin)    |
| PATCH  | `/api/prompts/reorder/bulk`   | Persist drag-and-drop order            |
| DELETE | `/api/prompts/:id`            | Delete a prompt                       |

---

## Notes for reviewers

- The "offline-first" behavior is intentional, not a fallback bolted on afterward — see
  `frontend/src/context/PromptContext.tsx` for the bootstrap logic that checks backend health
  once, then routes every mutation through either the API or LocalStorage consistently for the
  rest of the session.
- Category colors, codes, and the catalog-tab styling live in `utils/categoryMeta.ts` and
  `index.css`, so the visual system is centralized and easy to re-theme.

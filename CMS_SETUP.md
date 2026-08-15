# Eva Skin Clinic — CMS Integration Notes

## What was added (nothing else was touched)

**Backend (`backend/server.py`, `backend/auth.py`):**
- JWT-based admin login (`POST /api/admin/login`)
- Blog CRUD: `GET/POST /api/admin/blogs`, `GET/PUT/DELETE /api/admin/blogs/{id}` (all require login)
- Image upload: `POST /api/admin/upload` → saves to `backend/uploads/`, served at `/uploads/<file>`
- Public read-only endpoints: `GET /api/blogs`, `GET /api/blogs/{slug}` (published posts only)
- Uses the same MongoDB connection (`MONGO_URL`, `DB_NAME`) already configured — new collection `blogs`.

**Frontend (`frontend/src/admin/*`, `frontend/src/blog/*`, `frontend/src/App.js`):**
- `/admin/login` — admin login page
- `/admin` — dashboard listing all posts (draft + published)
- `/admin/blog/new`, `/admin/blog/edit/:id` — create/edit form with all fields you asked for (title, slug, excerpt, content, category, author, date, featured image, image alt, SEO title, meta description, focus keyword, draft/publish)
- `/insights` and `/insights/:slug` — public blog listing + post pages, reading only published posts

All existing pages (homepage, service pages, and the static files under `frontend/public/blog/*.html`) are **completely untouched**. The public CMS blog was placed at `/insights` instead of `/blog` specifically so it does not collide with your existing static `frontend/public/blog/` folder.

`frontend/public/_redirects` had 3 lines added at the bottom (SPA fallback scoped only to `/admin/*` and `/insights/*`) — nothing existing in that file was changed.

## One-time setup before this works

1. **Set admin credentials** — copy `backend/.env.example` values into your real `backend/.env`, then run:
   ```
   python backend/generate_admin_hash.py
   ```
   and paste the printed `ADMIN_PASSWORD_HASH` line into `backend/.env`. Also set `JWT_SECRET` to a long random string.

2. **Frontend needs to know your backend URL** — in `frontend/.env`, set:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url
   ```
   (whatever URL your FastAPI backend is deployed at).

3. Install nothing new — no new dependencies were added; everything used (`react-router-dom`, `axios`, `pyjwt`, `bcrypt`, `python-multipart`) was already in your `package.json` / `requirements.txt`.

4. Deploy backend + frontend as you already do. Visit `/admin/login` to log in and start creating posts.

---

## FINAL — ready to use, no manual edits needed

`backend/.env` and `frontend/.env` have already been created inside this project with working values (JWT secret + admin password hash generated for you). MongoDB connection (`MONGO_URL`, `DB_NAME`) will use whatever your hosting platform already injects in production — this file only provides a local fallback and will never override your real production database connection.

**Admin login credentials (save these somewhere safe — they are not stored in plaintext anywhere in the project):**
- URL: `/admin/login`
- Username: `admin`
- Password: `fnhgzFuHSe77wx`

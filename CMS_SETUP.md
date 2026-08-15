# Eva Skin Clinic — Blog CMS (Decap CMS, Netlify only)

No separate backend, no database, no Render/MongoDB Atlas needed — same
approach as the My Dentist site. Everything runs on Netlify.

## What was added (nothing else touched)

- `frontend/public/admin/index.html` + `config.yml` — the CMS admin panel itself, at **`/admin`**
- `frontend/content/blog/*.md` — blog posts, edited through the CMS, committed to git
- `frontend/scripts/generate-blog-data.js` — runs automatically before every `yarn start` / `yarn build`, turns those markdown files into `src/generated/blogPosts.json`
- `frontend/src/blog/BlogListing.jsx`, `BlogPost.jsx` — public blog pages at **`/insights`** and **`/insights/:slug`**
- One redirect rule added to `netlify.toml` / `_redirects`, scoped only to `/insights/*`

The FastAPI backend was left completely untouched — this CMS doesn't use it at all. Homepage, navbar, footer, existing static `/blog/*.html` pages: all unchanged.

## One-time setup (Netlify dashboard, ~2 minutes)

1. Netlify site → **Site configuration → Identity** → **Enable Identity**
2. Same page → **Identity → Services → Git Gateway** → **Enable Git Gateway**
3. Identity → **Invite users** → invite yourself (your email) as an admin
4. Check your email, accept the invite, set a password

That's the whole setup. No environment variables, no separate hosting.

## How it works day-to-day

1. Go to `yoursite.com/admin`
2. Log in with the email/password from step 4 above
3. Create/edit/delete posts, set draft or published, upload a featured image, fill SEO title/meta description/focus keyword
4. Publishing commits the post to GitHub → Netlify automatically rebuilds the site (1–2 min) → the post appears at `/insights`

Draft posts never appear on `/insights` — only what you explicitly publish through the CMS editorial workflow.

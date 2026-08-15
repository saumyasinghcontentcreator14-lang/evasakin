/**
 * scripts/generate-blog-data.js
 *
 * Reads every markdown file in frontend/content/blog (managed by Decap CMS)
 * and writes a single JSON file at src/generated/blogPosts.json that the
 * React app imports directly. Runs automatically before `yarn start` and
 * `yarn build` (see package.json "pre" scripts) so newly published posts
 * show up on every rebuild — no separate backend or database involved.
 */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT_DIR = path.join(__dirname, "..", "content", "blog");
const OUT_DIR = path.join(__dirname, "..", "src", "generated");
const OUT_FILE = path.join(OUT_DIR, "blogPosts.json");

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function build() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

  const posts = files.map((filename) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf8");
    const { data, content } = matter(raw);
    const slug = data.slug || slugify(data.title || filename.replace(/\.md$/, ""));
    return {
      title: data.title || "",
      slug,
      excerpt: data.excerpt || "",
      date: data.date ? new Date(data.date).toISOString().slice(0, 10) : "",
      featuredImage: data.featuredImage || "",
      alt: data.alt || "",
      author: data.author || "Eva Skin Clinic",
      category: data.category || "",
      seoTitle: data.seoTitle || "",
      metaDescription: data.metaDescription || "",
      focusKeyword: data.focusKeyword || "",
      content: content.trim(),
    };
  });

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  fs.writeFileSync(OUT_FILE, JSON.stringify(posts, null, 2));
  console.log(`[generate-blog-data] Wrote ${posts.length} post(s) to ${path.relative(process.cwd(), OUT_FILE)}`);
}

build();

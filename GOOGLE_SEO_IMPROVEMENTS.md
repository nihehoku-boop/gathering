# Google SEO Improvements Checklist

Based on your current setup (see `SEO_IMPLEMENTATION_SUMMARY.md` and `SEO_OPTIMIZATION.md`), here’s what to do to improve Google SEO.

**Performance / Vercel impact:** Adding metadata (title template, page titles, layout metadata) does **not** increase loading times or Vercel usage. Metadata is static or evaluated at build time for these pages; it becomes part of the same HTML response. No extra API calls, client JS, or images.

---

## Already in good shape

- Root **meta tags** (title, description, keywords), **OpenGraph**, **Twitter Card**, **robots**
- **metadataBase** for canonical URLs
- **Structured data** (WebSite, Organization, WebApplication) in layout
- **sitemap.xml** (home, auth, community, recommended, legal, help, about, leaderboard, blog)
- **robots.txt** with sitemap and clear allow/disallow
- **Blog** and **legal pages** have their own metadata
- **Landing page** is server-rendered when not logged in, so homepage is crawlable

---

## High impact (do first)

### 1. Fix OG image (social & Google)

- **Issue:** Layout points to `/og-image.png` (1200×630) but only `public/og-image.svg` exists. Many crawlers and platforms prefer PNG.
- **Action:** Generate a 1200×630 PNG from `og-image.svg` and save as `public/og-image.png` (or update layout to use the SVG if you keep only SVG and accept lower compatibility).
- **Note:** See `public/OG_IMAGE_README.txt` for conversion options.

### 2. Fix favicon references (avoid 404s)

- **Issue:** Layout references `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, but `public/` only has SVG variants.
- **Action:** Either:
  - Add real files: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (e.g. export from your SVG), or
  - Change layout to use the existing SVGs where supported (e.g. `favicon.svg`, and keep one PNG/ICO fallback for older browsers).

### 3. Add a title template

- **Issue:** No global title template, so inner pages may not show “| Colletro” in SERPs.
- **Action:** In `app/layout.tsx`, add a template to `metadata`:

```ts
export const metadata: Metadata = {
  title: {
    default: 'Colletro - Your Collection Trove',
    template: '%s | Colletro',
  },
  // ... rest unchanged
}
```

Then set a short `title` (or `generateMetadata`) on each page; the template will apply automatically.

### 4. Add Google Search Console

- **Issue:** Not verified yet, so you can’t use Search Console data or submit sitemaps.
- **Action:** In [Google Search Console](https://search.google.com/search-console), add your property and verify (HTML tag or DNS). Add the verification meta tag in `app/layout.tsx` under `<head>` if you use the tag method. Then submit `https://yourdomain.com/sitemap.xml`.

---

## Medium impact (recommended)

### 5. Page-specific metadata for key routes

Give important pages their own title and description so SERPs are clearer and more relevant.

| Route              | Notes |
|--------------------|--------|
| `/about`           | Add `metadata` export with title + description. |
| `/recommended`     | Add `metadata` (e.g. “Recommended collections \| Colletro”). |
| `/leaderboard`     | Add `metadata`. |
| `/community`       | Page is `'use client'`; add metadata in a parent **layout** (e.g. `app/community/layout.tsx` with `metadata`). |
| `/help`            | Already has metadata; ensure title/description are unique and descriptive. |

### 6. Dynamic metadata for public share links

- **Route:** `app/collections/share/[token]/page.tsx`
- **Issue:** Shared collection pages are public but use the default site title/description.
- **Action:** If you want these pages indexed, add a **layout** that fetches the shared collection by token and uses `generateMetadata` to set:
  - `title`: e.g. collection name
  - `description`: e.g. first 150 chars of description or “Shared collection …”
  - Optional: OG image = collection cover when available.
- **Crawlability:** Right now `robots.ts` disallows `/collections/` for `*`. If you want share links indexed, add a rule that allows only `/collections/share/` (or the exact path pattern you use).

### 7. Optional: Breadcrumb structured data

- Add **BreadcrumbList** JSON-LD on subpages (e.g. Blog post, About, Help) so Google can show breadcrumbs in results. You can do this in each page’s layout or in a small component that receives the path segments.

---

## Lower priority / later

### 8. Richer structured data (when you expose more public content)

- If you later index **public profiles** or **community/recommended collection detail pages**, add schema such as:
  - **ProfilePage** / **Person** for profiles
  - **CollectionPage** or **ItemList** for collection pages
- Validate with [Rich Results Test](https://search.google.com/test/rich-results) and [schema.org validator](https://validator.schema.org/).

### 9. Sitemap for dynamic public URLs (if you index them)

- If you allow indexing of `/collections/share/[token]` or `/profile/[userId]`, extend `app/sitemap.ts` to fetch those tokens/IDs and add their URLs with sensible `lastModified` and `priority`/`changeFrequency`.

### 10. Content and UX (always good for SEO)

- One clear **h1** per page.
- **Alt text** on all meaningful images (including OG image).
- Fast load (you already use Next.js Image and caching).
- Mobile-friendly layout (you’re responsive).

---

## Quick reference

| Task                         | File(s) to touch              | Effort |
|-----------------------------|--------------------------------|--------|
| OG image PNG                | Create `public/og-image.png`   | Low    |
| Favicons                    | Create PNG/ICO or adjust layout| Low    |
| Title template              | `app/layout.tsx`               | Low    |
| Search Console verification | `app/layout.tsx` (meta tag)    | Low    |
| About / Recommended / Leaderboard metadata | Each `page.tsx` or layout | Low  |
| Community metadata          | `app/community/layout.tsx`     | Low    |
| Share link metadata         | `app/collections/share/[token]/layout.tsx` + `generateMetadata` | Medium |
| robots allow share path     | `app/robots.ts`                | Low    |
| BreadcrumbList              | Layouts or shared component    | Medium |

Doing **1–4** will fix the main technical gaps and give you a solid base; **5–7** will make individual pages and share links perform better in Google.

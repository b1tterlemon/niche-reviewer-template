# CLAUDE.md — Niche Reviewer Template Playbook

> Auto-loaded by Claude Code. Playbook for populating this template with
> a new niche and deploying it. Written so a fresh session has everything
> it needs without reading the git history.

---

## What This Template Is

A generic niche reviewer site built with Astro 5. Clone this repo, populate
`src/data/companies.ts` with verified company data, fill the TODO sections
in `src/pages/index.astro`, and deploy to Cloudflare Pages. All comparison,
alternatives, and profile pages generate automatically.

---

## Workflow Rules

**Always commit after every change.** After applying any edit to any file,
stage only the files in this repo and create a git commit immediately. Then
push to `origin main` so Cloudflare Pages deploys automatically.

```bash
git add src/...        # stage only changed files in this repo
git commit -m "..."
git push origin main
```

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 5 |
| Styling | Tailwind CSS 3 + `@tailwindcss/typography` |
| Data | TypeScript (`src/data/companies.ts`) |
| Sitemap | `@astrojs/sitemap` |
| Deploy | Cloudflare Pages (`public/_headers` + `public/_redirects`) |

---

## Complete File Map

### Config (change these first)

| Goal | File | Key to edit |
|---|---|---|
| Site name, domain, tagline | `src/config.ts` | `SITE.*` |
| Niche label, provider label | `src/config.ts` | `NICHE.*` |
| Nav links | `src/config.ts` | `NAV` array |
| Primary accent colour | `src/config.ts` → `BRANDING.primaryColor` **and** `tailwind.config.mjs` → `brand.600` | Both must match |
| Domain in sitemap/canonical | `astro.config.mjs` | `site:` |

### Data

| Goal | File |
|---|---|
| Add / edit company data | `src/data/companies.ts` |
| Add logos | `public/logos/` (initials fallback is automatic) |
| Update service category labels | `src/lib/companies.ts` → `SERVICE_LABELS` |

### Pages

| URL | File |
|---|---|
| Homepage | `src/pages/index.astro` |
| Company profile | `src/pages/companies/[slug].astro` |
| Alternatives | `src/pages/alternatives/[slug].astro` |
| Comparison | `src/pages/comparisons/[slug].astro` |
| Disclosure | `src/pages/affiliate-disclosure.astro` |
| 404 | `src/pages/404.astro` |

---

## Phase 0 Setup Checklist (do this once per new site)

- [ ] `src/config.ts` — fill every TODO field (SITE, NICHE, BRANDING)
- [ ] `astro.config.mjs` — update `site:` to real domain
- [ ] `tailwind.config.mjs` — update `brand` color to match `BRANDING.primaryColor`
- [ ] `src/data/companies.ts` — add at least 5 company objects
- [ ] `src/lib/companies.ts` — update `SERVICE_LABELS` to match your badge values
- [ ] `src/pages/index.astro` — fill all TODO sections with niche-specific content
- [ ] `src/pages/comparisons/[slug].astro` — update `hasCap()` keys and `allTech` array
- [ ] `CLAUDE.md` (this file) — update "Rating logic" and "Known verified facts" sections below
- [ ] `npm run build` — verify clean build

---

## Content & Comparison Rules

Apply to all data edits, new company additions, and prose revisions.

### Rating logic

Ratings are editorial scores for **niche-specific delivery suitability** — not
overall company quality.

- No company should top every dimension. Identify dimension winners:
  - **Specialist depth:** [update with your niche's top specialist]
  - **Enterprise scale/compliance:** [update with your niche's largest firm]
  - **Cost/accessibility:** [update with your niche's budget option]
- Ratings must have ≥ 0.8 spread across the list (e.g. 4.8 down to 3.9)
- The top specialist boutique holds rank #1 (4.7–4.9 range)
- Large generalists score 0.5–1.0 lower than boutiques on specialist dimensions

### Factual accuracy rules

- Verify founding year, HQ, employee count from a primary source before adding
- Unverifiable marketing claims must be tagged: `(per company website; independently unverifiable)`
- Acquisitions and ownership changes must appear in `description` and `cons`
- Confirm cloud/tech partnership tiers from official partner directories only

### Known verified facts (update for your companies)

> Replace this section with verified facts for the companies you add.
> Keep only facts you confirmed from a primary source (company website,
> Crunchbase, LinkedIn, official partner directory).

```
[Company Name]: founded [year], HQ [city], [N] employees, [cert/tier]
[Company Name]: founded [year], HQ [city], [N] employees, [cert/tier]
...
```

### Comparison page logic

The `hasCap()` function in `comparisons/[slug].astro` drives all capability
✓/✗ tables. It reads from `badges` and `engagementModels` only. Never add a ✓
claim that isn't backed by actual data. Update the `hasCap()` function keys and
the `allTech` array to match your niche's capabilities and tools.

---

## When Adding a New Company

- [ ] Verify founding year from a primary source
- [ ] Verify HQ from a primary source; note if legal HQ differs from delivery centre
- [ ] Verify employee count from LinkedIn or Crunchbase
- [ ] Check for acquisitions or ownership changes — disclose in `description` + `cons`
- [ ] Confirm cloud/tech partnership tiers from official partner directories
- [ ] Set `rating` using the dimension logic above
- [ ] Ensure no company tops all dimensions
- [ ] Confirm `badges` only contain services the company actually delivers
- [ ] Badges must match keys in `SERVICE_LABELS` in `src/lib/companies.ts`
- [ ] Run `npm run build` and verify page count increases correctly

---

## Known Gotchas (same across all sites cloned from this template)

1. **`brand` color must match in two places.** `tailwind.config.mjs` `brand.600`
   and `BRANDING.primaryColor` in `src/config.ts` must be the same hex value.

2. **All internal `href` values must end with `/`.** `trailingSlash: 'always'`
   in `astro.config.mjs` enforces this. Any link missing the trailing slash
   triggers a redirect warning in the build log.

3. **`SERVICE_LABELS` keys must match `badges` values exactly.** Every string
   in every company's `badges` array must have a matching key in `SERVICE_LABELS`
   in `src/lib/companies.ts`. Missing keys produce raw slugs on company cards.

4. **`StarRating` only accepts `rating: number`.** No other props.

5. **Comparison page slug format is `slug1-vs-slug2`.** `getComparisons()`
   returns this format. The dynamic route is `/comparisons/[slug].astro`.

6. **`hasCap()` keys in `comparisons/[slug].astro` must exactly match the
   capability labels in the JSX capability table.** If you rename one, rename both.

7. **`npm install` may fail with cache permission error.** Fix:
   `sudo chown -R $(whoami) ~/.npm` or use `npm install --cache /tmp/npm-cache`.

8. **Cloudflare Pages uses `public/_headers` and `public/_redirects`**,
   not `vercel.json`. Do not add a `vercel.json` — it will be ignored.

9. **`astro.config.mjs` redirects go in `redirects:`.** Do not define the
   same path in both a `.astro` file and as a redirect.

---

## Build Commands

```bash
npm install                    # first time / after adding dependencies
npm run dev                    # local dev server → http://localhost:4321
npm run build                  # production build → dist/
npm run preview                # preview dist/ locally
npm install --cache /tmp/npm-cache   # workaround if npm cache has permission errors
```

---

## Current Status

**Template — initial state.** No companies added. All niche-specific TODO
sections in `src/pages/index.astro` are placeholders awaiting real content.

Data layer: TypeScript (`src/data/companies.ts`). Companies: none — add yours.

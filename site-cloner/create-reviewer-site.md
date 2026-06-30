---
name: create-reviewer-site
description: Clone the niche reviewer template into a new niche reviewer website, populate it with fact-checked company data, push to GitHub, and deploy to Cloudflare Pages. Use when the user says "build a new reviewer site for [niche]", "clone the site for [topic]", "spin up a reviewer site about [service]", or "create another site like best-ai-agent-developers.com but for [niche]".
---

# Niche Reviewer Site Cloner

Clone the niche reviewer template into a new niche reviewer website,
populate it with fact-checked company data, push to a new GitHub repo, and
deploy to Cloudflare Pages — all in one uninterrupted session.

---

## Template Source

```
https://github.com/b1tterlemon/niche-reviewer-template
```

All page logic, components, and layout carry over unchanged. Only config,
data, and niche-specific prose need updating.

---

## PHASE 0 — Pre-flight: Verify MCPs

Run these checks before asking the user anything. If either fails, stop
and report the problem — do not proceed to Phase 1.

### 0a. GitHub MCP

Call `mcp__github__get_me` with no arguments. It returns the authenticated
user's login.

- **Pass:** returns `{ login: "..." }` — record the login for use in Phase 7
- **Fail (tool not found):** stop and tell the user:
  > "The GitHub MCP is not available in this session. Please install it
  > via Settings → MCP Servers and restart Claude Code, then try again."
- **Fail (auth error / empty login):** stop and tell the user:
  > "The GitHub MCP is installed but not authenticated. Run
  > `gh auth login` in your terminal and ensure the MCP token has
  > `repo` scope, then restart the session."

### 0b. Cloudflare MCP

Call `mcp__plugin_cloudflare_cloudflare-api__execute` with this code:

```javascript
async () => {
  const result = await cloudflare.request({
    method: 'GET',
    path: `/accounts/${accountId}/pages/projects`,
    query: { per_page: 1 }
  });
  return { success: result.success, accountId };
}
```

- **Pass:** `success: true` — record `accountId` for use in Phases 7 and later
- **Fail (tool not found):** stop and tell the user:
  > "The Cloudflare MCP is not available in this session. Please install
  > the `cloudflare-api` MCP plugin and restart Claude Code, then try again."
- **Fail (`success: false` or auth error):** stop and tell the user:
  > "The Cloudflare MCP is installed but the API token lacks permissions.
  > Ensure the token has **Cloudflare Pages: Edit** and **Zone: Read**
  > permissions in the Cloudflare dashboard → My Profile → API Tokens."

### 0c. Report pre-flight result

If both pass, tell the user:
> "Pre-flight checks passed. GitHub authenticated as `[login]`, Cloudflare
> account `[accountId]` is accessible. Ready to collect requirements."

Then proceed to Phase 1.

---

## PHASE 1 — Collect Requirements

Ask every question below explicitly. Do not assume or default any of these —
confirm each one with the user before moving to Phase 2.

**Required inputs (always ask, no defaults):**

1. **Niche topic** — e.g. "Cloud Migration Consulting", "DevOps Consulting Firms"
2. **Number of companies to review** — ask explicitly; typical range is 6–10
3. **GitHub account or org** — where to create the new repo (e.g. `b1tterlemon`
   or an org name); always ask even if you think you know it
4. **GitHub repo name** — suggest `[niche-slug]-reviewer` but confirm
5. **Target domain** — e.g. `best-cloud-migration-companies.com`; suggest based
   on niche but confirm; can be "TBD" to skip DNS setup
6. **Cloudflare Pages project name** — suggest derived from domain (hyphens, no
   dots) but confirm
7. **Primary brand color** — three ways the user can specify this:

   **Option A — User already provided a color in their request**
   If the user mentioned a color or hex in their initial message (e.g.
   "use purple", "the color is `#7c3aed`"), use that directly. Skip
   presenting the table. Derive the full 10-shade palette using the rule
   in "Custom color derivation" below.

   **Option B — Pick from the preset table**
   Present the table and let them choose a row number:

   | # | Niche type | Brand 600 | Full shade set (50→900) |
   |---|---|---|---|
   | 1 | Cloud / Infrastructure | `#0f766e` (teal) | `#f0fdfa #ccfbf1 #99f6e4 #5eead4 #2dd4bf #14b8a6 #0f766e #0d6b63 #134e4a #0d3d3a` |
   | 2 | DevOps / SRE | `#c2410c` (orange) | `#fff7ed #ffedd5 #fed7aa #fdba74 #fb923c #f97316 #c2410c #9a3412 #7c2d12 #431407` |
   | 3 | Cybersecurity | `#b91c1c` (red) | `#fef2f2 #fee2e2 #fecaca #fca5a5 #f87171 #ef4444 #b91c1c #991b1b #7f1d1d #450a0a` |
   | 4 | Data / Analytics | `#6d28d9` (violet) | `#f5f3ff #ede9fe #ddd6fe #c4b5fd #a78bfa #8b5cf6 #6d28d9 #5b21b6 #4c1d95 #2e1065` |
   | 5 | Healthcare IT | `#0369a1` (sky blue) | `#f0f9ff #e0f2fe #bae6fd #7dd3fc #38bdf8 #0ea5e9 #0369a1 #075985 #0c4a6e #082f49` |
   | 6 | FinTech / Finance | `#065f46` (emerald) | `#ecfdf5 #d1fae5 #a7f3d0 #6ee7b7 #34d399 #10b981 #065f46 #064e3b #022c22 #011c16` |
   | 7 | E-commerce / Retail | `#be185d` (pink) | `#fdf2f8 #fce7f3 #fbcfe8 #f9a8d4 #f472b6 #ec4899 #be185d #9d174d #831843 #500724` |

   **Option C — Custom hex**
   If none of the rows match, ask: "None of these match — what hex color
   would you like for the brand color?" Then derive the palette using
   the rule below.

   **Custom color derivation** (for Options A and C):
   Given `brand-600 = #RRGGBB`, generate the 9 other shades by mapping
   the hex to the nearest Tailwind built-in hue family (red, orange, amber,
   yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet,
   purple, fuchsia, pink, rose) and using that family's standard 10-shade
   set from the Tailwind v3 docs. If no close family match exists, build
   a monotone scale:
   - 50: mix 95% white + 5% the hex
   - 100: mix 90% white + 10% the hex
   - 200: mix 80% white + 20% the hex
   - 300: mix 65% white + 35% the hex
   - 400: mix 50% white + 50% the hex
   - 500: mix 25% white + 75% the hex
   - 600: the hex itself
   - 700: mix 85% the hex + 15% black
   - 800: mix 65% the hex + 35% black
   - 900: mix 45% the hex + 55% black

   Always show the derived palette to the user before proceeding so they
   can confirm or correct it.

**Auto-derive (confirm in summary):**
- Site name → "Best [Niche] Companies"

Summarise all confirmed inputs and ask the user to approve before Phase 2.

---

## PHASE 2 — Research Companies

Use WebSearch to research exactly the number of companies the user specified.

### For each company, collect and verify:

- **Full legal name** (primary source: company website, LinkedIn, Crunchbase)
- **Website URL** (the real homepage, not a press page)
- **Founding year** (verify from Crunchbase, LinkedIn, or company About page — not marketing copy)
- **HQ** (legal HQ city; note if delivery centre differs)
- **Team size band** (from LinkedIn "About" tab or Crunchbase — do NOT use company website claims alone)
- **Key services** (what they actually deliver, not what they claim)
- **Notable clients or public case studies** (name or category only; do not invent)
- **Cloud/tech certification tiers** (verify from official partner directories only)
- **Acquisitions, ownership changes, parent company** (disclose in `description` and `cons`)
- **Pricing model** (fixed / T&M / retainer / marketplace)
- **Genuine strengths** — what they are measurably better at
- **Genuine weaknesses** — real trade-offs, not softened disclaimers

### Tech stack — inference rules:

A company won't always list every tool it uses. Apply these rules:

- **Explicitly stated** (website, case studies, job postings, GitHub): list as-is
- **Certifications imply stack**: AWS Premier Partner → include core AWS services;
  Azure Expert MSP → Azure equivalents; GCP Partner → GCP services. List the
  platform, not every individual service.
- **Company size + niche implies baseline**: A 5,000-person DevOps consultancy
  almost certainly uses Terraform, Kubernetes, and CI/CD tooling even if not
  stated. Include these with reasonable confidence.
- **Do NOT blanket-assume excellence**: Presence in `techStack` does not mean
  leadership — reflect depth in `pros`/`cons` and `rating`.
- **Never invent specific version numbers, proprietary tool names, or internal
  frameworks** without a source.

### Research rules (non-negotiable):

- Tag unverifiable marketing claims: `(per company website; independently unverifiable)`
- Disclose acquisitions in `description` and in at least one `cons` entry
- Confirm cloud partnership tiers from official partner directories
- Do NOT copy competitors' descriptions or any SEO-scraped content

### Rating logic:

Ratings are for **niche-specific delivery suitability**, not overall IT quality.
- No company should top every dimension
- The single clearest specialist/boutique gets ≥ 4.7; place it at rank #1
- Large IT generalists should rate 0.5–1.0 lower than boutiques on specialist dimension
- Spread across the full list must be ≥ 0.8 points (e.g. 4.8 down to 3.9)
- Give at least one company a clear win on cost/accessibility
- Give at least one large company a win on scale/compliance

After research, present a summary table of all candidates and ask the user:
> "Here are the [N] companies I found. Confirm to proceed, or let me know if
> you want to swap any out before I build the site."

Do not proceed to Phase 3 until the user approves the company list.

---

## PHASE 3 — Scaffold the New Site

```bash
# 1. Clone the generic template (no AI-agent-specific content)
git clone https://github.com/b1tterlemon/niche-reviewer-template.git ~/Projects/[new-site-name]

# 2. Re-init git so this becomes a fresh independent repo
cd ~/Projects/[new-site-name]
rm -rf .git
git init
git branch -m master main   # macOS git init creates 'master' by default — rename immediately

# 3. Initial commit
git add .
git commit -m "chore: initial scaffold from niche-reviewer-template"
```

The cloned template already has:
- Generic `src/config.ts` with TODO placeholders for all niche-specific fields
- Empty `src/data/companies.ts` with the `Company` type and helper functions
- `public/_headers` and `public/_redirects` for Cloudflare Pages
- `src/pages/index.astro` with all niche content as TODO placeholders
- No `vercel.json` (removed in the template)
- No AI-agent-specific hardcoding anywhere in source files

---

## PHASE 4 — Customize All Files

Work through each file below in order. Do NOT skip any.

### 4a. `src/config.ts`

Replace every TODO value with real niche content:

```typescript
export const SITE = {
  name:          'Best [Niche] Companies',
  domain:        '[target-domain]',
  url:           'https://[target-domain]',
  tagline:       'Independent reviews of [niche] companies',
  description:   'Find and compare the best [niche] companies. Independent reviews, pricing data, and side-by-side comparisons. Updated [Month Year].',
  locale:        'en_US',
  twitterHandle: '',
  lastReviewed:  '[Month Year]',
};

export const NICHE = {
  label:          '[Niche Label]',       // e.g. 'Cloud Migration'
  providerLabel:  'company',
  providersLabel: 'companies',
  verticalSlug:   '[niche-slug]',        // e.g. 'cloud-migration' — kebab-case
};

export const BRANDING = {
  primaryColor: '[brand-600-hex]',       // from Phase 1 color choice
  logoText:     'Best [Niche] Companies',
  logoPath:     '/logos/site-logo.svg',
};

export const MONETIZATION = {
  enabled: true,
  defaultRel: 'sponsored' as 'sponsored' | 'nofollow' | '',
  disclosurePath: '/affiliate-disclosure',
};

export const NAV = [
  { label: 'Home',        href: '/' },
  { label: 'Disclosure',  href: '/affiliate-disclosure/' },
];
```

### 4b. `astro.config.mjs`

Change `site:` only — leave all other settings unchanged:
```js
site: 'https://[target-domain]',
```

### 4c. `tailwind.config.mjs`

Replace the full `brand` color object. The 10 shade values map to
50, 100, 200, 300, 400, 500, 600, 700, 800, 900. Copy the shade set
from the Phase 1 color table row you chose. Example for teal:

```js
brand: {
  50:  '#f0fdfa',
  100: '#ccfbf1',
  200: '#99f6e4',
  300: '#5eead4',
  400: '#2dd4bf',
  500: '#14b8a6',
  600: '#0f766e',
  700: '#0d6b63',
  800: '#134e4a',
  900: '#0d3d3a',
},
```

### 4d. `src/data/companies.ts`

Replace the empty `companies` array with the researched company data.
Keep the `Company` type export and helper functions exactly as-is.

**Required fields per company object:**

```typescript
{
  slug: string,             // kebab-case, unique, URL-safe
  name: string,             // full display name
  website: string,          // https:// URL
  tagline: string,          // one sentence, factual, no superlatives
  description: string,      // 3–5 sentences; encyclopedic, not marketing.
                            // Tag unverifiable claims with:
                            // (per company website; independently unverifiable)
  founded: number,          // verified year as integer
  hq: string,               // "City, Country" — note legal vs. delivery if different
  teamSize: string,         // band, e.g. "200–500"
  rating: number,           // 1 decimal, e.g. 4.7
  badges: string[],         // service categories this company actually delivers;
                            // every value must appear in SERVICE_LABELS (see 4e)
  bestFor: string,          // one sentence — who should hire them
  primaryDifferentiator: string, // one sentence — what makes them distinct
  pricingModel: string,     // e.g. "Fixed project, T&M, retainer"
  minimumEngagement: string, // e.g. "$25K" or "Not published"
  techStack: string[],      // verified tools/platforms they use
  industries: string[],     // sectors they serve
  engagementModels: string[], // e.g. ["Fixed project", "Dedicated team"]
  pros: string[],           // 4–6 real strengths, 1 sentence each
  cons: string[],           // 2–4 real trade-offs, 1 sentence each
  useCases: string[],       // 3–5 specific scenarios where they excel
  featured: boolean,        // true for top 3–4 companies only
}
```

**Rating discipline:**
- Rank #1 boutique specialist: 4.7–4.9
- Rank #2–3: 4.3–4.6
- Mid-tier: 4.0–4.3
- Large generalists: 3.9–4.2 (they win on scale, not niche depth)
- Minimum 0.8 spread across all companies

### 4e. `src/lib/companies.ts`

Update `SERVICE_LABELS` to match exactly the `badges` values used in
the new `companies.ts`. Every key must appear in at least one company's
`badges` array. Example for cloud migration:

```typescript
export const SERVICE_LABELS: Record<string, string> = {
  'cloud-strategy':      'Cloud Strategy',
  'migration':           'Migration',
  'cloud-native':        'Cloud Native',
  'managed-services':    'Managed Services',
  'data-migration':      'Data Migration',
  'security':            'Security',
  'cost-optimisation':   'Cost Optimisation',
  'staff-aug':           'Staff Aug',
};
```

### 4f. `src/pages/index.astro`

The template has TODO placeholder sections throughout. Fill each one:

| Section | What to add |
|---|---|
| Quick answer box bullet list | Real winner-per-use-case recommendations |
| `<h2>` headings | Rephrase with your niche keyword if needed |
| Use-case table rows | Map your niche's top use cases to companies |
| Industry table rows | Map industries to recommended companies |
| Pricing table rows | Add real pricing ranges for your niche |
| FAQ answers | Add niche-specific answers to each question |
| Prose paragraphs | Replace TODO prose with niche-specific editorial |

Run this scan after editing to verify no TODOs remain:
```bash
grep -n "TODO" src/pages/index.astro | head -30
```

### 4g. `src/pages/comparisons/[slug].astro`

Two sections require niche-specific updates:

**`hasCap()` function keys:** Replace the placeholder capability keys with
the actual capabilities in your niche. Keys must match the labels used in
the JSX capabilities table.

```typescript
const checks: Record<string, (c: Company) => boolean> = {
  'Cloud strategy & roadmap': c => c.badges.some(b => b.includes('strategy')),
  'AWS/Azure/GCP migration':  c => c.badges.some(b => b.includes('migration')),
  // ... add all capability checks for your niche
};
```

**`allTech` array:** Replace with the 5–10 key technologies for your niche:
```typescript
const allTech = ['Terraform', 'Kubernetes', 'AWS', 'Azure', 'GCP'];
```

**Capability array in JSX:** Must exactly match `hasCap()` keys:
```tsx
{['Cloud strategy & roadmap', 'AWS/Azure/GCP migration', ...].map((cap, i) => (
```

Run this scan to confirm no TODO placeholders remain:
```bash
grep -n "TODO" src/pages/comparisons/\[slug\].astro | head -10
```

### 4h. `CLAUDE.md`

Update the three niche-specific sections:
1. **Rating logic** dimension winner bullets — name your niche's actual companies
2. **Known verified facts** — list verified facts for each company
3. **Current Status** at the bottom — replace with actual page count and company list

---

## PHASE 5 — Build & Verify Locally

```bash
cd ~/Projects/[new-site-name]
npm install --cache /tmp/npm-cache   # use this form to avoid EACCES cache permission errors
npm run build
```

**Expected output:**
- Zero TypeScript errors
- Zero Astro build errors
- Page count = 1 home + N profiles + N alternatives + N×(N-1)/2 comparisons + 1 disclosure + 1 404 + 1 companies index
  (e.g. 7 companies → 1 + 7 + 7 + 21 + 1 + 1 + 1 = 39 … Astro reports 38 because robots.txt is a TS route counted separately)
  Quick check: `[build] N page(s) built` in the output — any TypeScript error before this line must be fixed before pushing.

**If build fails:**
- Read the full error message and fix the offending file
- Re-run `npm run build`
- Do NOT proceed to GitHub push until build exits 0

**Verification scans — run all, fix every hit before proceeding:**

```bash
# 1. Check no TODO placeholders remain in config
grep -n "TODO" src/config.ts

# 2. Check no TODO placeholders remain in index
grep -n "TODO" src/pages/index.astro | head -20

# 3. Check no TODO placeholders remain in comparisons page
grep -n "TODO" src/pages/comparisons/\[slug\].astro | head -10

# 4. Verify vercel.json is absent
ls vercel.json 2>/dev/null && echo "DELETE vercel.json before pushing"

# 5. Verify SERVICE_LABELS keys match badges in companies.ts
grep "badges:" src/data/companies.ts | head -20
grep "'" src/lib/companies.ts | head -20
```

**Commit the clean build:**

```bash
git add src/ CLAUDE.md PROGRESS.md astro.config.mjs tailwind.config.mjs \
        public/_redirects public/_headers
git commit -m "feat: complete [Niche] reviewer site — [N] companies, clean build"
```

---

## PHASE 6 — Create GitHub Repository

Use the GitHub MCP tool `mcp__github__create_repository`:

```
name:        [repo-name]
description: "Niche reviewer site: [Site Name]"
private:     true
auto_init:   false
```

Then push the local commits:

```bash
cd ~/Projects/[new-site-name]
git remote add origin https://github.com/[github-account]/[repo-name].git
git branch -M main
git push -u origin main
```

Confirm the push succeeded by checking the remote exists:
```bash
git ls-remote origin
```

---

## PHASE 7 — Deploy to Cloudflare Pages

**CRITICAL: Do NOT create the Pages project via the Cloudflare API MCP.**
The API creates a "Direct Upload" project that cannot connect to GitHub.
The `PATCH source:` endpoint to fix this returns error `8000069` and has no
workaround short of deleting the project and starting over.

**Always create the Pages project from the Cloudflare dashboard:**

Tell the user:
> "To deploy, go to the Cloudflare dashboard → Pages → Create a project →
> **Connect to Git** → select the **[github-account]/[repo-name]** repository →
> set Branch: `main`, Build command: `npm run build`, Build output directory: `dist` →
> click Save and Deploy. Let me know when the first build completes."

Wait for the user to confirm the build completed before proceeding.

**If the user reports "A project with this name already exists":**
This means a Direct Upload project with that name already exists (likely from a
previous API call). Fix:

1. Use the Cloudflare API MCP to delete the stale project:
```javascript
async () => {
  return cloudflare.request({
    method: 'DELETE',
    path: `/accounts/${accountId}/pages/projects/[cloudflare-project-name]`
  });
}
```
2. Then instruct the user to create fresh from the dashboard using Connect to Git.

**After the first dashboard build succeeds:**

1. Note the preview URL: `https://[project-name].pages.dev`
2. Every subsequent `git push origin main` triggers an automatic redeploy — no further dashboard action needed.

**If the user provided a custom domain:**
- Add it in Cloudflare Pages → Custom domains
- Instruct the user to point their domain's CNAME or nameservers to Cloudflare
- DNS propagation: 0–48 hours; the `.pages.dev` URL works immediately

---

## PHASE 8 — Post-Deploy Verification

After deployment completes, verify using the `.pages.dev` URL:

### Navigation checks
- [ ] Homepage loads — hero headline contains new niche keyword
- [ ] At least 2 company profile pages load correctly
- [ ] At least 1 comparison page loads
- [ ] Alternatives page for one company loads
- [ ] Affiliate disclosure page loads
- [ ] 404 page loads and description references new niche

### Technical checks
- [ ] `https://[domain]/sitemap-index.xml` returns valid XML
- [ ] `https://[domain]/robots.txt` returns `Allow: *` and sitemap pointer
- [ ] No broken internal links on homepage (check browser console)

### Content checks
- [ ] Page `<title>` on homepage contains new niche keyword
- [ ] Meta description is niche-specific
- [ ] JSON-LD on a company page includes correct `foundingDate` and `description`
- [ ] No two company ratings are identical (meaningful spread)

### Grep check (post-deploy)
```bash
curl -s https://[project-name].pages.dev/ | grep -i "TODO" | head -5
```

If any issues: fix in source → commit → `git push` → wait for Cloudflare
auto-redeploy → re-verify.

---

## PHASE 9 — Handoff Summary

Report to the user:

```
Site live at: https://[project-name].pages.dev
Custom domain: https://[domain] (DNS: propagating / active)

GitHub: https://github.com/[account]/[repo-name]
Branch: main | Auto-deploys: enabled

Pages generated: [N] total
  [N] company profiles | [N] alternatives | [N×(N-1)] comparisons
  + home, disclosure, 404

Recommended next steps:
  1. Submit sitemap to Google Search Console:
     https://search.google.com/search-console → Add property → [domain]
     Sitemap URL: https://[domain]/sitemap-index.xml
  2. [If DNS not yet configured] Point domain to Cloudflare Pages
  3. Create the Bot Traffic Cloudflare dashboard:
     Follow docs/superpowers/plans/2026-06-29-cloudflare-bot-dashboard.md
     (takes ~10 min; use the new domain's zone ID)
```

---

## Error Handling Reference

| Error | Action |
|---|---|
| `npm run build` TypeScript error | Read full error, fix the offending file, re-run. Never push broken code. |
| `vercel.json` found after scan | `rm vercel.json`, re-commit, rebuild. |
| GitHub push rejected (auth) | Ask user to check GitHub MCP credentials / PAT scope (needs `repo` scope). |
| Cloudflare Pages build fails | Check build logs in Cloudflare dashboard. Common causes: wrong output dir (`dist`), missing `NODE_VERSION=20`. |
| Cloudflare Pages API auth error | Verify API token has `Cloudflare Pages: Edit` permission. Fall back to dashboard UI. |
| "A project with this name already exists" | The existing project is a Direct Upload project (created by a prior API call). Delete it via API (`DELETE /accounts/{id}/pages/projects/{name}`), then recreate from the Cloudflare dashboard using Connect to Git. |
| Pages project won't connect to GitHub / error `8000069` | The project is a Direct Upload project. The `PATCH source:` endpoint cannot convert it. Delete and recreate from the dashboard. |
| `git push` goes to `master` not `main` | You forgot `git branch -m master main` after `git init`. Run it now, then force-push: `git push -u origin main`. |
| `npm install` EACCES permission error | Use `npm install --cache /tmp/npm-cache` to bypass the cache permission issue. |
| Fewer than 6 verifiable companies | Tell user; ask whether to proceed with fewer or research adjacent sub-niches. |
| Domain not yet purchased | Skip DNS steps; note `*.pages.dev` URL; remind user to add custom domain later. |
| Two companies share a slug | Append suffix to the second (e.g. `-inc`, `-group`); ensure URL-safe. |
| `SERVICE_LABELS` key missing | Every string in every company's `badges` array must have a matching key in `SERVICE_LABELS`. Add missing keys. |
| TODO found in deployed page | Trace to source file, fill in real content, commit, push. |

---

## Quality Gate — Do Not Mark Done Until All Pass

**Build & content integrity**
- [ ] `npm run build` exits 0 with zero TypeScript or Astro errors
- [ ] `grep -n "TODO" src/config.ts` returns zero results
- [ ] `grep -n "TODO" src/pages/index.astro` returns zero results
- [ ] `ls vercel.json` returns "No such file"
- [ ] All `SERVICE_LABELS` keys in `src/lib/companies.ts` have a matching entry in at least one company's `badges` array
- [ ] `hasCap()` function keys in `comparisons/[slug].astro` are niche-specific (no TODO placeholders)
- [ ] `allTech` array in `comparisons/[slug].astro` is niche-specific (no TODO placeholders)

**Data quality**
- [ ] All company ratings have ≥ 0.8 spread across the list
- [ ] No two companies have identical `pros` or `cons` entries
- [ ] All unverifiable facts tagged `(per company website; independently unverifiable)`
- [ ] `CLAUDE.md` "Known verified facts" contains only the new niche's companies
- [ ] `CLAUDE.md` "Rating logic" dimension winners reference the new companies

**Deployment**
- [ ] `sitemap-index.xml` accessible on the live `.pages.dev` URL
- [ ] At least 3 live pages spot-checked: home, 1 company profile, 1 comparison
- [ ] 404 page description references new niche
- [ ] GitHub remote has the clean commit and auto-deploy is active
- [ ] Cloudflare Pages project is connected and first build succeeded

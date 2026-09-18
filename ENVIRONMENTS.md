# Environments — RBC Sites (Edge Delivery Services)

Owner: EDS platform team · Repo: `mujtsa/rbc-sites` · Content: da.live

## Model: two independent pipelines

Edge Delivery promotes **code** and **content** on separate tracks. An
"environment" is the pairing of a **Git branch** (code, via AEM Code Sync) with a
**da.live content source** (content), fronted by a **CDN hostname**. There is no
single "environment" switch — you promote each axis independently.

- **Code** → Git branches. Code Sync gives every branch its own hosts:
  `{branch}--rbc-sites--mujtsa.aem.page` (preview) and `…aem.live` (published).
- **Content** → da.live. Each doc moves Preview (`.aem.page`) → Publish (`.aem.live`)
  via `admin.hlx.page`.

## Topology: B — two content sources split across the ladder (bank-grade)

Two da.live sources. **dev + qa** share a lower/non-prod source for authoring and
review; **stage + prod** share the prod source. Content authored in the lower
source is *promoted* into the prod source on sign-off — at which point it becomes
visible on **stage** (stage previews the prod source), giving a final code+content
check before it goes live on `main`.

| Env | Branch | Code hosts | Content source (da.live) | Domain / access |
|-----|--------|-----------|--------------------------|-----------------|
| **dev**   | `dev`   | `dev--rbc-sites--mujtsa.aem.{page,live}`   | `mujtsa/rbc-sites-nonprod` (lower) | internal, noindex |
| **qa**    | `qa`    | `qa--rbc-sites--mujtsa.aem.{page,live}`    | `mujtsa/rbc-sites-nonprod` (lower) | `qa.` host, access-gated |
| **stage** | `stage` | `stage--rbc-sites--mujtsa.aem.{page,live}` | `mujtsa/rbc-sites` (prod) | `stage.` host, access-gated |
| **prod**  | `main`  | `main--rbc-sites--mujtsa.aem.live`         | `mujtsa/rbc-sites` (prod) | `www.rbcroyalbank.com` |

**Content-source binding:**
- Lower source `mujtsa/rbc-sites-nonprod` → **dev**, **qa**
- Prod source `mujtsa/rbc-sites` → **stage**, **prod (main)**

> **Implication:** stage reads *production* content, so stage is for final **code**
> validation against real content — not for staging risky **content**. Content is
> authored/reviewed in the lower source (dev/qa) and promoted into the prod source;
> once promoted, it appears on stage's preview before publishing to `main`.
>
> Until the Config Service bindings below are applied, every branch reads the
> **prod** source (`mujtsa/rbc-sites`) — i.e. dev/qa are not yet pointed at the
> lower source. Applying the per-env content-source config is what activates this.

## Code promotion (Git)

```
feature/*  →  dev  →  qa  →  stage  →  main (prod)
```

- Promote via PR up the ladder; each merge ships code to that env only.
- A PR is not reviewable without a working preview link for the target branch:
  `https://{branch}--rbc-sites--mujtsa.aem.page/{path}`.
- Never commit content HTML from this repo (content lives in da.live).

## Content promotion (da.live)

1. Authors edit in the **lower** source (`mujtsa/rbc-sites-nonprod`).
2. Preview + review on `dev` / `qa` hosts (which read the lower source).
3. On sign-off, **promote docs into the prod source** (`mujtsa/rbc-sites`) — copy the
   page(s) into the matching prod path.
4. Preview + review on **stage** (stage reads the prod source) as the final
   code+content check, then **Publish** to go live on `main` / `www`.

Preview / publish (credentials are injected by the harness opt-in; never paste tokens):
```
# preview
curl -X POST "https://admin.hlx.page/preview/mujtsa/rbc-sites/{branch}/{path}"
# publish (live)
curl -X POST "https://admin.hlx.page/live/mujtsa/rbc-sites/{branch}/{path}"
```

## One-time provisioning (console — not in this repo)

These are done in da.live + the Config Service (tools.aem.live), not via git:

1. **Lower content source** — create the `mujtsa/rbc-sites-nonprod` da.live
   folder/org; seed it from the current prod content.
2. **Per-env content-source binding** — in the Config Service, point `dev` and `qa`
   at `rbc-sites-nonprod` (lower); point `stage` and `main` at `rbc-sites` (prod).
3. **CDN + domains** — map `www.rbcroyalbank.com → main`; `stage.` / `qa.` (and dev
   if desired) → their branches, behind access control.
4. **SEO / access** — keep all non-prod hosts `noindex` (the `.aem.page`/`.aem.live`
   defaults already send `robots: noindex`) and access-gated so QA/stage never gets
   crawled or publicly reachable.
5. **Config as code** — keep each site's config (content source, CDN, redirects,
   404) versioned in the Config Service; do not hand-edit prod.

## Status

- [x] Long-lived branches `dev`, `qa`, `stage` created from `main`; Code Sync hosts
      provisioned and serving content (HTTP 200 on a real content path).
- [ ] Lower da.live content source (`rbc-sites-nonprod`) created + seeded.
- [ ] Config Service content-source bindings: dev/qa → lower; stage/main → prod.
- [ ] CDN domains + access control for non-prod + prod.
- [ ] Branch-protection / promotion PR gates on `dev`→`qa`→`stage`→`main`.

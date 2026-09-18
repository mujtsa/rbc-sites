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

## Topology: B — isolated non-prod content (bank-grade)

Non-prod authoring happens in a **separate da.live source** and is *promoted* into
the prod source on sign-off, so non-prod authoring never touches prod content.

| Env | Branch | Code hosts | Content source (da.live) | Domain / access |
|-----|--------|-----------|--------------------------|-----------------|
| **dev**   | `dev`   | `dev--rbc-sites--mujtsa.aem.{page,live}`   | `mujtsa/rbc-sites-nonprod` | internal, noindex |
| **qa**    | `qa`    | `qa--rbc-sites--mujtsa.aem.{page,live}`    | `mujtsa/rbc-sites-nonprod` | `qa.` host, access-gated |
| **stage** | `stage` | `stage--rbc-sites--mujtsa.aem.{page,live}` | `mujtsa/rbc-sites-nonprod` (final sign-off) | `stage.` host, access-gated |
| **prod**  | `main`  | `main--rbc-sites--mujtsa.aem.live`         | `mujtsa/rbc-sites` (prod)  | `www.rbcroyalbank.com` |

> Until the Config Service overrides below are applied, every branch reads the
> **prod** content source (`mujtsa/rbc-sites`). Standing up the non-prod source and
> per-branch content-source overrides is what actually activates Topology B.

## Code promotion (Git)

```
feature/*  →  dev  →  qa  →  stage  →  main (prod)
```

- Promote via PR up the ladder; each merge ships code to that env only.
- A PR is not reviewable without a working preview link for the target branch:
  `https://{branch}--rbc-sites--mujtsa.aem.page/{path}`.
- Never commit content HTML from this repo (content lives in da.live).

## Content promotion (da.live)

1. Authors edit in the **non-prod** source (`mujtsa/rbc-sites-nonprod`).
2. Preview + review on `dev`/`qa`/`stage` hosts (which read non-prod).
3. On sign-off, **promote docs into the prod source** (`mujtsa/rbc-sites`) — copy the
   page(s) into the matching prod path, then Preview + Publish against `main`.

Preview / publish (credentials are injected by the harness opt-in; never paste tokens):
```
# preview
curl -X POST "https://admin.hlx.page/preview/mujtsa/rbc-sites/{branch}/{path}"
# publish (live)
curl -X POST "https://admin.hlx.page/live/mujtsa/rbc-sites/{branch}/{path}"
```

## One-time provisioning (console — not in this repo)

These are done in da.live + the Config Service (tools.aem.live), not via git:

1. **Non-prod content source** — create the `mujtsa/rbc-sites-nonprod` da.live
   folder/org; seed it from the current prod content.
2. **Per-env content-source override** — in the Config Service, point the `dev`,
   `qa`, `stage` sites/configs at `rbc-sites-nonprod`; leave `main` on prod.
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
- [ ] Non-prod da.live content source created + seeded.
- [ ] Config Service content-source overrides (dev/qa/stage → non-prod).
- [ ] CDN domains + access control for non-prod + prod.
- [ ] Branch-protection / promotion PR gates on `dev`→`qa`→`stage`→`main`.

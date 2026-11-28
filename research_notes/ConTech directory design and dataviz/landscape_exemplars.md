# Landscape Exemplars: Industry Landscape Maps and Company Directory Sites

Note on method: network access in this session was restricted. Only github.com / raw.githubusercontent.com and web search worked. Direct fetches of mad.firstmark.com, landscape.cncf.io/cncf.io, cemexventures.com, cbinsights.com, nymbl-report.pages.dev, and contechroundup.substack.com all failed (DNS blocked). Many UX observations therefore rest on search snippets and the landscape2 README, and are flagged where unverified.

## Which sites are widely praised and what specific UI patterns do they use?

### Takeaway
The CNCF Landscape (built with landscape2) is the reference implementation of an interactive landscape. It uses a logo wall grouped by category and subcategory, a card-mode alternative, rich item detail data, embeddable category views, a stats page, a guide, and CSV/JSON export. The MAD Landscape pairs a static PDF/image map with a separate searchable site that has "data cards". Commercial databases (CB Insights, Crunchbase, Dealroom, Tracxn) could not be inspected in this session.

### Cited Findings
- landscape2 generates static websites from YAML data sources (`data.yml`, `settings.yml`, `guide.yml`, `games.yml`), with logos (SVG recommended) loaded from a path or a URL — [landscape2 GitHub](https://github.com/cncf/landscape2)
- Settings control branding, colors, "how to group items or which ones should be featured" — [landscape2 README](https://raw.githubusercontent.com/cncf/landscape2/main/README.md)
- Embeddable views: other sites can embed the items of one or more categories or subcategories. Embed code is generated at `/embed-setup`, with optional iframe-resizer for auto height — [landscape2 README](https://raw.githubusercontent.com/cncf/landscape2/main/README.md)
- Kiosk/mobile single-item page: `kiosk.html?item=<id>` shows one project "in a layout suited to kiosk screens and mobile devices" — [landscape2 README](https://raw.githubusercontent.com/cncf/landscape2/main/README.md)
- Data export: a JSON API under `api/`, `items.csv`, `projects.csv`, `projects.md`, and a downloadable PNG/PDF screenshot of the landscape (rendered with headless Chrome) — [landscape2 GitHub](https://github.com/cncf/landscape2)
- Single-page app routes include `/guide` and `/stats`. Optional enrichment pulls GitHub and Crunchbase data (cached 7 days) — [landscape2 GitHub](https://github.com/cncf/landscape2)
- Overlay preview: query params (`overlay-data`, `overlay-settings`, etc.) apply alternative data to a deployed site, which is useful for previewing PRs (experimental) — [landscape2 README](https://raw.githubusercontent.com/cncf/landscape2/main/README.md)
- The CNCF landscape has a card mode, with URLs such as card-mode sorted by latest commit. It filters and sorts hundreds of items and shows details such as GitHub stars, funding, first/last commit, contributors and HQ (search snippets, not verified directly) — [cncf/landscape GitHub](https://github.com/cncf/landscape)
- Several other foundations reuse the same generator, e.g. LF AI and CD Foundation landscapes — [lfai-landscape issue](https://www.github.com/lfai/lfai-landscape/issues/678); [cdf-landscape issue](https://www.github.com/cdfoundation/cdf-landscape/issues/75)
- MAD 2025 (11th edition since 2012) ships three things: a static market map PDF, a long-form essay, and an "interactive version (searchable, with data cards)" at mad.firstmark.com — [FirstMark](https://firstmark.com/story/bubble-build-the-2025-mad-machine-learning-ai-data-landscape/); [MAD 2025 PDF](https://www.mattturck.com/landscape/mad2025.pdf)
- MAD grew from 1,416 logos (2023) to 2,011 (2024), which illustrates logo-wall density problems at scale — [mattturck.com MAD 2024](https://mattturck.com/mad2024/)
- CB Insights construction tech map: 100+ startups across 13 categories, with an "editable version" inside its paid Construction Tech Collection (search snippet) — [CB Insights](https://www.cbinsights.com/research/construction-tech-startups-market-map-expert-intelligence/)

### Inferences
- Canonical pattern stack: a category-grouped logo wall (overview), toggled to cards (scan), plus a click-through detail modal or drawer, faceted filters, and URL-encoded state. This holds for the CNCF and is implied for MAD by "data cards". The detail modal and URL filter state are what CNCF users commonly share, but this was not verified in this session.
- A "dual-format" release (static PNG/PDF for social sharing, plus an interactive site) is standard. landscape2 automates the PNG/PDF export.
- For about 50 companies, a logo wall is very readable and density is no issue. Cards with description text add more value than logos alone.

### Gaps
- Could not inspect Crunchbase, Dealroom, Tracxn, a16z market maps, or Notion/Airtable directories (sites blocked or not searched). Their filter/comparison/detail page patterns are unverified here.
- No design write-ups or user praise quotes were retrieved.

## How do contech/AECO landscape maps present companies today, and where do they fall short?

### Takeaway
Contech maps are overwhelmingly static artifacts: images in blog posts, PDFs, LinkedIn graphics, or report slides. They are often gated or tied to annual lists. No interactive, filterable contech landscape from Nymbl, Foundamental, Cemex, Zacua or Brick & Mortar was found.

### Cited Findings
- Cemex Ventures publishes an annual "Top 50 Contech Startups" list (7th edition in 2026) as a report, and a 2026 "Construction Cleantech Map" — [Cemex Ventures](https://www.cemexventures.com/?p=112200); [Cemex Cleantech Map](https://www.cemexventures.com/?p=113177); [World Cement](https://www.worldcement.com/europe-cis/11022026/)
- Cemex's startup competition uses verticals such as Preconstruction Tech and Jobsite Productivity, which could serve as a taxonomy reference — [Cemex Ventures](https://www.cemexventures.com/?p=113325)
- Nymbl Ventures publishes quarterly ConTech market reports and a "Built Environment VC Landscape" web report (2,100+ companies, 4,000+ deals) with chart-style content. Sources give conflicting labels for its three segments (building / infrastructure / construction tech) — [Nymbl report](https://nymbl-report.pages.dev/built-environment-2026/); [Construction Dive](https://www.constructiondive.com/news/ai-robotics-built-environment-funding-nymbl/805304/)
- Zacua Ventures with Leonard (VINCI) published a LatAm construction tech report as a PDF mapping 250+ startups — [Leonard PDF](https://leonard.vinci.com/wp-content/uploads/2026/06/LatAm-Report-Construction-Tech-opportunity__Final-ENG.pdf)
- ConTech Roundup's "2025 Construction Tech Opportunity Map" is a Substack post about where insiders want more startups — [ConTech Roundup](https://contechroundup.substack.com/p/2025-construction-tech-opportunity)
- LinkedIn contech maps are typically personal samples. For example, one map of 30 startups is explicitly "a sample… for my own hypotheses" — [LinkedIn (Kogan)](https://ru.linkedin.com/in/mark-m-kogan-92b80052)
- Foundamental publishes perspectives and community letters rather than a public interactive map (none found) — [Foundamental](https://www.foundamental.com/perspectives/streaming-our-new-community-letter-the-next-5-years-of-foundamental-and-aec-tech)
- CB Insights keeps its editable/full construction map behind a paid collection — [CB Insights](https://www.cbinsights.com/research/construction-tech-market-map-company-list/)

### Inferences
- Shortcomings of the static format: logos can't be searched or clicked, there are no descriptions or links, maps go stale after the annual release, there is no filtering by customer type or project phase, they are unreadable on mobile, data can't be downloaded, and access is gated or paywalled.
- That leaves an opening for a free, weekly-updated, filterable, open-data contech directory. Its distinctive facets (customer type and project phase) are things AECO buyers think in, and VC maps don't offer them.

### Gaps
- Could not view the actual Cemex, Nymbl or CB Insights maps to confirm whether any interactive layer exists or how gating works (domains blocked).
- Brick & Mortar Ventures: no landscape artifact found.

## What open-source tools/frameworks power these?

### Takeaway
landscape2 (Rust CLI, static SPA output, GitHub Pages compatible) is the dominant open-source generator. It is the successor to the original CNCF interactive landscape (2018). For a ~50-item single-file site, borrowing its patterns in vanilla JS is likely simpler than adopting it.

### Cited Findings
- landscape2 provides `new`, `build`, `serve`, and experimental `deploy s3` subcommands, plus a container image for CI. It can be hosted on any static host including GitHub Pages, with `base_path` for subpaths — [landscape2 GitHub](https://github.com/cncf/landscape2)
- The CNCF landscape was migrated to landscape2. The earlier "Cloud Native Landscape 2.0 interactive edition" launched in 2018 — [lfai issue](https://www.github.com/lfai/lfai-landscape/issues/678); [CNCF blog 2018](https://www.cncf.io/blog/2018/03/08/introducing-the-cloud-native-landscape-2-0-interactive-edition/)
- Forks and reuse: many orgs fork cncf/landscape (e.g. northflank, redkubes) — [northflank/landscape](https://github.com/northflank/landscape); [redkubes/landscape](https://github.com/redkubes/landscape)

### Inferences (patterns to port to the single index.html + CSV/JSON site)
- Category-grouped logo/card wall with per-category color, toggled to a card or table view.
- Faceted filters (category, subcategory, customer type, project phase, funding stage, HQ region) with counts, plus text search. Serialize state to URL query params so filtered views are shareable (the same idea as landscape2's embed and kiosk URLs).
- Detail drawer or modal with a deep link (`?company=slug` or `#slug`): description, tags, website and LinkedIn links, date added.
- "New this week" badge or sort driven by `date_added`, which suits weekly updates.
- Data download: link to the raw CSV/JSON in the repo, and optionally "download filtered as CSV".
- Embeddable category view via an `?embed=1&category=X` minimal layout.
- Submission flow: GitHub issue form template or PR to the CSV, the same PR-based model CNCF uses. A Google Form or Tally form is the non-technical alternative.
- Static PNG export of the map for LinkedIn sharing, which matches the dual-format practice.
- Mobile: collapse filters into a sheet and use a single-column card list in place of a dense logo wall.

### Gaps
- landscape2's exact filter UI, URL-param schema for filters, and comparison features could not be confirmed from the README or by visiting landscape.cncf.io.
- Other tools (Airtable/Softr, Notion + Super, Webflow CMS directories) were not researched.

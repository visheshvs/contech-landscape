# Tech stack for a static, visual company-database site (GitHub Pages)

Context: solo maintainer, weekly updates, currently one docs/index.html, target 500-2000 companies. Research done 2026-11-28 with a limited budget (about 10 searches); several items rest on community or vendor-adjacent sources and are flagged.

## Charting libraries (size, interactivity, CDN without build step)

### Takeaway
Observable Plot is the lightest capable option for concise exploratory charts. ECharts is heavier but has the most built-in interactivity. Vega-Lite gives declarative JSON specs but needs the Vega runtime on top. All three load from CDN without a build step. Published size figures come from mixed methods and are only indicative.

### Cited Findings
- Observable Plot measured at about 83-92 KiB in a cold-page bundle, Apache ECharts at about 153-173 KiB (full build), Vega-Lite at 87 KB gzip *excluding* the Vega runtime. Note that TanStack, which ran the benchmark, makes a competing library. — [TanStack Charts comparison](https://tanstack.com/charts/latest/docs/comparison)
- A vendor blog puts a modular ECharts import at about 186 KB and warns that bundle figures are upper bounds because modular imports are smaller in practice. — [ApexCharts, State of JS Charting 2026](https://apexcharts.com/blog/state-of-javascript-charting-2026)
- Simon Willison's comparison of Plot and Vega-Lite: both are concise, grammar-of-graphics style APIs. — [simonwillison.net](https://www.simonwillison.net/2021/May/4/plot-vega-lite)
- Vega-Lite alternatives roundups exist for 2025/2026 (Graphy, Galaxy); they're marketing-adjacent. — [Graphy](https://graphy.app/blog/vega-lite-alternatives); [Galaxy](https://www.getgalaxy.io/blog/vega-lite-alternatives-2025)

### Inferences
- For a landscape directory (bar/treemap/bubble counts by category, funding, region), Plot via ESM CDN is the lowest-friction choice. ECharts is the better choice if built-in tooltips, zoom, legend toggling and treemap/sunburst drill-down matter more than bytes.
- D3 makes sense only for bespoke visuals such as a custom landscape grid; it costs the most to maintain.
- Chart.js covers simple canvas bar and line charts. Plotly is heavy. Flourish embeds add no code but keep the data outside the repo pipeline, and their branding and limits depend on the plan.

### Gaps
- I found no verified 2026 bundle sizes for Chart.js, Plotly or D3 (bundlephobia not fetched). Flourish free-tier terms were not checked.

## Search and faceted filtering

### Takeaway
At 500-2000 records everything can run in memory in the browser. The proven pattern is ItemsJS for facets plus counts, with optional MiniSearch for full text, and filter state serialized into URL query params. Pagefind suits per-page static sites. Algolia is unnecessary at this scale.

### Cited Findings
- ItemsJS is a dependency-free JS faceted search engine for JSON datasets "up to 100K items". It ships UMD/ESM builds for client-side CDN use and covers facets, full text and pagination. — [ItemsJS README (jsDelivr)](https://cdn.jsdelivr.net/npm/itemsjs@2.4.4/README.md)
- A documented pattern pairs MiniSearch (full text) with ItemsJS: MiniSearch returns matching IDs, which are passed into ItemsJS for faceting. — [stereobooster/itemsjs minisearch-integration](https://github.com/stereobooster/itemsjs/blob/HEAD/docs/minisearch-integration.md)
- An adapter lets the Algolia InstantSearch UI widgets run against ItemsJS client-side, with no Algolia backend. — [instantsearch-itemsjs-adapter](https://classic.yarnpkg.com/en/package/instantsearch-itemsjs-adapter); [demo](https://github.com/unplatform-io/clientside-instantsearch-demo)
- Size: MiniSearch is about 5.9 kB gz and Fuse.js about 9.5 kB per one site; another gives Fuse about 4 KB and Orama about 22 KB. The sources conflict. — [devpick](https://devpick.pages.dev/fuse.js-vs-minisearch); [pkgpulse](https://www.pkgpulse.com/guides/fusejs-vs-flexsearch-vs-orama-client-side-search-2026)
- In Liam's project, Orama's search times were similar to Fuse.js in practice. Orama added 30-100 ms of pre-indexing at load and handled typos worse, while Fuse needs no indexing. — [Liam blog](https://liambx.com/blog/comparison-of-fuse-js-and-orama); [Liam ADR](https://liambx.com/docs/contributing/adr/20250205-use-fuse-js)
- Pagefind runs after any SSG build (Astro, Eleventy, Hugo...), supports filters with counts via `pagefind.filters()`, and uses AND logic by default with `any`/`not` operators. Version 1.5.0 introduced a new Component UI. — [Pagefind filtering docs](https://pagefind.app/docs/js-api-filtering/); [pagefind.app](https://www.pagefind.app)
- Eleventy usage is `npx pagefind --site "_site"` after the build. — [flaviocopes](https://flaviocopes.com/static-site-search-pagefind/)

### Inferences
- Recommended: load companies.json (about 2000 rows x about 1 KB, roughly 2 MB raw and a few hundred KB gzipped), then ItemsJS for facets (category, stage, region, tags), with Fuse.js or MiniSearch for name/description typo tolerance. Sync state to `URLSearchParams` and `history.replaceState` so filtered views can be shared.
- Pagefind is worth adding only once per-company HTML pages exist, as site-wide search. It's redundant with the in-memory engine for the main directory.

### Gaps
- No independent benchmark at 2000 records. At that scale any of these libraries should be fast (inference, not measured).

## Table/grid libraries

### Takeaway
Tabulator (MIT, vanilla JS, CDN-friendly) is the best fit for a no-build site that needs sorting, column filtering and CSV export. Grid.js is the light, simple option. AG Grid Community is the most powerful but heavier, and some features need a paid license. TanStack Table is headless and assumes a framework.

### Cited Findings
- AG Grid Community is capable for free, but pivot, integrated charts and Excel export require the Enterprise license. — [rv-grid 2026](https://rv-grid.com/blog/best-js-datagrid-in-2026); [CoreUI comparison 2026](https://coreui.io/compare/ag-grid-alternative/)
- Tabulator: MIT, vanilla JS working across frameworks, easy to start. — [npm-compare](https://npm-compare.com/ag-grid,gridjs,handsontable,mui-datatables,react-data-grid,react-table,tabulator-tables); [wpdatatables](https://wpdatatables.com/javascript-table-library)
- Grid.js is about 15 KB and not opinionated about styling. — [wpdatatables](https://wpdatatables.com/javascript-table-library)
- Caveat: rv-grid, CoreUI and Syncfusion are competing vendors.

### Inferences
- At 2000 rows, none of these libraries needs virtualization tuning. Tabulator's built-in header filters and download-to-CSV fit a "table view" tab with little code.

### Gaps
- I didn't verify current GitHub stars or exact minified sizes. TanStack Table was not researched further.

## Site generators/frameworks

### Takeaway
There are two sensible paths. (A) Keep plain HTML with Alpine.js plus CDN libraries for the directory, and add a small Node/Python script in GitHub Actions to generate per-company pages. (B) Move to Astro, which gives static per-company pages, Pagefind, OG images and RSS in one toolchain. Observable Framework is strong for data-heavy dashboards. CNCF landscape2 is a purpose-built option if you want the CNCF look.

### Cited Findings
- CNCF landscape2 is a CLI that builds an interactive landscape website as static HTML from data, settings, guide and logo files. It installs via Homebrew, a shell script or a container, has a `serve` preview, and GitHub Pages is suggested for hosting. Without GitHub/Crunchbase credentials some enriched data is missing. — [landscape2 mirror (gitee)](https://gitee.com/cncf/landscape2); [codeberg mirror](https://codeberg.org/SIVON/landscape2); [cncf/landscape](https://github.com/cncf/landscape)
- Observable Framework is an open-source static site generator. Its data loaders (any language) run at build time and their output is bundled into `dist`, which can be deployed to GitHub Pages. One project rebuilds every 2 hours via Actions. — [observablehq/framework](https://github.com/observablehq/framework); [forum thread](https://talk.observablehq.com/t/deploying-observable-framework-on-github-pages-with-r-and-python-as-data-loaders/9043); [Simon Willison](https://simonwillison.net/2024/Mar/3/interesting-ideas-in-observable-framework/)
- Framework repo activity was seen in April 2026, and Observable Cloud was deprecated in April 2025 while Framework stayed open source. I found no explicit 2026 maintenance statement. Forum threads question Observable's direction. — [release note 2025-04-15](https://observablehq.com/release-notes/2025-04-15-deprecating-observable-cloud); [forum](https://talk.observablehq.com/t/where-is-observable-going/10372)

### Inferences
- landscape2 gives the most "landscape" for the least code, but you'd adopt its YAML data format and its UI. Customizing it means forking Rust/SolidJS code, so it suits you only if the CNCF-style card grid is the desired end state.
- Astro is the most balanced for SEO pages, OG images and RSS. Eleventy is lighter and similar. Evidence.dev is SQL/BI-report oriented, less suited to a directory (not researched in depth).
- Alpine.js or htmx adds a little interactivity to the existing index.html with no build step. htmx assumes server endpoints, so Alpine fits static JSON better.

### Gaps
- Evidence.dev and Eleventy were not researched in depth. I didn't confirm Observable Framework's release cadence in 2026.

## Maps

### Takeaway
I did no fresh research here, so the following is general knowledge, not sourced. Leaflet with marker clustering is the simplest choice for HQ pins. MapLibre GL suits vector tiles and styling. A d3-geo or Plot choropleth by country is the cheapest "map" with no tiles at all. Geocode HQ strings once at build time and cache lat/lon in the data file.

### Cited Findings
- None gathered in this pass.

### Inferences
- With fewer than 2000 points, a Plot or d3-geo dot map on a world TopoJSON avoids tile-provider terms entirely.

### Gaps
- Leaflet/MapLibre sizes, tile-provider terms (OSM usage policy), and Nominatim's geocoding rate limits (about 1 req/s policy, unverified) all need checking.

## Per-company static pages, OG images, RSS, GitHub Actions

### Takeaway
Generating one HTML page per company at build time is straightforward in Astro (`getStaticPaths`). OG cards can be rendered at build time with Satori plus resvg or Sharp. A scheduled or on-push GitHub Actions workflow rebuilds and deploys to Pages.

### Cited Findings
- The common pattern is a static endpoint `src/pages/og/[...slug].png.ts` with `getStaticPaths`/`prerender = true`. Satori outputs SVG from a JSX-like tree, and resvg or Sharp converts it to PNG. Integrations exist (satori-astro, astro-og-image), but one author calls them limited. — [dev.to morellodev](https://dev.to/morellodev/generating-og-images-at-build-time-with-satori-and-astro-4b4b); [leyanlo](https://www.leyanlo.com/blog/how-my-astro-blog-generates-open-graph-images); [astro-og-image](https://github.com/tomaskebrle/astro-og-image)
- Observable Framework sites are rebuilt on a schedule via GitHub Actions in practice. — [forum](https://talk.observablehq.com/t/deploying-observable-framework-on-github-pages-with-r-and-python-as-data-loaders/9043)

### Inferences
- For weekly updates, use a workflow triggered on push to the data file plus a weekly cron. It would validate the JSON schema, generate pages, OG images, `feed.xml` (Astro has an official RSS package; not verified here) and search indexes, then deploy via `actions/deploy-pages`.
- An RSS "new this week" feed can be built by diffing the dataset against the previous commit, or from a `date_added` field.

### Gaps
- @astrojs/rss and the current GitHub Pages Actions specifics were not fetched. Build time for 2000 OG images was not measured.

## Performance at 500-2000 companies

### Takeaway
2000 records is small for in-memory client libraries (ItemsJS claims up to 100K). The main costs are JSON payload size, logo images and DOM rendering, not search.

### Cited Findings
- ItemsJS targets JSON datasets up to 100K items. — [ItemsJS README](https://cdn.jsdelivr.net/npm/itemsjs@2.4.4/README.md)
- Orama pre-indexing costs 30-100 ms at load, while Fuse needs none. — [Liam ADR](https://liambx.com/docs/contributing/adr/20250205-use-fuse-js)

### Inferences
- Keep a slim `index.json` (id, name, category, tags, logo URL, a few metrics) for the directory and put full details on per-company pages. Lazy-load logos (`loading="lazy"`), ship them as SVG or WebP sprites, paginate or virtualize card grids beyond a few hundred cards, and debounce search input.
- Precompute aggregates for charts at build time.

### Gaps
- No measured payload or Lighthouse figures for a comparable site.

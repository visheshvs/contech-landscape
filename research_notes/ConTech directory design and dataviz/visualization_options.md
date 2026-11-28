# Visualization options for a ConTech company directory

Context: about 50 companies now, growing to several hundred. Fields: multi-label category (~12), subcategory, customer types, project phases (5), funding text, HQ city/country, date_added. The site is a static GitHub Pages site. Research done late Nov 2026, with 7 searches and no full-page fetches, so claims rest on search-result summaries.

## Which visualizations work well with small multi-label categorical datasets?

### Takeaway
At 50 to 500 rows with roughly 12 overlapping categories, the strongest options are: matrix views (UpSet for category overlap, heatmaps for category x phase and category x customer), unit or dot charts where each company is one mark (a beeswarm for funding, a dot map for HQs), and the classic market-map logo grid. Treemaps, sunbursts, Sankeys and chords are all possible, but every one of them assumes each company belongs to exactly one category. Multi-label data breaks that assumption, because a company in two categories gets counted twice.

### Cited Findings
- The FT Visual Vocabulary groups more than 70 chart types into 9 kinds of relationship: deviation, correlation, ranking, distribution, change over time, magnitude, part-to-whole, spatial, flow. You pick the relationship your story is about first, then the chart. It has D3 templates on GitHub. Sources: [FT chart-doctor repo](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md), [EU data viz guide](https://data.europa.eu/apps/data-visualisation-guide/visual-vocabulary), [Tableau blog](https://www.tableau.com/blog/what-i-learned-recreating-financial-times-visual-vocabulary-tableau-94516)
- UpSet shows set intersections as a matrix with aligned bar charts. It can be sorted by intersection size. It works better than Venn diagrams once there are more than a few sets, it scales to about 20 to 30 sets, and it won the InfoVis 10-year Test of Time award in 2024. Sources: [Wikipedia](https://en.wikipedia.org/wiki/UpSet_plot), [Lex et al. 2014](https://vdl.sci.utah.edu/publications/2014_infovis_upset/), [UpSetR paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC5870712)
- A beeswarm shows every value as its own dot while still showing the shape of the distribution. Sources: [Flourish](https://flourish.studio/blog/what-is-a-beeswarm-plot/), [EU guide](https://data.europa.eu/apps/data-visualisation-guide/beeswarm-plots)
- ApexCharts' "Startup Funding" unit-chart demo moves 220 synthetic startups between a single cloud, funding-stage groups and sector groups, and can size dots by capital raised. It is a premium chart type and shows a watermark without a license. Source: [ApexCharts](https://apexcharts.com/javascript-chart-demos/unit-charts/startup-funding)
- The CNCF Landscape is an interactive market map you can filter and sort by funding, stars and similar fields. Its engine (cncf/landscapeapp) generates static sites and images, and other groups have forked it, such as the FinOps and LF AI landscapes. Sources: [cncf/landscapeapp](https://www.github.com/cncf/landscapeapp), [FinOps landscape](https://github.com/finopsfoundation/finops-landscape/blob/HEAD/README.md), [Netlify case study](https://www.netlify.com/blog/2020/06/04/how-cncf-enables-community-sourced-ecosystem-map-with-netlify-deploy-previews)
- The D3 gallery on Observable has reference notebooks for treemap, zoomable sunburst, Sankey, chord and directed chord diagrams, and about 147 examples in total. Sources: [D3 gallery](https://observablehq.com/@d3/gallery), [D3 charts collection](https://observablehq.com/@d3/-/collection/charts)

### Inferences
The menu below is ranked by how well each option fits this dataset. These are my judgments.
1. **Market-map logo grid (category > subcategory)**. This is the industry-standard layout, in the style of CNCF. It answers "who is in each space?" Pitfall: a company with several categories shows up several times, so mark the repeats or choose a primary category.
2. **Heatmap, category x phase (5 columns) and category x customer type**. It answers "where along the project lifecycle is coverage concentrated, and where is it thin?" Each cell is a count, and clicking a cell can filter the list. Pitfall: rows can sum to more than the number of companies. Label the cells "companies tagged with both".
3. **UpSet plot of category intersections**. It answers "which category combinations are common?" It is the honest way to show multi-label overlap. Pitfall: unfamiliar to general readers, so add a short explainer. Limit it to the top 15 to 20 intersections.
4. **Phase swimlane or lifecycle strip**. Five columns from Planning to Operations, with one company spanning every column it serves. It answers "end-to-end platforms vs. point solutions." Pitfall: companies with gaps in their phase coverage (non-contiguous phases) are hard to draw as a single bar.
5. **Funding beeswarm on a log scale, grouped by round**. It answers "how big are the rounds, and where are the outliers?" Pitfall: funding is stored as free text, so it needs parsing. Many companies will have no funding data, so show "undisclosed" as its own group.
6. **HQ dot map, plus country bar chart**. It answers "where are these companies based?" Pitfall: with a few hundred points, a choropleth mostly tells you where people live, and US/UK clusters overlap. Use clustered dots, or simply a ranked bar chart.
7. **Growth timeline: cumulative date_added and a weekly "new this week" changelog**. It answers "how fast is the directory growing, and what's new?" Pitfall: date_added is when the company entered the directory, not when it was founded or entered the market. Say so in the label.
8. **Sankey or alluvial, category > customer > phase**. It answers "how does each category flow to the customers and phases it serves?" Pitfall: with multi-label data the flows multiply, it becomes hairy above about 12 x 6 x 5 nodes, and it implies a sequence that isn't really there. Use it with caution.
9. **Treemap or sunburst**. Same multi-counting problem. Fine as a decorative overview if the sizes are computed from each company's primary category.
10. **Chord or force-directed co-occurrence network**. Visually striking, but weak for reading exact values. A heatmap shows the same co-occurrence information more clearly. Treat it as optional.

### Gaps
- I didn't fetch any Pudding examples or ConTech-specific market maps, such as investor ConTech maps. The catalogue sites (data-viz-catalogue) were not checked either.

## How to make them interactive and linked to filters

### Takeaway
Use one shared filter state (category, phase, customer, country) that every chart reads from and writes to. That gives click-to-filter and coordinated views with no backend. Mosaic/vgplot and Vega-Lite have built-in crossfilter selections. Observable Plot's brush support is limited.

### Cited Findings
- Linked brushing is a type of crossfiltering, where a selection in one chart filters the others. Source: [Observable blog](https://observablehq.com/blog/linked-brushing)
- Brush interaction in Plot was being developed in PR #1653, which highlights selected points and greys out the rest. One guide recommends dropping to raw D3 for more complex brushes. Sources: [PR #1653](https://github.com/observablehq/plot/pull/1653), [d3-power-tools](https://syntagmatic.github.io/d3-power-tools/skills/brushing/SKILL.md)
- Mosaic's `vg.Selection.crossfilter()` with `filterBy` links charts together. Source: [Mosaic crossfilter example](https://idl.uw.edu/mosaic/examples/crossfilter.html). For Vega-Lite, see the [Vega-Lite cross-filter example](https://observablehq.com/@vega/vega-lite-cross-filter-example).

### Inferences
- With a few hundred rows, filtering a JSON array in the browser is instant. Plain JS state plus Plot or D3 re-rendering is enough, and a heavier engine isn't needed.
- Storing the filter state in URL query parameters makes filtered views shareable, which fits a static GitHub Pages site.

### Gaps
- I didn't confirm whether the Plot brush PR has been merged as of late 2026.

## Accessibility and mobile considerations

### Takeaway
Every chart should have a text alternative, a "get the data" link or table, keyboard-reachable marks, and colorblind-safe palettes. On mobile, prefer heatmaps, bar charts and lists, and swap chord, Sankey and network diagrams for simpler views.

### Cited Findings
- Datawrapper's practice includes colorblind checks, automatic contrast, alt descriptions, a "Get the data" link, and setting the chart body to aria-hidden when custom alt text is provided. It later added keyboard navigation and dynamic font scaling. Sources: [Datawrapper accessibility](https://www.datawrapper.de/docs/how-we-make-sure-our-charts-maps-and-tables-are-accessible), [keyboard navigation update](https://www.datawrapper.de/blog/keyboard-navigation-dynamic-font-scaling), [alt text guide](https://www.datawrapper.de/docs/how-to-write-good-alternative-descriptions-for-your-data-visualization)
- Flourish has published accessibility improvements. MIT Vis has research on rich screen-reader experiences for charts. The Chartability audit method is covered in the EU guide. Sources: [Flourish](https://flourish.studio/blog/accessibility-improvements), [MIT](https://vis.mit.edu/pubs/rich-screen-reader-vis-experiences), [Chartability fast pass](https://data.europa.eu/apps/data-visualisation-guide/fast-pass-accessibility-audit-with-chartability)
- The EU guide shows Datawrapper charts changing their labels and ticks as the chart gets narrower. Source: [EU guide](https://data.europa.eu/apps/data-visualisation-guide/accessibility-in-datawrapper)

### Inferences
- A heatmap is a grid, so it can be marked up as a real HTML table, which is accessible by default. On a phone, transpose it: 5 phase columns fit, 12 category columns don't.
- Hover tooltips don't work on touch screens. Use tap-to-select plus a details panel instead.

### Gaps
- I found no source on how VoiceOver or TalkBack behave with SVG charts on phones.

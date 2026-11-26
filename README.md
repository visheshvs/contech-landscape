# ConTech Landscape

An open, weekly-updated database of **construction, preconstruction and design technology** companies: estimating, takeoff, BIM/5D, bidding and procurement, project controls, cost and risk, scheduling, field and site tech, and design automation.

- **Browse:** https://visheshvs.github.io/contech-landscape/
- **Data:** [`data/companies.csv`](data/companies.csv) and [`data/companies.json`](data/companies.json)
- **What changed:** [`CHANGELOG.md`](CHANGELOG.md)

## How it's maintained

Every week, new funding rounds, acquisitions and launches are pulled from public construction-tech news (mainly the *Last Week in ConTech* newsletter). Each company is checked against its own website, classified, and added here. Descriptions are written fresh in plain language, never copied from marketing copy, and each entry links to the public source it came from.

## Fields

| Field | Meaning |
|---|---|
| `company` | Company name |
| `description` | Short paraphrased summary of what they do |
| `funding` | Most recent funding signal reported (round, amount) |
| `category` / `category_ctr` | Product category; `category_ctr` is the newsletter's own label |
| `hq` | Country/HQ when known |
| `areas` | 1 = Conceptual & early-stage estimating, 2 = Design-to-cost / BIM, 3 = Cost tracking, risk & controls, 4 = Workflow, bidding & collaboration, 5 = Field & construction operations, 6 = Design & planning tools |
| `phases` | Project phases served: Design, Preconstruction, Construction, Operations |
| `cluster` | Finer-grained grouping |
| `source` | Public link to where the item was reported |
| `date_added` | Date added to this database (YYYY-MM-DD) |
| `needs_backfill` | `true` when the description or source still needs filling in |

## Contributing

Spotted an error or a missing company? Open an issue with a link to a public source.

## License

Data is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Please credit "ConTech Landscape" with a link to this repo.

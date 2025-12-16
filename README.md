# sfmc-qip

Interactive DE relationship graphs, query validation, and local AI for Salesforce Marketing Cloud — 100% offline.

Tired of SFMC's black-box queries breaking at 3am? sfmc-qip brings observability to your VS Code workflow:
- **DE Graphs**: See every relationship (joins, keys, automations) as an interactive viz.
- **Query Smarts**: Validate SQL, find field impacts, explain errors.
- **Local AI**: Generate/explain SQL with Llama 3.1 — no API keys, no cloud.

## 🚀 Quick Start (2 Minutes)
1. Install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=your-publisher.sfmc-qip) (coming soon!).
2. Open any SFMC project → Right-click a query file → "QIP: Show DE Graph".
3. Load sample tenant (included) or connect your org via Salesforce Extension Pack.

Works offline with sample data — perfect for devs without a live tenant.

## Features (Free Tier)
| Feature | What It Does |
|---------|--------------|
| DE Relationship Graph | Interactive viz of joins, keys, and query flows. |
| Schema Diffs | Spot changes in fields/types across snapshots. |
| Query Validator | Catch missing fields, bad joins, type issues before runtime. |
| Field Impact Search | "What queries touch SubscriberKey?" — instant results. |
| Local NL2SQL | "Write a query joining Sent and Opens" → Boom, done. |

Premium tier (coming): Real-time alerts, full lineage, auto-pause on fails.

## Built For
- SFMC devs sick of Query Studio's garbage validation.
- Agencies juggling 50 tenants.
- You (solo or team) — 100% open-source core.

## Install & Setup
- Requires [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) for auth.
- Local AI: Download Ollama + Llama 3.1 (optional, falls back gracefully).

## Roadmap
- Week 2: Ship DE graph MVP.
- Week 4: Add local AI.
- Week 6: Marketplace launch + first betas.

Star this repo if you're hyped. Feedback? Open an issue.

MIT License — Fork, contribute, build on it.

Made with ❤️ by @KannanC — [LinkedIn](www.linkedin.com/in/kannancpr)

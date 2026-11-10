# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript + Tailwind CSS, static client-side app, GitHub Pages deploy. Confirmed by the user; chosen for a zero-server, fast interactive catalog.

## Users

- Enterprise architects and technical decision makers choosing an official Alibaba Cloud agent for a concrete operating scenario.
- Agent developers and engineers who need OpenAPI/console entry points, skill install commands, and token-cost signals.
- Presales and internal teams who need a shareable, comparable reference for customer recommendations.
- Public visitors arriving from search or sharing who need to understand what the official agent catalog contains.

The first version serves all four; the selection workflow is the shared core.

## Product Purpose

Agent Landing turns Alibaba Cloud's official Agent Catalog into a decision surface: it lets a visitor search, filter, compare, and receive a recommendation across the 36 official agents and 328 official skills that the catalog exposes. Success means a visitor can go from an unclear need to a short, defensible shortlist in minutes, and can see exactly where each fact came from.

The catalog is a starting dataset, not the permanent boundary. The data layer is vendor- and source-agnostic so later catalogs can be added without rebuilding the interface.

## Positioning

The official catalog tells you what exists. Agent Landing tells you what fits: it joins the agent portfolio, the skill library, official feature/interface/billing facts, and a scenario-driven recommender into one explainable shortlist. It is an independent selection layer, not an Alibaba Cloud product.

## Operating Context

Visitors arrive with a role or a task, not a product SKU. They scan categories, narrow by budget and access mode, compare two or three candidates, then leave with a shortlist or an install command. The interface must work in Chinese and English, on desktop and mobile, and must remain useful as a static site with no backend.

## Capabilities and Constraints

- Data snapshot: 36 agents, 328 skills, 18 active top-level categories (22 raw skill groups including 4 empty), fetched 2026-11-10 from `agentcatalog.aliyun.com` public API.
- Agent fields available: Chinese/English name and description, category/subcategory, official feature sets, publish sites, supported interfaces, free/paid flag, billing note, OpenAPI configs, console links, likes, official usage guide.
- Skill fields available: Chinese/English name and description, category/subcategory, GitHub path, min/max token footprint, install count, likes, version, updated date, official install command.
- All retrieval, filtering, comparison, and recommendation run client-side; no account, no backend, no tracking.
- No invented ratings, benchmarks, customer claims, or prices. Paid/free follows the official `isPaid` field; billing wording comes from the catalog.
- The tool is independent and must state non-affiliation with Alibaba Cloud.
- The dataset is refreshable by a script that calls the same public API.
- Bilingual UI parity is required; English fields fall back to Chinese when absent.

## Brand Commitments

The user pinned the visual direction: IBM enterprise software / professional architect style — Carbon-like density, IBM blue as the signal color, IBM Plex for Latin type, square corners, and a restrained data-first surface. This is a visual constraint, not a claim of affiliation. The product is an independent, factual tool. Alibaba Cloud trademarks belong to their owner; the interface must not imitate Alibaba Cloud's official console or imply endorsement.

## Evidence on Hand

- Live official API responses sampled on 2026-11-10: `https://agentcatalog.aliyun.com/api/public/agents/search`, `/api/public/skills/search`, `/api/public/categories`, plus per-item detail endpoints.
- Verified totals: agents `total: 36`; skills `328`; 18 active top-level categories; 22 raw skill groups (4 empty).
- No testimonials, customer logos, benchmarks, or pricing tables exist; do not fabricate them.

## Product Principles

1. Truth first: every card traces to a catalog field or an official link; when data is absent, say so.
2. Narrow fast: search, category, budget, and access filters should turn 364 items into a shortlist in seconds.
3. Explain the recommendation: a suggested agent always shows why it matched, never an opaque score.
4. Bilingual parity: Chinese-first, English one click away, with the same information density.
5. Refreshable core: the snapshot and the fetch script are part of the product, not an afterthought.

## Accessibility & Inclusion

Keyboard-operable dialogs, filters, and compare tray; visible focus states; WCAG AA contrast; reduced-motion support; mobile layouts at 390px and desktop at 1440px. Chinese and English both supported.

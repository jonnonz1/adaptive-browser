---
title: "Why We're Building an Adaptive Browser"
date: 2026-03-26
tags: [vision, architecture, adaptive-ui]
---

# Why We're Building an Adaptive Browser

## The Problem: Server-Authoritative Presentation

For 30 years, the web has operated on a simple contract: the server decides what you see, and your browser faithfully renders it. Your "user agent" is really a server agent — it executes whatever HTML, CSS, and JavaScript the server sends down.

This made sense when the web was documents. But SaaS products aren't documents. They're interfaces to APIs. And every user of Stripe, Jira, Linear, GitHub, or HubSpot is forced into the same interface — regardless of their role, their workflow, or how they think.

A CFO and a support agent both use Stripe. One wants revenue dashboards and trend lines. The other wants a search bar and a refund button. They get the same UI.

## The Insight: APIs Are the Real Product

Behind every SaaS product is a set of APIs. The web UI is just one possible rendering of those APIs. What if the user's client — their browser — could understand those APIs directly and construct an interface that fits the user?

This is what we're building: an **Adaptive Browser**.

## How It Works

```
Server exposes APIs → Browser understands them → User preferences shape UI → Browser constructs it
```

Instead of navigating to `stripe.com/dashboard` and getting HTML, you navigate to `api.stripe.com`. The browser:

1. **Discovers** the service's capabilities via a new "UI Manifest" format
2. **Reads** your preferences (stored as YAML — human-readable, version-controllable)
3. **Generates** a bespoke UI using an LLM (via OpenUI) or deterministic rules
4. **Renders** it with native, GPU-accelerated components

The UI is constructed by the browser, for the user. The server provides data and capabilities. The client decides presentation.

## The Commercial Angle: Organizational Preferences

This isn't just a personal tool. Organizations have opinions about how their people interact with SaaS products:

- "All billing data must show the `private` field for compliance"
- "Destructive actions require confirmation — no exceptions"
- "Only table and list views — no kanban for production data"
- "Approval workflow required before closing issues tagged `needs-approval`"

Organization preferences layer on top of user preferences. Org admins define constraints and defaults. Users customize within those bounds. This is the enterprise value proposition.

## The Technology Stack

- **Tauri v2** — Native shell with Rust backend. All API calls go through Rust for security. No CORS issues. Encrypted token storage.
- **OpenUI** (openui.com) — LLM-driven UI generation. The model understands a component library and generates streaming UIs in a compact language that's 45-67% more token-efficient than JSON.
- **React** — OpenUI's rendering runtime. Our native component library (tables, forms, charts, kanban boards) is built in React.
- **YAML preferences** — Human-readable, diffable, version-controllable. Your UI preferences live in a file you own, not in some SaaS product's database.

## What We're Building First

Phase 1 targets GitHub's API:
- Navigate to `api.github.com`
- See your repos, issues, PRs, gists, and starred repos
- Your preferences control the view (table vs. cards vs. kanban), density, sorting, visible fields
- Switch between "developer" and "manager" preference profiles

The goal isn't to replace GitHub's UI. It's to prove that **the browser can own the presentation layer** when given an API and user preferences.

## What's Next

Follow along as we build this. Next posts cover:
- The **UI Manifest specification** — how services describe their capabilities
- The **YAML preference system** — how users and organizations control the experience
- **OpenUI integration** — how LLMs generate streaming UIs from component libraries

The web was supposed to be user-centric. We're making it that way.

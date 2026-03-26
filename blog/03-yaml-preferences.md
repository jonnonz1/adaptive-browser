---
title: "The YAML Preference System"
date: 2026-03-26
tags: [preferences, yaml, organization, commercial]
---

# The YAML Preference System

## Your UI Preferences Should Be a File You Own

Today, your UI preferences live in each SaaS product's database. Stripe remembers your dashboard layout. Jira remembers your board filters. GitHub remembers your theme. These preferences are:

- **Siloed** — each product stores its own, in its own format
- **Opaque** — you can't see, diff, or version-control them
- **Owned by the service** — not by you

In the Adaptive Browser, your preferences are a YAML file on your machine. You own it. You can read it, edit it, diff it, commit it, share it.

## Two Layers: User and Organization

### User Preferences

```yaml
version: "1"

identity:
  displayName: "Alex"
  role: developer

display:
  theme: dark
  density: compact
  fontSize: 13

defaults:
  listView: table
  detailView: split
  pageSize: 50
  dateFormat: relative

entities:
  repository:
    listView: table
    sortBy: pushed_at
    sortDirection: desc
    visibleFields:
      - name
      - description
      - language
      - stargazers_count
```

This is the CSS of the Adaptive Browser. It controls how things look and behave, across all services.

### Organization Preferences

```yaml
version: "1"

organization:
  name: "Acme Corp"
  id: "acme-corp"

constraints:
  display:
    theme:
      allowed: [light, dark]
    density:
      allowed: [compact, comfortable]
    fontSize:
      min: 12
      max: 18

  defaults:
    confirmDestructive:
      forced: true

requiredFields:
  repository:
    - name
    - owner
    - private
```

Organization preferences define the **guardrails**. They're the enterprise layer — the part that makes this commercially viable.

## The Merge Algorithm

Preferences merge in this order:

1. **Built-in defaults** — sensible starting point
2. **Organization preferences** — base layer with constraints
3. **User preferences** — customization within org bounds

The merge enforces constraints:

- **`forced`** values cannot be overridden. If the org forces `confirmDestructive: true`, every user gets confirmation dialogs on destructive actions.
- **`allowed`** lists clamp user choices. If the org allows `[table, list]` for `listView`, a user who prefers `kanban` gets the org's `default` instead.
- **`min/max`** bounds clamp numeric values. Font size 8? Clamped to the org's minimum of 12.
- **`requiredFields`** are unioned with user's `visibleFields`. If the org requires `private` to always be visible on repositories, it's always there — even if the user didn't list it.

## Why This Matters for Enterprise

SaaS products struggle with the tension between user customization and organizational control. The Adaptive Browser resolves it architecturally:

| Need | How It's Solved |
|------|----------------|
| Compliance: "Always show data classification" | `requiredFields` forces visibility |
| Security: "Destructive actions need confirmation" | `forced: true` constraint |
| Consistency: "Everyone uses table view for audit" | `allowed` list restricts view types |
| Accessibility: "Minimum font size 12px" | `min/max` constraints on fontSize |
| User happiness: "I like dark mode and compact density" | User prefs within org bounds |

An org admin distributes an `org.yaml` file (or it's fetched from a central config service). Users never touch it. They customize their own `user.yaml` within the bounds it defines.

## Per-Service Overrides

Users can also customize per-service:

```yaml
services:
  api.github.com:
    defaults:
      pageSize: 100
    entities:
      repository:
        sortBy: stargazers_count
```

"I want 100 items per page on GitHub, but 25 everywhere else." The preference system is layered: defaults → org → user → per-service.

## Workflows

Preferences can define workflows — sequences of actions composed from API primitives:

```yaml
workflows:
  - name: "Quick Triage"
    trigger: "issue.view"
    steps:
      - action: show_fields
        fields: [title, body, labels, assignee]
      - action: prompt_action
        options: [assign_to_me, add_label, close]
```

This is where user preferences become more than cosmetic. They shape the *flow* of interaction, not just the appearance.

## What's Next

The preference system is the core of the Adaptive Browser's value proposition. Next:
- **OpenUI integration** — how the LLM uses preferences to generate contextual UIs
- **Preference learning** — observing user behavior to suggest preference updates
- **Cross-service workflows** — preferences that span multiple APIs

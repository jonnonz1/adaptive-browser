---
title: "The UI Manifest Specification"
date: 2026-03-26
tags: [spec, ui-manifest, protocol]
---

# The UI Manifest Specification

## The Missing Layer

The web has OpenAPI for describing APIs. It has HTML for describing documents. But there's nothing in between — no standard way for a service to say "here's what I can do, semantically, for a human user."

OpenAPI tells you `GET /repos` returns an array of objects with `name`, `description`, `language` fields. But it doesn't tell you:
- This is a *list of repositories* (not just an array of JSON)
- Users typically want to *sort by last updated* and *filter by language*
- The primary action is to *navigate into* a repository
- Related capabilities include *issues* and *pull requests*

The **UI Manifest** fills this gap. It's a semantic layer between the raw API and the user interface.

## The Format

Services publish a UI Manifest at `/.well-known/ui-manifest.json`. Here's what it looks like:

```json
{
  "version": "1.0",
  "service": {
    "name": "GitHub",
    "description": "Code hosting and collaboration platform",
    "domain": "api.github.com"
  },
  "capabilities": [
    {
      "id": "repositories",
      "name": "Repositories",
      "description": "Browse, search, and manage code repositories",
      "category": "core",
      "endpoints": [
        {
          "operationId": "repos/list-for-authenticated-user",
          "path": "/user/repos",
          "method": "GET",
          "semantic": "list",
          "entity": "repository",
          "defaultView": "table",
          "alternateViews": ["cards", "list"],
          "sortableFields": ["name", "updated_at", "stargazers_count"],
          "groupableFields": ["language", "visibility"],
          "searchable": true,
          "actions": ["create", "delete", "star", "fork"]
        }
      ]
    }
  ]
}
```

## Key Design Decisions

### Capabilities, Not Endpoints

We group endpoints by business concept. "Repositories" is a capability that includes listing repos, viewing a single repo, creating repos, and deleting repos. This is how humans think — not in terms of HTTP verbs and URL paths.

### Semantic Types

Every endpoint has a `semantic` field: `list`, `detail`, `create`, `update`, `delete`, or `action`. This tells the UI generator what *kind* of interface to build without parsing the full OpenAPI spec. A `list` gets a table or card grid. A `detail` gets a structured view with sections. A `create` gets a form.

### The Service Suggests, The Browser Decides

`defaultView: "table"` is a suggestion from the service author. The user's preferences can override it. If the user prefers cards, they get cards. The manifest provides sensible defaults; the browser provides user sovereignty.

### Branding as a Hint

```json
"branding": {
  "primaryColor": "#0d1117",
  "accentColor": "#58a6ff"
}
```

The service can suggest colors and a logo. The browser can use them as accent colors within the user's chosen theme — or ignore them entirely if the user prefers a unified look.

## How Discovery Works

1. User navigates to `api.github.com` in the Adaptive Browser
2. Browser checks for `https://api.github.com/.well-known/ui-manifest.json`
3. If found, parses and uses it
4. If not found, falls back to bundled manifests (we ship them for popular APIs)
5. If no bundled manifest exists, falls back to OpenAPI spec auto-discovery

In Phase 1, we use bundled manifests. The vision is that services publish their own, just like they publish OpenAPI specs today.

## The Relationship to OpenAPI

The UI Manifest doesn't replace OpenAPI — it references it. The `openapi.url` field points to the full spec. The manifest adds the semantic layer on top:

- OpenAPI: "This endpoint returns objects with these fields and types"
- UI Manifest: "This is a list of repositories that users want to sort, search, and navigate into"

When the LLM generates a UI, it gets both: the manifest for semantic understanding, and the OpenAPI schema for the exact data shape.

## What's Next

The UI Manifest is version 1.0 of this spec. We expect it to evolve as we learn from real usage. Key areas for future work:

- **Real-time channels**: Describing WebSocket/SSE subscriptions for live updates
- **Relationships**: Richer entity relationship graphs for cross-entity navigation
- **Permissions**: Declaring which actions require which auth scopes
- **Custom components**: Services suggesting specific component types for specialized data (code diffs, geographic maps, etc.)

Next post: [The YAML Preference System](./03-yaml-preferences.md) — how users and organizations control the experience.

# Adaptive Browser

A purpose-built browser that constructs bespoke UIs from API specs and user/organizational preferences.

## The Idea

Instead of servers dictating what you see, **your browser constructs the interface you need** from the API's capabilities and your preferences.

```
Server exposes APIs → Browser understands them → Your preferences shape UI → Browser constructs it
```

## Architecture

- **Tauri v2** — Native shell with Rust backend. All API calls proxied through Rust for security.
- **React** — Frontend rendering via OpenUI's component system.
- **UI Manifest** — A new spec for services to describe their capabilities semantically.
- **YAML Preferences** — User + organization preferences that control the entire experience.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## Project Structure

```
├── src/                    # React frontend
│   ├── components/shell/   # Browser chrome (address bar, sidebar, status bar)
│   ├── components/adaptive/# OpenUI component library (DataTable, CardGrid, etc.)
│   ├── stores/             # Zustand state (navigation, auth, preferences)
│   ├── hooks/              # useAdaptiveUI orchestration hook
│   └── lib/                # Types, OpenUI library definition, prompt builder
├── src-tauri/              # Rust backend
│   ├── src/commands/       # Tauri commands (API fetch, auth, manifest, prefs, LLM)
│   ├── src/models/         # Data models (UI manifest, preferences)
│   └── src/services/       # Business logic (spec resolver, preference merger)
├── preferences/            # Default + example YAML preference files
└── specs/                  # JSON Schemas for manifest + preference formats
```

## Key Concepts

### UI Manifest
Services publish a `/.well-known/ui-manifest.json` describing their capabilities semantically — not just API endpoints, but what they mean for users. Currently ships with a bundled GitHub manifest.

### Preference Layers
1. **User preferences** (`user.yaml`) — theme, density, view types, per-entity overrides
2. **Organization preferences** (`org.yaml`) — constraints, required fields, forced values, allowed services

Org preferences define guardrails. Users customize within those bounds.

### Supported Services (Phase 1)
- **GitHub** (`api.github.com`) — Repositories, Issues, Pull Requests, Gists, Starred

## License
MIT

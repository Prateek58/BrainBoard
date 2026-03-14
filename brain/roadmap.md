---
title: BrainBoard Roadmap & Decision Log
status: active
type: Chore
team: Frontend
tags: [roadmap, planning]
---

# 🗺️ BrainBoard Project Roadmap

**Vision**: A portable, local-first AI command center — read your project's `/brain` folder as a Kanban board. No database, no cloud lock-in.

**Current Status**: 🟢 Phase 1 & 2 Complete | 🟡 Phase 3 In Progress

---

## 🚀 Next Up — Phase 3: Portability & Distribution

These are the three core goals remaining:

1. **[ ] Git Sync (Easiest Way)**
   - One-click "Sync to Cloud" button that runs `git add / commit / push` for the `/brain` folder
   - Git status LED indicator (green = synced, amber = pending changes)
   - See: `features/git-sync.md`

2. **[ ] Local Install via Electron (Easy Desktop App)**
   - Package BrainBoard as a native `.dmg` (Mac) / `.exe` (Windows) — no terminal needed
   - Native folder picker dialogs, auto-loads last project on launch
   - See: `features/local-install-electron.md`

3. **[ ] VPN-Only Access (Minimum Auth for Self-Hosted View)**
   - Lock the VPS deployment behind WireGuard or Tailscale VPN — no login/registration required
   - If you're on the VPN, you can see the dashboard; otherwise the URL is unreachable
   - See: `chores/vpn-access-setup.md`

---

## 🏁 Completed Phases

### Phase 1: Core Kanban Infrastructure ✅
* **Goal**: Local-first Kanban that reads Markdown files from a `/brain` folder.
* **Delivered**:
  - Sidebar with project switcher
  - Kanban swimlanes (To Do / In Progress / Done)
  - Drag-and-drop that writes status back to `.md` files
  - YAML frontmatter parsing for task metadata
  - Visual filtering by task type (Feature / Bug / Chore)
* **Decision**: Next.js app reading the local filesystem directly for portability.

### Phase 2: Dynamic Customization & Task Detail ✅
* **Goal**: Make the board fully configurable and task editing rich.
* **Delivered**:
  - Custom task types (name + color) via `config.json`
  - Custom Kanban columns (add/rename/remove)
  - Safe deletion modals (ConfirmationModal pattern)
  - Task detail modal with Notion-like split-view Markdown editor & preview
  - Resizable modal with live markdown rendering
* **Decision**: `config.json` as the dynamic schema for multi-project flexibility.

### Phase 3: Self-Documentation (Using BrainBoard to manage BrainBoard) ✅ (Partial)
* **Goal**: The `/brain` folder becomes the source of truth for this project itself.
* **Delivered**:
  - `/brain` folder structure established with real Gherkin feature docs
  - `_system-architecture.md` as AI agent onboarding guide
  - `roadmap.md` as the living project plan (this file)
* **Remaining**: Git Sync, Electron packaging, VPN setup (see Phase 3 Next Up above)

---

## 📜 Decision Archive

### [2026-03-03] Why Gherkin for Features?
Gherkin (Given/When/Then) bridges business logic and code. It lets AI agents understand the *why* and *how* of a feature before writing code, reducing hallucinations and misalignment.

### [2026-03-06] Local vs. Global Documentation
Moved the documentation into `/brain` at the project root to ensure portability — the docs travel with the code in the same Git repo and can be read by any AI agent from a clean checkout.

### [2026-03-09] Why VPN Instead of Login/Registration?
BrainBoard is a personal/team internal tool. A traditional auth system (JWT, sessions, OAuth) adds complexity and attack surface. VPN (Tailscale or WireGuard) is a network-level gate: simpler, more secure, and keeps the app itself stateless. No user table, no password reset flows, no frontend auth guards needed.

### [2026-03-09] Why Electron Instead of a CLI/Server?
The core user promise is "point it at a folder and go." Electron gives us native FS dialogs, OS integration, and a proper installable app — without the user ever touching a terminal. The Next.js UI runs inside Electron unchanged, preserving the dev stack.

- [x] Integrate OpenRouter API to auto-refine Feature task descriptions.

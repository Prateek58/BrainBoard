---
title: BrainBoard Roadmap & Decision Log
status: Done
type: Chore
team: Frontend
tags: [roadmap, planning]
---

# 🗺️ Project Roadmap

**Current Status**: 🟢 Phase 2 Complete | 🟡 Phase 3 In Progress
**Main Objective**: Establish BrainBoard as a self-documenting, local-first management tool.

---

## 🚀 Immediate Next Steps
1. [ ] **Git Synchronization UI**: Build the "Sync to Cloud" indicator and button.
2. [ ] **Sub-tasks Support**: Allow breaking down complex features into smaller checklists.
3. [ ] **Integrated Editor**: Add a rich text / markdown editor inside the task modals.

---

## 🏁 Completed Phases

### Phase 1: Core Kanban Infrastructure
* **Goal**: Local-first Kanban reading Markdown files.
* **Key Features**: Sidebar, Swimlanes, Drag-and-Drop, YAML parsing.
* **Decision**: Electron + Next.js for local FS access with modern UI.

### Phase 2: Dynamic Customization & Stability
* **Goal**: User-defined workflows and UI stabilization.
* **Key Features**: Custom Task Types/Colors, Custom Columns, Safe Deletion Modals.
* **Decision**: Dynamic `config.json` system for multi-project flexibility.

### Phase 3: Self-Documentation (Current)
* **Status**: Implementing Centralized Roadmap.
* **Goal**: Use BrainBoard to manage itself.
* **Focus**: `brain/` as source of truth, Gherkin features, centralized roadmap.

---

## 📜 Decision Archive

### [2026-03-03] Why Gherkin for Features?
Gherkin bridges business logic and code, helping AI agents understand the "Why" and "How" before implementation.

### [2026-03-06] Local vs. Global Documentation
Moved documentation into the project root (`/brain`) to ensure portability and version control.

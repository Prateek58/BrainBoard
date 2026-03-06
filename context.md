---
title: "START HERE: Master Project Context"
status: Done
type: Research
team: Core
tags: [master, context, ai-start]
---

# 🧠 BrainBoard Context Master

> [!IMPORTANT]
> **IF YOU ARE AN AI AGENT (e.g., Cursor, Antigravity): START HERE.**
> This file is the "Root of Truth" for the entire project. Do not make architectural changes without reading the linked docs below.

## 🗺️ Project Hierarchy (The Agent Chain)
To understand this project, you **must** follow this path in order:

1.  **Step 1: The Root** - You are here (`context.md`).
2.  **Step 2: The Technical Soul** - Read [`brain/_system-architecture.md`](file:///Users/prateekbhardwaj/Projects/BrainBoard/brain/_system-architecture.md). This defines *how* we build things and our strictly enforced patterns.
3.  **Step 3: The Direction** - Read [`brain/roadmap.md`](file:///Users/prateekbhardwaj/Projects/BrainBoard/brain/roadmap.md). This defines *what* we are building and our current progress.
4.  **Step 4: The Features** - Browse [`brain/features/`](file:///Users/prateekbhardwaj/Projects/BrainBoard/brain/features/) for Gherkin specifications of existing logic.

---

## 🚀 Quick Overview
BrainBoard is a local-first, self-documenting project management tool. It uses a structured `/brain` folder to store its own rules and plans.

### File Types:
*   **Features (`/brain/features/`)**: Markdown + Gherkin business logic.
*   **Chores & Bugs (`/brain/chores/`, `/brain/bugs/`)**: Markdown + Checklist.
*   **Roadmaps (`/brain/roadmap.md`)**: High-level milestones and decision logs.

---

(Archived previous examples below...)

**Feature Task Template**
```gherkin
Feature: Secure Dashboard Access
Scenario: A logged-in user accesses the dashboard
Given the user is logged in with a valid JWT token
When the user navigates to "/dashboard"
Then the API should only return data matching the user's ID
```
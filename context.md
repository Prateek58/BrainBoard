**Intro**:

I was using notion mcp server to feed data and context to cursor ai tool , which is token consuming and slow. I want to make local fist kanban i can use to feed context/info to cursor ai tools, by physically separating your features (which contain Gherkin business logic) from your chores (simple markdown checklists), we make it incredibly easy for our AI agent to know exactly where to look for architectural rules versus where to look for setup tasks., also i can run nextjs app to view the kanban and track progress..so local first app we can use for both, its faster for ai to understand tasks/features also easy for humans to see progress. git we can use to manage the file chages track, and may be gitapi use to automatically push comit to repository, so in caase i want to publish same to cloud hosted kanban. we also want a way to host the local data kanban app to centralized (all project views) app on hosting (vps), so its easier to work , no need of seperate tool like notion or trello.

Here is an analysis of the progression of your app idea and the final, consolidated master prompt you can feed directly into Cursor.

### Analysis & What Needed to Change

In reviewing your queries and Gemini's responses, your app's architecture evolved significantly from the initial concept:

1. **From Web App to Desktop App:** You initially wanted a local Next.js web app, but later clarified you wanted an installable application (like a `.exe` or `.dmg`) that you could use across multiple different projects without cluttering them. Therefore, the architecture was upgraded to an **Electron + Next.js hybrid**.
2. **From Root Folder to Dynamic Paths:** The original prompt told the AI to read a `/brain` folder at the *root of the Next.js app*. This had to be changed. The final prompt now instructs the app to use a "Project Selector" to pick arbitrary folders on your computer and read the `/brain` folder *inside those specific paths* using Electron's IPC (Inter-Process Communication).
3. **Manual vs. Automatic Sync:** You rightly pointed out that automatic syncing could be problematic. The design was updated to include a manual **"Sync to Cloud" button** with visual indicators (Amber/Red for pending, Green for synced) using `simple-git`.

Here is the finalized, hallucination-free prompt to copy and paste into Cursor's Composer or Chat.

---

### 📋 THE MASTER CURSOR PROMPT

> **System Goal:** Build a cross-platform (Mac & Windows) Desktop Kanban application using **Electron, Next.js (App Router), Tailwind CSS, and TypeScript**. The app acts as a unified command center and UI layer over local Markdown files spread across multiple user-selected project folders.
> 
> 
> **Core Tech Stack & Dependencies:**
> 
> - Framework: Next.js + Electron
> - UI/Styling: Tailwind CSS, `clsx`, `tailwind-merge`, `lucide-react`
> - Data Parsing: `gray-matter` (for YAML frontmatter)
> - Interactions: `@hello-pangea/dnd` (for drag-and-drop)
> - System/Backend: `electron-store` (for saving project paths), `simple-git` (for Git operations).
> 
> **1. Architecture & Multi-Project Management:**
> 
> - **The App Shell:** Build this as a standalone installable app (using `electron-builder`).
> - **Project Selector (Sidebar):** Implement a sidebar using `electron-store` to maintain a list of user-added project paths (e.g., `C:\Users\Prateek\LayerBiz`). Users can click "Add Project" to open a native OS folder picker.
> - **File Access:** Do NOT read from the app's root. Use Electron's `ipcMain` and `ipcRenderer` so the React frontend can read/write `.md` files from the `[SelectedProjectPath]/brain` directory dynamically when a project is clicked.
> 
> **2. Data Structure (Markdown-as-Database):**
> 
> - The database consists of `.md` files stored in subdirectories: `/brain/features`, `/brain/chores`, and `/brain/bugs` inside the selected project folder.
> - **Frontmatter Schema:** Every `.md` file must be parsed using `gray-matter` and expects this YAML structure: `title` (string), `status` (string: "To Do", "In Progress", "Done"), `type` (string: "Feature", "Bug", "Chore"), `team` (string), `tags` (array of strings).
> 
> **3. Kanban UI & Swimlane Rules:**
> 
> - **Board:** Build a Single-Swimlane Kanban board with columns: "To Do", "In Progress", "Done" based on the `status` attribute.
> - **Focus Filters:** Top toggle buttons for `Features`, `Chores`, and `Bugs` that dynamically filter the board based on the `type` attribute.
> - **Column Sorting:** Auto-sort cards within columns: `Features` at the top, then `Bugs`, then `Chores` at the bottom.
> - **Visual Hierarchy:** `Features` get a bold purple left border; `Bugs` are red; `Chores` are visually muted (gray backgrounds, lighter text).
> - **Drag-and-Drop:** Use `@hello-pangea/dnd`. When dropped, call the Electron backend to rewrite *only*the `status` field in that specific `.md` file's YAML frontmatter, preserving the markdown body intact.
> 
> **4. Git Integration (Manual Sync):**
> 
> - Add a "Sync to Cloud" button for the currently selected project.
> - Use `simple-git` to run a background `git status`.
> - **Visual Status Indicator:** Show a glowing indicator—Amber/Red if there are local unpushed changes, and Green once the user clicks the "Sync" button (which executes `git add`, `git commit`, and `git push`). Include a "Last Synced: [timestamp]" label.
> 
> **5. File Templates Generation:**
> 
> - Write a utility function so that when a user creates a new task via the UI, it automatically generates the correct Markdown boilerplate:
>     - **Features:** Must include a section for Gherkin syntax business logic.
>     - **Chores/Bugs:** Must include a standard markdown checklist format.
> - Also, auto-generate a `_system-architecture.md` file in the `/brain` folder of any new project with rules instructing future AI agents to only edit the frontmatter from `In Progress` to `Done` upon completing a task.

File examples

**A. Feature Task (Gherkin format) - Save in `/brain/features/`**

Markdown

- `--
title: User Authentication Logic
status: To Do
type: Feature
team: Backend
tags: [auth, security, core]
---### Context
We need to ensure users can only access their own dashboard data after logging in.
### Business Rules```gherkin
Feature: Secure Dashboard Access Scenario: A logged-in user accesses the dashboard Given the user is logged in with a valid JWT token When the user navigates to "/dashboard" Then the API should only return data matching the user's ID`

**B. Chore Task (Checklist format) - Save in `/brain/chores/`**

Markdown

- `--
title: Dockerize the .NET Backend
status: In Progress
type: Chore
team: DevOps
tags: [infrastructure, docker]
---### Context
Need to create a Dockerfile for the C# Minimal API.
### Implementation Tasks Write `Dockerfile`.
 Create `docker-compose.yml`.
 Test the container build locally.`

(if its easy to maintain  , implement a way so user can also add custom attribute other than type,team, tags( all these default ones, just like notion we can do, or easy to rename these existing )
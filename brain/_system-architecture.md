## 🤖 Agent Onboarding (Start Here)

If you are an AI assistant and this is a new session:
1.  **Context First**: Read `context.md` in the root. It points you here.
2.  **Architecture Second**: Read this file (`_system-architecture.md`). It defines our coding soul and strict patterns.
3.  **Roadmap Third**: Read `roadmap.md` to see where we are and what's next.

**Never start building WITHOUT reading these three. Breaking the pattern breaks the brain.**

## 🧠 The Documentation System

### 1. Features (`/brain/features/`)
* **Format**: Markdown with YAML frontmatter + **Gherkin business logic**.
* **Rule**: Every user-facing feature must be documented here using Given/When/Then scenarios.
* **AI Instruction**: When implementing or refactoring features, always update the relevant Gherkin file first.

### 2. Chores & Bugs (`/brain/chores/`, `/brain/bugs/`)
* **Format**: Markdown with YAML frontmatter + Checklist.
* **Rule**: Use for technical debt, setup tasks, and bug tracking.

### 3. Roadmaps & Plans (`/brain/roadmap.md`)
* **Format**: Markdown.
* **Rule**: Contains high-level project phases, future milestones, and an archive of critical design decisions.

## 🛠️ AI Agent Interaction Rules

1. **Task Lifecycle**: Only move tasks from `To Do` -> `In Progress` -> `Done` when the underlying code change is verified.
2. **Persistence**: Never remove YAML frontmatter.
3. **Consistency**: Always use the defined types (`Feature`, `Bug`, `Chore`) and statuses configured in `config.json`.
4. **Clean Code**: Follow the established React/Next.js/Electron patterns found in the codebase.

Note : After every implementation or code change:
- Append a summary to roadmap.md: Date, what was done, key decisions, next steps.
- Format: ## YYYY-MM-DD: [Feature] - [Brief desc]
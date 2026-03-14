export type TaskType = string;
export type TaskStatus = string;

export interface TaskTypeConfig {
    name: string;
    label: string;
    color: string;
    icon: string;
}

export interface KanbanTask {
    id: string;          // Filename without .md
    filepath: string;    // Absolute path
    title: string;
    status: TaskStatus;
    type: TaskType;
    order: number;       // Manual sort order within a column
    team?: string;
    tags: string[];
    content: string;     // The raw markdown content below the frontmatter
    customAttributes?: Record<string, any>; // For extra attributes
}

export interface ProjectConfig {
    id: string; // Random UUID or slug
    name: string;
    path: string; // Absolute path to project root
    lastSynced?: string;
}

export interface BrainBoardConfig {
    projects: ProjectConfig[];
    activeProjectId?: string;
    settings?: {
        taskTypes: TaskTypeConfig[];
        statuses: TaskStatus[];
        openRouterApiKey?: string;
    }
}

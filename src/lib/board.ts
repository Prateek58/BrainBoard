import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { KanbanTask, TaskStatus, TaskType } from '@/types';

export const getBrainFolder = (projectPath: string) => {
    // If the path already ends with 'brain', don't append it again
    if (projectPath.endsWith('/brain') || projectPath.endsWith('\\brain')) {
        return projectPath;
    }
    return path.join(projectPath, 'brain');
};

export const ensureBrainStructure = (projectPath: string) => {
    const brainDir = getBrainFolder(projectPath);
    const dirs = ['features', 'chores', 'bugs'];
    if (!fs.existsSync(brainDir)) {
        fs.mkdirSync(brainDir, { recursive: true });
    }
    dirs.forEach(dir => {
        const d = path.join(brainDir, dir);
        if (!fs.existsSync(d)) {
            fs.mkdirSync(d, { recursive: true });
        }
    });

    // Create system architecture file if it doesn't exist
    const sysArch = path.join(brainDir, '_system-architecture.md');
    if (!fs.existsSync(sysArch)) {
        fs.writeFileSync(sysArch, `# BrainBoard System Architecture\n\n- AI agents: Only edit frontmatter status from To Do -> In Progress -> Done upon completing a task.\n- All features should maintain Gherkin business logic formatting.\n- All chores/bugs should use structured markdown checklists.\n`, 'utf-8');
    }
};

const readMarkdownFile = (filePath: string): KanbanTask | null => {
    try {
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(rawContent);
        const filename = path.basename(filePath, '.md');

        // Default fallback values
        const status: TaskStatus = (data.status as TaskStatus) || 'To Do';
        const type: TaskType = (data.type as TaskType) || 'Chore';

        const { title, status: _status, type: _type, team, tags, order: _order, ...customAttributes } = data;

        return {
            id: filename,
            filepath: filePath,
            title: title || filename,
            status,
            type,
            order: typeof data.order === 'number' ? data.order : 0,
            team,
            tags: tags || [],
            content,
            customAttributes
        };
    } catch (err) {
        console.error(`Failed to read markdown file: ${filePath}`, err);
        return null;
    }
};

export const getAllTasks = (projectPath: string): KanbanTask[] => {
    const brainDir = getBrainFolder(projectPath);
    if (!fs.existsSync(brainDir)) return [];

    const tasks: KanbanTask[] = [];
    const walkDir = (currentPath: string) => {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith('_')) continue; // skip _system-architecture.md etc
            const fullPath = path.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                walkDir(fullPath);
            } else if (entry.isFile() && fullPath.endsWith('.md')) {
                const task = readMarkdownFile(fullPath);
                if (task) {
                    tasks.push(task);
                }
            }
        }
    };

    walkDir(brainDir);
    return tasks;
};

export const updateTaskStatus = (filepath: string, newStatus: TaskStatus) => {
    if (!fs.existsSync(filepath)) throw new Error('File not found');
    const rawContent = fs.readFileSync(filepath, 'utf-8');
    const { data, content } = matter(rawContent);
    data.status = newStatus;

    const updatedFile = matter.stringify(content, data);
    fs.writeFileSync(filepath, updatedFile, 'utf-8');
};

export const createNewTask = (
    projectPath: string,
    title: string,
    type: TaskType,
    team?: string,
    tags: string[] = [],
    customAttributes: Record<string, string> = {},
    initialContent?: string
) => {
    ensureBrainStructure(projectPath);

    const safeFilename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const dirName = type.toLowerCase() + 's'; // features, bugs, chores
    const folder = path.join(getBrainFolder(projectPath), dirName);

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    // Prevent duplicate filenames — append a numeric suffix if file already exists
    let finalFilename = safeFilename;
    let filepath = path.join(folder, `${finalFilename}.md`);
    let counter = 2;
    while (fs.existsSync(filepath)) {
        finalFilename = `${safeFilename}-${counter}`;
        filepath = path.join(folder, `${finalFilename}.md`);
        counter++;
    }

    let contentTemplate = '';
    if (initialContent !== undefined && initialContent.trim() !== '') {
        contentTemplate = initialContent;
    } else if (type === 'Feature') {
        contentTemplate = `### Context\nAdd context here.\n\n### Business Rules\n\`\`\`gherkin\nFeature: ${title}\n  Scenario: Default setup\n    Given ...\n    When ...\n    Then ...\n\`\`\``;
    } else {
        contentTemplate = `### Context\nAdd context here.\n\n### Implementation Tasks\n- [ ] Task 1\n- [ ] Task 2`;
    }

    const data = {
        title,
        status: 'To Do',
        type,
        order: -Date.now(),
        ...(team ? { team } : {}),
        ...(tags.length > 0 ? { tags } : {}),
        ...customAttributes
    };

    const fullContent = matter.stringify(contentTemplate, data);
    fs.writeFileSync(filepath, fullContent, 'utf-8');
    return filepath;
};

// Collect all existing tags and teams from tasks (for autocomplete)
export const getAllTagsAndTeams = (projectPath: string): { tags: string[]; teams: string[] } => {
    const tasks = getAllTasks(projectPath);
    const tagSet = new Set<string>();
    const teamSet = new Set<string>();
    for (const task of tasks) {
        if (task.tags) task.tags.forEach(t => tagSet.add(t));
        if (task.team) teamSet.add(task.team);
    }
    return {
        tags: Array.from(tagSet).sort(),
        teams: Array.from(teamSet).sort(),
    };
};

export const updateTask = (
    filepath: string,
    updates: {
        title?: string;
        status?: TaskStatus;
        type?: TaskType;
        order?: number;
        team?: string;
        tags?: string[];
        content?: string;
        customAttributes?: Record<string, any>;
    }
) => {
    if (!fs.existsSync(filepath)) throw new Error('File not found');
    const rawContent = fs.readFileSync(filepath, 'utf-8');
    const { data, content } = matter(rawContent);

    // Capture original type BEFORE mutating data, to detect type changes for file-move
    const originalType = data.type as TaskType;

    // Update frontmatter fields
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.type !== undefined) data.type = updates.type;
    if (updates.order !== undefined) data.order = updates.order;
    if (updates.team !== undefined) {
        if (updates.team) { data.team = updates.team; } else { delete data.team; }
    }
    if (updates.tags !== undefined) {
        if (updates.tags && updates.tags.length > 0) { data.tags = updates.tags; } else { delete data.tags; }
    }
    if (updates.customAttributes) {
        Object.assign(data, updates.customAttributes);
    }

    // Use updated content or keep existing
    const newContent = updates.content !== undefined ? updates.content : content;

    // Sanitize: remove any keys with undefined values (js-yaml cannot serialize undefined)
    for (const key of Object.keys(data)) {
        if (data[key] === undefined) {
            delete data[key];
        }
    }

    const updatedFile = matter.stringify(newContent, data);
    fs.writeFileSync(filepath, updatedFile, 'utf-8');

    // If type changed, move the file to the correct directory
    if (updates.type && updates.type !== originalType) {
        const brainDir = path.dirname(path.dirname(filepath));
        const newDir = path.join(brainDir, updates.type.toLowerCase() + 's');
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
        }
        const newPath = path.join(newDir, path.basename(filepath));
        if (newPath !== filepath) {
            fs.renameSync(filepath, newPath);
            return newPath;
        }
    }
    return filepath;
};

// Bulk update order for multiple tasks (used for within-column reordering)
export const reorderTasks = (orderedItems: { filepath: string; order: number }[]) => {
    for (const item of orderedItems) {
        if (!fs.existsSync(item.filepath)) continue;
        const rawContent = fs.readFileSync(item.filepath, 'utf-8');
        const { data, content } = matter(rawContent);
        data.order = item.order;
        const updatedFile = matter.stringify(content, data);
        fs.writeFileSync(item.filepath, updatedFile, 'utf-8');
    }
};

export const deleteTask = (filepath: string) => {
    if (!fs.existsSync(filepath)) throw new Error('File not found');
    fs.unlinkSync(filepath);
};

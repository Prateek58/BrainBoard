import fs from 'fs';
import path from 'path';
import os from 'os';
import { BrainBoardConfig, ProjectConfig, TaskTypeConfig, TaskStatus } from '@/types';

const getConfigPath = () => {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.brainboard');
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    return path.join(configDir, 'config.json');
};

export const DEFAULT_TASK_TYPES: TaskTypeConfig[] = [
    { name: 'Feature', label: 'Feature', color: 'var(--accent-primary)', icon: 'Lightbulb' },
    { name: 'Bug', label: 'Bug', color: 'var(--accent-danger)', icon: 'Bug' },
    { name: 'Chore', label: 'Chore', color: 'var(--text-muted)', icon: 'Wrench' },
];

export const DEFAULT_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

export const getConfig = (): BrainBoardConfig => {
    const configPath = getConfigPath();
    let config: BrainBoardConfig;
    if (!fs.existsSync(configPath)) {
        config = {
            projects: [],
            settings: {
                taskTypes: DEFAULT_TASK_TYPES,
                statuses: DEFAULT_STATUSES
            }
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
        return config;
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    try {
        config = JSON.parse(content) as BrainBoardConfig;
        if (!config.settings) {
            config.settings = {
                taskTypes: DEFAULT_TASK_TYPES,
                statuses: DEFAULT_STATUSES
            };
        }
        return config;
    } catch (e) {
        return {
            projects: [],
            settings: {
                taskTypes: DEFAULT_TASK_TYPES,
                statuses: DEFAULT_STATUSES
            }
        };
    }
};

export const saveConfig = (config: BrainBoardConfig) => {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
};

export const addProject = (projectPath: string, name: string) => {
    const config = getConfig();
    const normalizedPath = projectPath.replace(/\/+$/, '');
    const id = Buffer.from(normalizedPath).toString('base64'); // simple id
    if (config.projects.find(p => p.id === id)) {
        return config; // already exists
    }
    const newProject: ProjectConfig = {
        id,
        name,
        path: normalizedPath,
    };
    config.projects.push(newProject);
    config.activeProjectId = id;
    saveConfig(config);
    return config;
};

export const updateProject = (id: string, name: string) => {
    const config = getConfig();
    const project = config.projects.find(p => p.id === id);
    if (project) {
        project.name = name;
        saveConfig(config);
    }
    return config;
};

export const removeProject = (id: string) => {
    const config = getConfig();
    config.projects = config.projects.filter(p => p.id !== id);
    if (config.activeProjectId === id) {
        config.activeProjectId = config.projects.length > 0 ? config.projects[0].id : undefined;
    }
    saveConfig(config);
    return config;
};

export const setActiveProject = (id: string) => {
    const config = getConfig();
    if (config.projects.find(p => p.id === id)) {
        config.activeProjectId = id;
        saveConfig(config);
    }
    return config;
};

export const updateSettings = (settings: BrainBoardConfig['settings']) => {
    const config = getConfig();
    config.settings = settings;
    saveConfig(config);
    return config;
};

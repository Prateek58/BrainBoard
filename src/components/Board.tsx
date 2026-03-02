'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanTask, TaskStatus, TaskType, BrainBoardConfig } from '@/types';
import Sidebar from './Sidebar';
import KanbanColumn from './KanbanColumn';
import NewTaskModal from './NewTaskModal';
import TaskDetailModal from './TaskDetailModal';
import AddProjectModal from './AddProjectModal';
import ConfirmationModal from './ConfirmationModal';
import SettingsModal from './SettingsModal';
import { Plus, RefreshCw, Filter, Settings } from 'lucide-react';

// Fallback defaults
const DEFAULT_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
const DEFAULT_TYPES = [
    { name: 'Feature', label: 'Feature', color: 'var(--accent-primary)', icon: 'Lightbulb' },
    { name: 'Bug', label: 'Bug', color: 'var(--accent-danger)', icon: 'Bug' },
    { name: 'Chore', label: 'Chore', color: 'var(--text-muted)', icon: 'Wrench' },
];

export default function Board() {
    const [config, setConfig] = useState<BrainBoardConfig>({ projects: [] });
    const [tasks, setTasks] = useState<KanbanTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showAddProjectModal, setShowAddProjectModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
    const [projectToRemove, setProjectToRemove] = useState<string | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null);
    const [typeFilters, setTypeFilters] = useState<Set<TaskType>>(new Set());

    // Initialize filters once config is loaded
    useEffect(() => {
        if (config.settings?.taskTypes) {
            setTypeFilters(new Set(config.settings.taskTypes.map(t => t.name)));
        } else {
            setTypeFilters(new Set(['Feature', 'Bug', 'Chore']));
        }
    }, [config.settings?.taskTypes]);

    const activeProject = config.projects.find((p) => p.id === config.activeProjectId);
    const taskTypes = config.settings?.taskTypes || DEFAULT_TYPES;
    const statuses = config.settings?.statuses || DEFAULT_STATUSES;

    // Load config
    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            setConfig(data);
        } catch (err) {
            console.error('Error loading config', err);
        }
    }, []);

    // Load tasks for active project
    const fetchTasks = useCallback(async () => {
        if (!activeProject) {
            setTasks([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/tasks?projectPath=${encodeURIComponent(activeProject.path)}`);
            const data = await res.json();
            setTasks(data.tasks || []);
        } catch (err) {
            console.error('Error loading tasks', err);
        } finally {
            setLoading(false);
        }
    }, [activeProject]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Project operations — now using a proper modal
    const handleAddProject = async (projectPath: string, name: string) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add', path: projectPath, name }),
        });
        const data = await res.json();
        setConfig(data);
        setShowAddProjectModal(false);
    };

    const handleUpdateProject = async (id: string, name: string) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', id, name }),
        });
        const data = await res.json();
        setConfig(data);
    };

    const handleRemoveProject = async (id: string) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'remove', id }),
        });
        const data = await res.json();
        setConfig(data);
        setProjectToRemove(null);
    };

    const handleSelectProject = async (id: string) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'setActive', id }),
        });
        const data = await res.json();
        setConfig(data);
    };

    const handleUpdateSettings = async (settings: BrainBoardConfig['settings']) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateSettings', settings }),
        });
        const data = await res.json();
        setConfig(data);
        setShowSettingsModal(false);
    };

    // Task creation
    const handleCreateTask = async (taskData: {
        title: string;
        type: TaskType;
        team: string;
        tags: string[];
    }) => {
        if (!activeProject) return;
        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectPath: activeProject.path, ...taskData }),
        });
        setShowNewTaskModal(false);
        fetchTasks();
    };

    // Full task update from detail modal
    const handleUpdateTask = async (updates: Partial<KanbanTask> & { content?: string }) => {
        if (!selectedTask) return;
        await fetch('/api/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filepath: selectedTask.filepath, ...updates }),
        });
        setSelectedTask(null);
        fetchTasks();
    };

    // Delete task
    const handleDeleteTask = async (task: KanbanTask) => {
        await fetch(`/api/tasks?filepath=${encodeURIComponent(task.filepath)}`, {
            method: 'DELETE',
        });
        setTaskToDelete(null);
        setSelectedTask(null);
        fetchTasks();
    };

    // Drag-and-drop — handles both cross-column moves and within-column reordering
    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;

        const sameColumn = destination.droppableId === source.droppableId;
        const sameIndex = destination.index === source.index;
        if (sameColumn && sameIndex) return; // dropped in exact same spot

        const task = tasks.find((t) => t.id === draggableId);
        if (!task) return;

        if (sameColumn) {
            // Within-column reorder
            const status = source.droppableId as TaskStatus;
            const columnTasks = tasks
                .filter((t) => t.status === status && typeFilters.has(t.type))
                .sort((a, b) => a.order - b.order);

            // Reorder the array
            const reordered = [...columnTasks];
            const [removed] = reordered.splice(source.index, 1);
            reordered.splice(destination.index, 0, removed);

            // Assign new order values
            const orderUpdates = reordered.map((t, idx) => ({
                filepath: t.filepath,
                order: idx,
                id: t.id,
            }));

            // Optimistic update
            setTasks((prev) =>
                prev.map((t) => {
                    const update = orderUpdates.find((u) => u.id === t.id);
                    return update ? { ...t, order: update.order } : t;
                })
            );

            // Persist to files
            try {
                await fetch('/api/tasks', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'reorder',
                        items: orderUpdates.map(({ filepath, order }) => ({ filepath, order })),
                    }),
                });
            } catch (err) {
                console.error('Failed to reorder', err);
                fetchTasks();
            }
        } else {
            // Cross-column move — update status + set order to destination index
            const newStatus = destination.droppableId as TaskStatus;

            // Get existing tasks in destination column to calculate order
            const destTasks = tasks
                .filter((t) => t.status === newStatus && typeFilters.has(t.type) && t.id !== draggableId)
                .sort((a, b) => a.order - b.order);

            // Insert at destination index and recalculate all orders
            const newDestTasks = [...destTasks];
            newDestTasks.splice(destination.index, 0, task);
            const orderUpdates = newDestTasks.map((t, idx) => ({
                filepath: t.filepath,
                order: idx,
                id: t.id,
            }));

            // Optimistic update
            setTasks((prev) =>
                prev.map((t) => {
                    if (t.id === draggableId) {
                        return { ...t, status: newStatus, order: destination.index };
                    }
                    const update = orderUpdates.find((u) => u.id === t.id);
                    return update ? { ...t, order: update.order } : t;
                })
            );

            try {
                // Update moved task status + order
                await fetch('/api/tasks', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filepath: task.filepath, status: newStatus, order: destination.index }),
                });
                // Reorder destination column
                if (orderUpdates.length > 1) {
                    await fetch('/api/tasks', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'reorder',
                            items: orderUpdates.map(({ filepath, order }) => ({ filepath, order })),
                        }),
                    });
                }
            } catch (err) {
                console.error('Failed to update task', err);
                fetchTasks();
            }
        }
    };

    // Filter toggle
    const toggleFilter = (type: TaskType) => {
        setTypeFilters((prev) => {
            const next = new Set(prev);
            if (next.has(type)) {
                if (next.size === 1) return next;
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    };

    // Filter and sort tasks per column — now sorted by manual order
    const getColumnTasks = (status: TaskStatus) => {
        return tasks
            .filter((t) => t.status === status && typeFilters.has(t.type))
            .sort((a, b) => a.order - b.order);
    };

    return (
        <div className="app-shell">
            <Sidebar
                projects={config.projects}
                activeProjectId={config.activeProjectId}
                onSelectProject={handleSelectProject}
                onAddProject={() => setShowAddProjectModal(true)}
                onRemoveProject={(id) => setProjectToRemove(id)}
                onUpdateProject={handleUpdateProject}
            />

            <main className="main-content">
                {/* Header */}
                <header className="board-header">
                    <div className="board-header-left">
                        <h1 className="board-title">
                            {activeProject ? activeProject.name : 'Select a Project'}
                        </h1>
                        {activeProject && (
                            <span className="board-path">{activeProject.path}</span>
                        )}
                    </div>

                    <div className="board-header-right">
                        {activeProject && (
                            <>
                                <div className="filter-group">
                                    <Filter size={14} className="filter-icon" />
                                    {taskTypes.map(type => (
                                        <button
                                            key={type.name}
                                            className={`filter-btn ${typeFilters.has(type.name) ? 'active' : ''}`}
                                            style={typeFilters.has(type.name) ? { borderColor: type.color, background: `${type.color}15`, color: type.color } : {}}
                                            onClick={() => toggleFilter(type.name)}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>

                                <button className="icon-btn" onClick={() => setShowSettingsModal(true)} title="Settings">
                                    <Settings size={16} />
                                </button>
                                <button className="icon-btn" onClick={fetchTasks} title="Refresh">
                                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                                </button>
                                <button className="btn-primary" onClick={() => setShowNewTaskModal(true)}>
                                    <Plus size={16} />
                                    New Task
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* Board */}
                {activeProject ? (
                    <div className="board-area">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div className="kanban-board">
                                {statuses.map((status) => (
                                    <KanbanColumn
                                        key={status}
                                        status={status}
                                        tasks={getColumnTasks(status)}
                                        onTaskClick={(task) => setSelectedTask(task)}
                                        taskTypes={taskTypes}
                                    />
                                ))}
                            </div>
                        </DragDropContext>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h2>Welcome to BrainBoard</h2>
                        <p>Select a project from the sidebar or add a new one to get started.</p>
                        <button className="btn-primary" onClick={() => setShowAddProjectModal(true)}>
                            <Plus size={16} />
                            Add Project
                        </button>
                    </div>
                )}
            </main>

            {/* Modals */}
            {showNewTaskModal && (
                <NewTaskModal
                    onClose={() => setShowNewTaskModal(false)}
                    onSubmit={handleCreateTask}
                    taskTypes={taskTypes}
                />
            )}

            {showAddProjectModal && (
                <AddProjectModal
                    onClose={() => setShowAddProjectModal(false)}
                    onSubmit={handleAddProject}
                    existingProjects={config.projects}
                />
            )}

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSave={handleUpdateTask}
                    onDelete={() => setTaskToDelete(selectedTask)}
                    taskTypes={taskTypes}
                    statuses={statuses}
                />
            )}

            {projectToRemove && (
                <ConfirmationModal
                    title="Remove Project"
                    message="Are you sure you want to remove this project from BrainBoard? This will not delete your local files, but it will remove it from this list."
                    confirmText="Remove Project"
                    variant="danger"
                    onClose={() => setProjectToRemove(null)}
                    onConfirm={() => handleRemoveProject(projectToRemove)}
                />
            )}

            {taskToDelete && (
                <ConfirmationModal
                    title="Delete Task"
                    message={`Are you sure you want to permanently delete "${taskToDelete.title}"? This will remove the .md file from your system.`}
                    confirmText="Delete Permanently"
                    variant="danger"
                    onClose={() => setTaskToDelete(null)}
                    onConfirm={() => handleDeleteTask(taskToDelete)}
                />
            )}

            {showSettingsModal && (
                <SettingsModal
                    taskTypes={taskTypes}
                    statuses={statuses}
                    onClose={() => setShowSettingsModal(false)}
                    onSave={handleUpdateSettings}
                />
            )}
        </div>
    );
}

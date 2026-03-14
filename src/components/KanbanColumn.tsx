'use client';

import { useState, useEffect } from 'react';
import { KanbanTask, TaskStatus, TaskTypeConfig } from '@/types';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { CheckCircle, Circle, PlayCircle, Clock, Eye, ArchiveRestore } from 'lucide-react';

interface KanbanColumnProps {
    status: TaskStatus;
    tasks: KanbanTask[];
    onTaskClick: (task: KanbanTask) => void;
    taskTypes: TaskTypeConfig[];
}

const STATUS_ICONS: Record<string, any> = {
    'To Do': Circle,
    'In Progress': PlayCircle,
    'Done': CheckCircle,
    'Review': Eye,
    'Blocked': Clock,
    'Archived': ArchiveRestore,
};

const STATUS_COLORS: Record<string, string> = {
    'To Do': 'var(--text-muted)',
    'In Progress': 'var(--accent-warning)',
    'Done': 'var(--accent-success)',
    'Review': 'var(--accent-primary)',
    'Blocked': 'var(--accent-danger)',
    'Archived': 'var(--text-muted)',
};

export default function KanbanColumn({ status, tasks, onTaskClick, taskTypes }: KanbanColumnProps) {
    const StatusIcon = STATUS_ICONS[status] || Circle;
    const color = STATUS_COLORS[status] || 'var(--accent-primary)';

    // Fix: @hello-pangea/dnd needs client-only rendering to avoid SSR hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="kanban-column">
            <div className="kanban-column-header">
                <div className="kanban-column-title">
                    <StatusIcon size={16} style={{ color }} />
                    <span>{status}</span>
                </div>
                <span className="kanban-column-count">{tasks.length}</span>
            </div>

            {mounted ? (
                <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                        <div
                            className={`kanban-column-body ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided, snapshot) => (
                                        <TaskCard
                                            task={task}
                                            index={index}
                                            provided={provided}
                                            isDragging={snapshot.isDragging}
                                            onClick={() => onTaskClick(task)}
                                            taskTypes={taskTypes}
                                        />
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            ) : (
                <div className="kanban-column-body">
                    {tasks.map((task, index) => (
                        <div
                            key={task.id}
                            className="task-card animate-fade-in"
                            style={{ animationDelay: `${index * 40}ms` }}
                        >
                            <h4 className="task-title">{task.title}</h4>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

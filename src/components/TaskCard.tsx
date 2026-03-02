'use client';

import { useRef } from 'react';
import { KanbanTask, TaskTypeConfig } from '@/types';
import { Bug, Lightbulb, Wrench, Zap, Star, Shield, Info, Palette } from 'lucide-react';

interface TaskCardProps {
    task: KanbanTask;
    index: number;
    provided: any;
    isDragging: boolean;
    onClick: () => void;
    taskTypes: TaskTypeConfig[];
}

const ICON_MAP: Record<string, any> = {
    Lightbulb, Bug, Wrench, Zap, Star, Shield, Info, Palette
};

export default function TaskCard({ task, index, provided, isDragging, onClick, taskTypes }: TaskCardProps) {
    const config = taskTypes.find(t => t.name === task.type) || taskTypes[0];
    const Icon = ICON_MAP[config?.icon] || Zap;
    const borderColor = config?.color || 'var(--text-muted)';
    const isChore = task.type === 'Chore';

    // Track mouse position to distinguish click from drag
    const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!mouseDownPos.current) return;
        const dx = Math.abs(e.clientX - mouseDownPos.current.x);
        const dy = Math.abs(e.clientY - mouseDownPos.current.y);
        // Only trigger click if mouse barely moved (< 5px) — not a drag
        if (dx < 5 && dy < 5 && !isDragging) {
            onClick();
        }
        mouseDownPos.current = null;
    };

    return (
        <div
            className={`task-card ${isDragging ? 'task-card--dragging' : ''} animate-fade-in`}
            style={{
                borderLeft: `3px solid ${borderColor}`,
                animationDelay: `${index * 40}ms`,
            }}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div className="task-card-header">
                <div className="task-type-badge" style={{ color: borderColor, background: `${borderColor}15` }}>
                    <Icon size={12} />
                    <span>{config?.label || task.type}</span>
                </div>
                {task.team && <span className="task-team">{task.team}</span>}
            </div>

            <h4 className="task-title">{task.title}</h4>

            {task.content && (
                <p className="task-preview">
                    {task.content.trim().split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('`'))?.trim().slice(0, 80) || ''}
                </p>
            )}

            {task.tags.length > 0 && (
                <div className="task-tags">
                    {task.tags.map((tag) => (
                        <span key={tag} className="task-tag">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

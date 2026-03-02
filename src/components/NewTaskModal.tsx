'use client';

import { useState } from 'react';
import { TaskType, TaskTypeConfig } from '@/types';
import { X, Lightbulb, Bug, Wrench, Zap, Star, Shield, Info, Palette } from 'lucide-react';

interface NewTaskModalProps {
    onClose: () => void;
    taskTypes: TaskTypeConfig[];
    onSubmit: (data: {
        title: string;
        type: TaskType;
        team: string;
        tags: string[];
    }) => void;
}

const ICON_MAP: Record<string, any> = {
    Lightbulb, Bug, Wrench, Zap, Star, Shield, Info, Palette
};

export default function NewTaskModal({ onClose, taskTypes, onSubmit }: NewTaskModalProps) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<TaskType>(taskTypes[0]?.name || 'Feature');
    const [team, setTeam] = useState('');
    const [tagsInput, setTagsInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        const tags = tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
        onSubmit({ title: title.trim(), type, team: team.trim(), tags });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Create New Task</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="task-title">Title</label>
                        <input
                            id="task-title"
                            type="text"
                            placeholder="Enter task title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Type</label>
                        <div className="type-selector">
                            {taskTypes.map((opt) => {
                                const Icon = ICON_MAP[opt.icon] || Zap;
                                return (
                                    <button
                                        key={opt.name}
                                        type="button"
                                        className={`type-option ${type === opt.name ? 'selected' : ''}`}
                                        style={
                                            type === opt.name
                                                ? { borderColor: opt.color, background: `${opt.color}15`, color: opt.color }
                                                : {}
                                        }
                                        onClick={() => setType(opt.name)}
                                    >
                                        <Icon size={14} />
                                        <span>{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-team">Team</label>
                        <input
                            id="task-team"
                            type="text"
                            placeholder="e.g. Backend, Frontend, DevOps..."
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-tags">Tags (comma separated)</label>
                        <input
                            id="task-tags"
                            type="text"
                            placeholder="auth, security, core..."
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={!title.trim()}>
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

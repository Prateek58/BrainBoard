'use client';

import { useState, useEffect, useRef } from 'react';
import { TaskType, TaskTypeConfig } from '@/types';
import { X, Lightbulb, Bug, Wrench, Zap, Star, Shield, Info, Palette, Loader2 } from 'lucide-react';
import TagInput from './TagInput';

interface NewTaskModalProps {
    onClose: () => void;
    taskTypes: TaskTypeConfig[];
    tagSuggestions: string[];
    teamSuggestions: string[];
    onSubmit: (data: {
        title: string;
        type: TaskType;
        team: string;
        tags: string[];
        content: string;
    }) => void;
}

const ICON_MAP: Record<string, any> = {
    Lightbulb, Bug, Wrench, Zap, Star, Shield, Info, Palette
};

const getTemplate = (type: TaskType, title: string): string => {
    if (type === 'Feature') {
        return `### Context\nAdd context here.\n\n### Business Rules\n\`\`\`gherkin\nFeature: ${title || 'Untitled'}\n  Scenario: Default setup\n    Given ...\n    When ...\n    Then ...\n\`\`\``;
    }
    return `### Context\nAdd context here.\n\n### Implementation Tasks\n- [ ] Task 1\n- [ ] Task 2`;
};

export default function NewTaskModal({ onClose, taskTypes, onSubmit, tagSuggestions, teamSuggestions }: NewTaskModalProps) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<TaskType>(taskTypes[0]?.name || 'Feature');
    const [team, setTeam] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [description, setDescription] = useState(() => getTemplate(taskTypes[0]?.name || 'Feature', ''));
    const [isEnhancing, setIsEnhancing] = useState(false);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    // When type changes, only reset description if user hasn't edited it away from the template
    const prevTypeRef = useRef(type);
    useEffect(() => {
        if (prevTypeRef.current !== type) {
            // Check if current description matches the old template — if so, swap to new template
            const oldTemplate = getTemplate(prevTypeRef.current, title);
            if (description === oldTemplate || description === getTemplate(prevTypeRef.current, '')) {
                setDescription(getTemplate(type, title));
            }
            prevTypeRef.current = type;
        }
    }, [type]);

    // Update the Feature template's title line when title changes (only if not heavily customised)
    const prevTitleRef = useRef(title);
    useEffect(() => {
        if (type === 'Feature' && prevTitleRef.current !== title) {
            setDescription(prev => {
                const oldLine = `Feature: ${prevTitleRef.current || 'Untitled'}`;
                const newLine = `Feature: ${title || 'Untitled'}`;
                return prev.includes(oldLine) ? prev.replace(oldLine, newLine) : prev;
            });
        }
        prevTitleRef.current = title;
    }, [title, type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit({
            title: title.trim(),
            type,
            team: team[0] || '',
            tags,
            content: description,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-fade-in new-task-modal modal-elevated" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header modal-header-themed">
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
                        <label>Team</label>
                        <TagInput
                            values={team}
                            onChange={setTeam}
                            suggestions={teamSuggestions}
                            placeholder="Type team name..."
                            singleValue
                        />
                    </div>

                    <div className="form-group">
                        <label>Tags</label>
                        <TagInput
                            values={tags}
                            onChange={setTags}
                            suggestions={tagSuggestions}
                            placeholder="Type to add tags..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-description" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                Description
                                <span className="form-label-hint">Edit the pre-filled template below — supports Markdown</span>
                            </div>
                            <button
                                type="button"
                                className="btn-secondary btn-sm"
                                style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                                onClick={async () => {
                                    if (isEnhancing) return;
                                    setIsEnhancing(true);
                                    try {
                                        const res = await fetch('/api/ai', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ text: description, type, title })
                                        });
                                        const data = await res.json().catch(() => null);
                                        if (!data) {
                                            throw new Error('Invalid JSON response from server');
                                        }
                                        if (!res.ok) {
                                            throw new Error(data.error || 'Server returned an error');
                                        }
                                        if (data.error) {
                                            alert(data.error);
                                        } else if (data.refinedText) {
                                            setDescription(data.refinedText);
                                        }
                                    } catch (err: any) {
                                        console.error('AI Error:', err);
                                        alert(err.message || 'Failed to refine text. Ensure your API key is correct and you have enough credits.');
                                    } finally {
                                        setIsEnhancing(false);
                                    }
                                }}
                                disabled={isEnhancing}
                            >
                                {isEnhancing ? (
                                    <><Loader2 size={12} className="spin" /> Enhancing...</>
                                ) : (
                                    <><Zap size={12} /> ✨ Enhance with AI</>
                                )}
                            </button>
                        </label>
                        <textarea
                            id="task-description"
                            ref={descriptionRef}
                            className="new-task-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={10}
                            spellCheck={false}
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

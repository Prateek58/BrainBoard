'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { KanbanTask, TaskStatus, TaskType, TaskTypeConfig } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    X, Lightbulb, Bug, Wrench, ChevronDown,
    Circle, PlayCircle, CheckCircle, Save, Trash2,
    Zap, Star, Shield, Info, Palette, Eye, Pencil,
    Maximize2, Minimize2, Loader2, AlertCircle, Check
} from 'lucide-react';
import TagInput from './TagInput';

interface TaskDetailModalProps {
    task: KanbanTask;
    onClose: () => void;
    onSave: (updates: Partial<KanbanTask> & { content?: string }) => Promise<boolean>;
    onDelete?: () => void;
    taskTypes: TaskTypeConfig[];
    statuses: TaskStatus[];
    tagSuggestions: string[];
    teamSuggestions: string[];
}

const ICON_MAP: Record<string, any> = {
    Lightbulb, Bug, Wrench, Zap, Star, Shield, Info, Palette
};

const STATUS_ICONS: Record<string, any> = {
    'To Do': Circle,
    'In Progress': PlayCircle,
    'Done': CheckCircle,
};

export default function TaskDetailModal({ task, onClose, onSave, onDelete, taskTypes, statuses, tagSuggestions, teamSuggestions }: TaskDetailModalProps) {
    const [title, setTitle] = useState(task.title);
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [type, setType] = useState<TaskType>(task.type);
    const [team, setTeam] = useState<string[]>(task.team ? [task.team] : []);
    const [tags, setTags] = useState<string[]>(task.tags || []);
    const [content, setContent] = useState(task.content.trim());
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [viewMode, setViewMode] = useState<'write' | 'preview'>('preview');
    const [isExpanded, setIsExpanded] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [isEnhancing, setIsEnhancing] = useState(false);

    // Resizable content area
    const contentAreaRef = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(400);

    const markChanged = () => setHasChanges(true);

    const handleSave = async () => {
        if (saveStatus === 'saving') return;
        setSaveStatus('saving');
        const success = await onSave({
            title: title.trim(),
            status,
            type,
            team: team[0] || undefined,
            tags,
            content,
        });
        if (success) {
            setSaveStatus('saved');
        } else {
            setSaveStatus('error');
        }
    };

    // Vertical resize handler
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = contentHeight;

        const handleMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientY - startY;
            const newHeight = Math.max(150, Math.min(startHeight + delta, window.innerHeight - 300));
            setContentHeight(newHeight);
        };

        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
    }, [contentHeight]);

    // Switch to write mode when clicking on preview
    const handlePreviewClick = () => {
        if (viewMode === 'preview') {
            setViewMode('write');
        }
    };

    const currentType = taskTypes.find(t => t.name === type) || taskTypes[0];
    const CurrentStatusIcon = STATUS_ICONS[status] || Circle;
    const CurrentTypeIcon = ICON_MAP[currentType?.icon] || Lightbulb;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`task-detail-modal animate-fade-in modal-elevated ${isExpanded ? 'expanded' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="detail-header modal-header-themed">
                    <div className="detail-header-left">
                        <div
                            className="detail-type-indicator"
                            style={{ background: currentType?.color || 'var(--accent-primary)' }}
                        />
                        <input
                            className="detail-title-input"
                            value={title}
                            onChange={e => { setTitle(e.target.value); markChanged(); }}
                            placeholder="Task title..."
                        />
                    </div>
                    <div className="detail-header-actions">
                        {hasChanges && (
                            <button className="btn-primary btn-sm" onClick={handleSave}>
                                <Save size={14} />
                                Save
                            </button>
                        )}
                        <button
                            className="icon-btn-sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            title={isExpanded ? 'Minimize' : 'Expand'}
                        >
                            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                        </button>
                        <button className="modal-close" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Properties */}
                <div className="detail-properties">
                    {/* Status */}
                    <div className="detail-prop-row">
                        <span className="detail-prop-label">Status</span>
                        <div className="detail-prop-value">
                            <button
                                className="detail-dropdown-trigger"
                                onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowTypeDropdown(false); }}
                            >
                                <CurrentStatusIcon size={14} style={{ color: status === 'Done' ? 'var(--accent-success)' : status === 'In Progress' ? 'var(--accent-warning)' : 'var(--text-muted)' }} />
                                <span>{status}</span>
                                <ChevronDown size={12} />
                            </button>
                            {showStatusDropdown && (
                                <div className="detail-dropdown">
                                    {statuses.map(s => {
                                        const Icon = STATUS_ICONS[s] || Circle;
                                        return (
                                            <button
                                                key={s}
                                                className={`detail-dropdown-item ${status === s ? 'active' : ''}`}
                                                onClick={() => { setStatus(s); setShowStatusDropdown(false); markChanged(); }}
                                            >
                                                <Icon size={14} style={{ color: s === 'Done' ? 'var(--accent-success)' : s === 'In Progress' ? 'var(--accent-warning)' : 'var(--text-muted)' }} />
                                                <span>{s}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Type */}
                    <div className="detail-prop-row">
                        <span className="detail-prop-label">Type</span>
                        <div className="detail-prop-value">
                            <button
                                className="detail-dropdown-trigger"
                                onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowStatusDropdown(false); }}
                            >
                                <CurrentTypeIcon size={14} style={{ color: currentType?.color }} />
                                <span>{currentType?.label}</span>
                                <ChevronDown size={12} />
                            </button>
                            {showTypeDropdown && (
                                <div className="detail-dropdown">
                                    {taskTypes.map(opt => {
                                        const Icon = ICON_MAP[opt.icon] || Zap;
                                        return (
                                            <button
                                                key={opt.name}
                                                className={`detail-dropdown-item ${type === opt.name ? 'active' : ''}`}
                                                onClick={() => { setType(opt.name); setShowTypeDropdown(false); markChanged(); }}
                                            >
                                                <Icon size={14} style={{ color: opt.color }} />
                                                <span>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Team */}
                    <div className="detail-prop-row">
                        <span className="detail-prop-label">Team</span>
                        <div className="detail-prop-value">
                            <TagInput
                                values={team}
                                onChange={(vals) => { setTeam(vals); markChanged(); }}
                                suggestions={teamSuggestions}
                                placeholder="Add team..."
                                singleValue
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="detail-prop-row">
                        <span className="detail-prop-label">Tags</span>
                        <div className="detail-prop-value">
                            <TagInput
                                values={tags}
                                onChange={(vals) => { setTags(vals); markChanged(); }}
                                suggestions={tagSuggestions}
                                placeholder="Add tags..."
                            />
                        </div>
                    </div>

                    {/* File path (read-only) */}
                    <div className="detail-prop-row">
                        <span className="detail-prop-label">File</span>
                        <div className="detail-prop-value">
                            <span className="detail-filepath">{task.filepath}</span>
                        </div>
                    </div>
                </div>

                {/* Content Toggle Bar */}
                <div className="detail-content-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="detail-content-tabs">
                        <button
                            className={`detail-tab ${viewMode === 'write' ? 'active' : ''}`}
                            onClick={() => setViewMode('write')}
                        >
                            <Pencil size={13} />
                            Write
                        </button>
                        <button
                            className={`detail-tab ${viewMode === 'preview' ? 'active' : ''}`}
                            onClick={() => setViewMode('preview')}
                        >
                            <Eye size={13} />
                            Preview
                        </button>
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
                                    body: JSON.stringify({ text: content, type, title })
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
                                    setContent(data.refinedText);
                                    markChanged();
                                    setViewMode('preview');
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
                </div>

                {/* Content Area */}
                <div
                    className="detail-content-area"
                    ref={contentAreaRef}
                    style={{ height: contentHeight }}
                >
                    {viewMode === 'write' ? (
                        <textarea
                            className="detail-markdown-editor"
                            value={content}
                            onChange={e => { setContent(e.target.value); markChanged(); }}
                            placeholder="Write your task description, business rules, checklists here using Markdown..."
                            spellCheck={false}
                            autoFocus
                        />
                    ) : (
                        <div
                            className="detail-markdown-preview"
                            onClick={handlePreviewClick}
                        >
                            {content ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                </ReactMarkdown>
                            ) : (
                                <p className="detail-preview-empty">
                                    Click to start writing...
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Resize Handle */}
                <div
                    className="detail-resize-handle"
                    ref={resizeHandleRef}
                    onMouseDown={handleResizeStart}
                >
                    <div className="resize-grip" />
                </div>

                {/* Save Error Banner */}
                {saveStatus === 'error' && (
                    <div className="detail-save-error">
                        <AlertCircle size={14} />
                        <span>Failed to save. Please try again.</span>
                    </div>
                )}

                {/* Footer */}
                <div className="detail-footer">
                    {onDelete && (
                        <button className="btn-danger-ghost" onClick={onDelete}>
                            <Trash2 size={14} />
                            Delete Task
                        </button>
                    )}
                    <div className="detail-footer-right">
                        <button className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            className="btn-primary"
                            onClick={handleSave}
                            disabled={!title.trim() || saveStatus === 'saving'}
                        >
                            {saveStatus === 'saving' ? (
                                <><Loader2 size={14} className="spin" /> Saving...</>
                            ) : saveStatus === 'saved' ? (
                                <><Check size={14} /> Saved!</>
                            ) : (
                                <><Save size={14} /> Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

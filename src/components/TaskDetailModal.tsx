'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { KanbanTask, TaskStatus, TaskType, TaskTypeConfig } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    X, Lightbulb, Bug, Wrench, ChevronDown,
    Circle, PlayCircle, CheckCircle, Save, Trash2,
    Zap, Star, Shield, Info, Palette, Eye, Pencil,
    Maximize2, Minimize2
} from 'lucide-react';

interface TaskDetailModalProps {
    task: KanbanTask;
    onClose: () => void;
    onSave: (updates: Partial<KanbanTask> & { content?: string }) => void;
    onDelete?: () => void;
    taskTypes: TaskTypeConfig[];
    statuses: TaskStatus[];
}

const ICON_MAP: Record<string, any> = {
    Lightbulb, Bug, Wrench, Zap, Star, Shield, Info, Palette
};

const STATUS_ICONS: Record<string, any> = {
    'To Do': Circle,
    'In Progress': PlayCircle,
    'Done': CheckCircle,
};

export default function TaskDetailModal({ task, onClose, onSave, onDelete, taskTypes, statuses }: TaskDetailModalProps) {
    const [title, setTitle] = useState(task.title);
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [type, setType] = useState<TaskType>(task.type);
    const [team, setTeam] = useState(task.team || '');
    const [tagsInput, setTagsInput] = useState(task.tags.join(', '));
    const [content, setContent] = useState(task.content.trim());
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [viewMode, setViewMode] = useState<'write' | 'preview'>('preview');
    const [isExpanded, setIsExpanded] = useState(false);

    // Resizable content area
    const contentAreaRef = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(400);

    const markChanged = () => setHasChanges(true);

    const handleSave = () => {
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
        onSave({
            title: title.trim(),
            status,
            type,
            team: team.trim() || undefined,
            tags,
            content,
        });
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
                className={`task-detail-modal animate-fade-in ${isExpanded ? 'expanded' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="detail-header">
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
                            <input
                                className="detail-inline-input"
                                value={team}
                                onChange={e => { setTeam(e.target.value); markChanged(); }}
                                placeholder="Add team..."
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="detail-prop-row">
                        <span className="detail-prop-label">Tags</span>
                        <div className="detail-prop-value">
                            <input
                                className="detail-inline-input"
                                value={tagsInput}
                                onChange={e => { setTagsInput(e.target.value); markChanged(); }}
                                placeholder="tag1, tag2, tag3..."
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
                <div className="detail-content-toolbar">
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
                        <button className="btn-primary" onClick={handleSave} disabled={!title.trim()}>
                            <Save size={14} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

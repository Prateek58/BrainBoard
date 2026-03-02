'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Lightbulb, Bug, Wrench, Zap, Star, Shield, Info, Palette } from 'lucide-react';
import { TaskTypeConfig, TaskStatus } from '@/types';

interface SettingsModalProps {
    taskTypes: TaskTypeConfig[];
    statuses: TaskStatus[];
    onClose: () => void;
    onSave: (settings: { taskTypes: TaskTypeConfig[]; statuses: TaskStatus[] }) => void;
}

const ICON_MAP: Record<string, any> = {
    Lightbulb, Bug, Wrench, Zap, Star, Shield, Info, Palette
};

const COLOR_OPTIONS = [
    { name: 'Indigo', value: 'var(--accent-primary)' },
    { name: 'Red', value: 'var(--accent-danger)' },
    { name: 'Green', value: 'var(--accent-success)' },
    { name: 'Amber', value: 'var(--accent-warning)' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Gray', value: 'var(--text-muted)' },
];

export default function SettingsModal({ taskTypes: initialTaskTypes, statuses: initialStatuses, onClose, onSave }: SettingsModalProps) {
    const [taskTypes, setTaskTypes] = useState<TaskTypeConfig[]>([...initialTaskTypes]);
    const [statuses, setStatuses] = useState<TaskStatus[]>([...initialStatuses]);
    const [activeTab, setActiveTab] = useState<'types' | 'statuses'>('types');

    const handleAddType = () => {
        const newType: TaskTypeConfig = {
            name: `new-type-${taskTypes.length + 1}`,
            label: 'New Type',
            color: 'var(--accent-primary)',
            icon: 'Zap'
        };
        setTaskTypes([...taskTypes, newType]);
    };

    const handleRemoveType = (index: number) => {
        if (taskTypes.length <= 1) return; // Keep at least one
        const newList = [...taskTypes];
        newList.splice(index, 1);
        setTaskTypes(newList);
    };

    const handleUpdateType = (index: number, updates: Partial<TaskTypeConfig>) => {
        const newList = [...taskTypes];
        let newType = { ...newList[index], ...updates };

        // Auto-generate name from label if name is still dynamic default
        if (updates.label && (newType.name.startsWith('new-type-') || !newType.name)) {
            newType.name = updates.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }

        newList[index] = newType;
        setTaskTypes(newList);
    };

    const handleAddStatus = () => {
        setStatuses([...statuses, 'New Status']);
    };

    const handleRemoveStatus = (index: number) => {
        if (statuses.length <= 1) return;
        const newList = [...statuses];
        newList.splice(index, 1);
        setStatuses(newList);
    };

    const handleUpdateStatus = (index: number, value: string) => {
        const newList = [...statuses];
        newList[index] = value;
        setStatuses(newList);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal settings-modal animate-fade-in" style={{ width: '640px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Application Settings</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="settings-tabs">
                    <button
                        className={`settings-tab ${activeTab === 'types' ? 'active' : ''}`}
                        onClick={() => setActiveTab('types')}
                    >
                        Task Types
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'statuses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('statuses')}
                    >
                        Kanban Columns
                    </button>
                </div>

                <div className="modal-form" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {activeTab === 'types' ? (
                        <div className="settings-section">
                            <div className="settings-section-header">
                                <p className="settings-description">
                                    Configure categories for your tasks. The "Name" is used internally in Markdown files.
                                </p>
                                <button className="btn-secondary btn-sm" onClick={handleAddType}>
                                    <Plus size={14} /> Add Type
                                </button>
                            </div>

                            <div className="types-list">
                                {taskTypes.map((type, idx) => (
                                    <div key={idx} className="settings-item-row card">
                                        <div className="settings-item-main">
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>Display Label</label>
                                                <input
                                                    value={type.label}
                                                    onChange={e => handleUpdateType(idx, { label: e.target.value })}
                                                    placeholder="e.g. Features"
                                                />
                                            </div>
                                            <div className="form-group" style={{ width: '120px' }}>
                                                <label>Name (Slug)</label>
                                                <input
                                                    value={type.name}
                                                    onChange={e => handleUpdateType(idx, { name: e.target.value })}
                                                    placeholder="feature"
                                                />
                                            </div>
                                        </div>
                                        <div className="settings-item-details">
                                            <div className="form-group">
                                                <label>Icon</label>
                                                <div className="icon-picker">
                                                    {Object.keys(ICON_MAP).map(iconName => {
                                                        const IconComp = ICON_MAP[iconName];
                                                        return (
                                                            <button
                                                                key={iconName}
                                                                className={`icon-option ${type.icon === iconName ? 'selected' : ''}`}
                                                                onClick={() => handleUpdateType(idx, { icon: iconName })}
                                                                title={iconName}
                                                            >
                                                                <IconComp size={14} />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Color</label>
                                                <div className="color-picker">
                                                    {COLOR_OPTIONS.map(col => (
                                                        <button
                                                            key={col.value}
                                                            className={`color-option ${type.color === col.value ? 'selected' : ''}`}
                                                            style={{ backgroundColor: col.value.includes('var') ? `var(--accent-primary)` : col.value }}
                                                            onClick={() => handleUpdateType(idx, { color: col.value })}
                                                            title={col.name}
                                                        >
                                                            {type.color === col.value && <Check size={10} color="#fff" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="remove-item-btn" onClick={() => handleRemoveType(idx)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="settings-section">
                            <div className="settings-section-header">
                                <p className="settings-description">
                                    Manage the columns of your Kanban board.
                                </p>
                                <button className="btn-secondary btn-sm" onClick={handleAddStatus}>
                                    <Plus size={14} /> Add Column
                                </button>
                            </div>

                            <div className="statuses-list">
                                {statuses.map((status, idx) => (
                                    <div key={idx} className="settings-item-row">
                                        <input
                                            value={status}
                                            onChange={e => handleUpdateStatus(idx, e.target.value)}
                                            placeholder="Status name..."
                                            style={{ flex: 1 }}
                                        />
                                        <button className="remove-item-btn" onClick={() => handleRemoveStatus(idx)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-actions" style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)' }}>
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={() => onSave({ taskTypes, statuses })}>
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

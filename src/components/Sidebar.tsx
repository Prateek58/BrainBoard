'use client';

import { useState, useRef, useEffect } from 'react';
import { ProjectConfig } from '@/types';
import { FolderOpen, Plus, Trash2, ChevronRight, Edit2, Check, X, MoreVertical, Info, Brain } from 'lucide-react';

interface SidebarProps {
    projects: ProjectConfig[];
    activeProjectId?: string;
    onSelectProject: (id: string) => void;
    onAddProject: () => void;
    onRemoveProject: (id: string) => void;
    onUpdateProject: (id: string, name: string) => void;
}

export default function Sidebar({
    projects,
    activeProjectId,
    onSelectProject,
    onAddProject,
    onRemoveProject,
    onUpdateProject,
}: SidebarProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [showPathId, setShowPathId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpenId(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const startEditing = (project: ProjectConfig) => {
        setEditingId(project.id);
        setEditValue(project.name);
        setMenuOpenId(null);
    };

    const cancelEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const saveEditing = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (editValue.trim()) {
            onUpdateProject(id, editValue.trim());
        }
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter') {
            if (editValue.trim()) {
                onUpdateProject(id, editValue.trim());
            }
            setEditingId(null);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setMenuOpenId(menuOpenId === id ? null : id);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        onRemoveProject(id);
        setMenuOpenId(null);
    };

    const togglePath = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPathId(showPathId === id ? null : id);
        setMenuOpenId(null);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Brain size={18} />
                    </div>
                    <span className="logo-text">BrainBoard</span>
                </div>
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-title">
                    <span>Projects</span>
                    <button className="sidebar-add-btn" onClick={onAddProject} title="Add project">
                        <Plus size={15} />
                    </button>
                </div>

                <div className="sidebar-project-list">
                    {projects.length === 0 && (
                        <div className="sidebar-empty">
                            <FolderOpen size={28} strokeWidth={1.2} />
                            <p>No projects yet</p>
                            <button className="sidebar-empty-btn" onClick={onAddProject}>
                                Add your first project
                            </button>
                        </div>
                    )}

                    {projects.map((project) => (
                        <div key={project.id} className="sidebar-project-container">
                            <div
                                className={`sidebar-project-item ${activeProjectId === project.id ? 'active' : ''} ${editingId === project.id ? 'editing' : ''}`}
                                onClick={() => editingId !== project.id && onSelectProject(project.id)}
                            >
                                <div className="sidebar-project-info">
                                    <ChevronRight
                                        size={14}
                                        className={`sidebar-chevron ${activeProjectId === project.id ? 'rotated' : ''}`}
                                    />
                                    <FolderOpen size={16} strokeWidth={1.5} />
                                    {editingId === project.id ? (
                                        <input
                                            autoFocus
                                            className="sidebar-edit-input"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, project.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <span className="sidebar-project-name">{project.name}</span>
                                    )}
                                </div>

                                <div className="sidebar-project-actions">
                                    {editingId === project.id ? (
                                        <>
                                            <button className="sidebar-action-btn save" onClick={(e) => saveEditing(e, project.id)} title="Save">
                                                <Check size={13} />
                                            </button>
                                            <button className="sidebar-action-btn cancel" onClick={cancelEditing} title="Cancel">
                                                <X size={13} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="sidebar-menu-wrapper" ref={menuOpenId === project.id ? menuRef : null}>
                                            <button
                                                className={`sidebar-action-btn ellipsis ${menuOpenId === project.id ? 'active' : ''}`}
                                                onClick={(e) => toggleMenu(e, project.id)}
                                                title="Project options"
                                            >
                                                <MoreVertical size={14} />
                                            </button>

                                            {menuOpenId === project.id && (
                                                <div className="sidebar-dropdown-menu">
                                                    <button className="menu-item" onClick={() => startEditing(project)}>
                                                        <Edit2 size={13} /> Rename
                                                    </button>
                                                    <button className="menu-item" onClick={(e) => togglePath(e, project.id)}>
                                                        <Info size={13} /> {showPathId === project.id ? 'Hide Path' : 'Show Path'}
                                                    </button>
                                                    <div className="menu-divider"></div>
                                                    <button className="menu-item danger" onClick={(e) => handleDelete(e, project.id)}>
                                                        <Trash2 size={13} /> Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {showPathId === project.id && (
                                <div className="sidebar-project-path-info">
                                    <div className="path-label">Brain Directory:</div>
                                    <code>{project.path}/brain</code>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}

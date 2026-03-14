'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FolderOpen, X, ChevronRight, ArrowUp, Home,
    Check, Folder, Brain, Lightbulb, Plus
} from 'lucide-react';

interface DirEntry {
    name: string;
    path: string;
}

interface BrowseResult {
    current: string;
    parent: string | null;
    directories: DirEntry[];
    hasBrainFolder: boolean;
}

interface AddProjectModalProps {
    onClose: () => void;
    onSubmit: (path: string, name: string) => void;
    existingProjects: { id: string; name: string; path: string }[];
}

export default function AddProjectModal({ onClose, onSubmit, existingProjects }: AddProjectModalProps) {
    const [projectPath, setProjectPath] = useState('');
    const [projectName, setProjectName] = useState('');
    const [browseData, setBrowseData] = useState<BrowseResult | null>(null);
    const [browseLoading, setBrowseLoading] = useState(false);
    const [showBrowser, setShowBrowser] = useState(true);
    const [browseError, setBrowseError] = useState('');

    const extractName = (p: string) => {
        const parts = p.replace(/\/+$/, '').split('/');
        return parts[parts.length - 1] || '';
    };

    const browse = useCallback(async (dirPath?: string) => {
        setBrowseLoading(true);
        setBrowseError('');
        try {
            const query = dirPath ? `?path=${encodeURIComponent(dirPath)}` : '';
            const res = await fetch(`/api/browse${query}`);
            if (!res.ok) {
                const err = await res.json();
                setBrowseError(err.error || 'Failed to browse');
                return;
            }
            const data: BrowseResult = await res.json();
            setBrowseData(data);
        } catch (err) {
            setBrowseError('Failed to browse directories');
        } finally {
            setBrowseLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        browse();
    }, [browse]);

    const handleSelectFolder = (dir: DirEntry) => {
        browse(dir.path);
    };

    const handleGoUp = () => {
        if (browseData?.parent) {
            browse(browseData.parent);
        }
    };

    const handleGoHome = () => {
        browse();
    };

    const handleChooseCurrentDir = () => {
        if (!browseData) return;
        const path = browseData.current.replace(/\/+$/, '');
        setProjectPath(path);
        if (!projectName || projectName === extractName(projectPath)) {
            setProjectName(extractName(path));
        }
    };

    const isDuplicate = browseData ? existingProjects.some(p => p.path.replace(/\/+$/, '') === browseData.current.replace(/\/+$/, '')) : false;
    const isBrainDir = browseData ? browseData.current.toLowerCase().endsWith('/brain') || browseData.current.toLowerCase() === 'brain' : false;

    const handlePathChange = (value: string) => {
        setProjectPath(value);
        if (!projectName || projectName === extractName(projectPath)) {
            setProjectName(extractName(value));
        }
    };

    const handlePathKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && projectPath.trim()) {
            browse(projectPath.trim());
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectPath.trim() || isDuplicate) return;
        const name = projectName.trim() || extractName(projectPath);
        onSubmit(projectPath.trim().replace(/\/+$/, ''), name);
    };

    // Breadcrumb segments from current path
    const pathSegments = browseData
        ? browseData.current.split('/').filter(Boolean).map((seg, idx, arr) => ({
            name: seg,
            path: '/' + arr.slice(0, idx + 1).join('/'),
        }))
        : [];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="add-project-modal animate-fade-in modal-elevated" onClick={e => e.stopPropagation()}>
                <div className="modal-header modal-header-themed">
                    <h3>
                        <FolderOpen size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Add Project
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Path input + browser toggle */}
                    <div className="browse-path-bar">
                        <input
                            type="text"
                            className="browse-path-input"
                            value={projectPath || browseData?.current || ''}
                            onChange={e => handlePathChange(e.target.value)}
                            onKeyDown={handlePathKeyDown}
                            placeholder="Enter path or browse below..."
                        />
                    </div>

                    {/* Directory Browser */}
                    {showBrowser && (
                        <div className="dir-browser" style={{ position: 'relative' }}>
                            {/* Browser toolbar */}
                            <div className="dir-browser-toolbar">
                                <button
                                    type="button"
                                    className="dir-nav-btn"
                                    onClick={handleGoUp}
                                    disabled={!browseData?.parent}
                                    title="Go up"
                                >
                                    <ArrowUp size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="dir-nav-btn"
                                    onClick={handleGoHome}
                                    title="Home"
                                >
                                    <Home size={14} />
                                </button>

                                {/* Breadcrumbs */}
                                <div className="dir-breadcrumbs">
                                    <button
                                        type="button"
                                        className="dir-breadcrumb"
                                        onClick={() => browse('/')}
                                    >
                                        /
                                    </button>
                                    {pathSegments.slice(-4).map((seg) => (
                                        <span key={seg.path} className="dir-breadcrumb-item">
                                            <ChevronRight size={10} className="dir-breadcrumb-sep" />
                                            <button
                                                type="button"
                                                className="dir-breadcrumb"
                                                onClick={() => browse(seg.path)}
                                            >
                                                {seg.name}
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Warnings */}
                            {isBrainDir && (
                                <div className="dir-warning" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', padding: '8px 16px', fontSize: '11px', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <Lightbulb size={13} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
                                    <span><strong>Warning:</strong> You have selected the <code>/brain</code> folder. Typically, you should select the <strong>project root</strong> folder instead.</span>
                                </div>
                            )}

                            {isDuplicate && (
                                <div className="dir-error" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', padding: '8px 16px', fontSize: '11px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <X size={13} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
                                    <span>This project is already added.</span>
                                </div>
                            )}

                            {/* Brain folder indicator */}
                            {browseData?.hasBrainFolder && !isBrainDir && (
                                <div className="brain-indicator" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.06)', borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                    <Brain size={13} />
                                    <span>This folder has a <code>/brain</code> directory</span>
                                </div>
                            )}

                            {/* Error */}
                            {browseError && (
                                <div className="dir-error">{browseError}</div>
                            )}

                            {/* Directory list */}
                            <div className="dir-list">
                                {browseLoading ? (
                                    <div className="dir-loading">Loading...</div>
                                ) : browseData?.directories.length === 0 ? (
                                    <div className="dir-empty">No subdirectories</div>
                                ) : (
                                    browseData?.directories.map((dir) => (
                                        <button
                                            key={dir.path}
                                            type="button"
                                            className={`dir-item ${dir.path === projectPath ? 'selected' : ''}`}
                                            onClick={() => handleSelectFolder(dir)}
                                            onDoubleClick={() => {
                                                setProjectPath(dir.path);
                                                setProjectName(dir.name);
                                            }}
                                        >
                                            <Folder size={15} className="dir-item-icon" />
                                            <span className="dir-item-name">{dir.name}</span>
                                            <ChevronRight size={12} className="dir-item-arrow" />
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Select current directory button */}
                            <button
                                type="button"
                                className={`dir-select-btn ${isDuplicate ? 'disabled' : ''}`}
                                onClick={handleChooseCurrentDir}
                                disabled={isDuplicate}
                                style={{ opacity: isDuplicate ? 0.5 : 1 }}
                            >
                                {browseData?.hasBrainFolder ? <Brain size={14} /> : <Plus size={14} />}
                                {isDuplicate ? (
                                    <span>Project already exists</span>
                                ) : (
                                    <span>
                                        {browseData?.hasBrainFolder ? 'Use existing BrainBoard' : 'Initialize BrainBoard here'}
                                        <span className="dir-select-path" style={{ marginLeft: 8, opacity: 0.7 }}>{browseData?.current || '...'}</span>
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                    {/* Project name */}
                    <div className="browse-footer-form">
                        <div className="form-group">
                            <label htmlFor="proj-name">Display Name</label>
                            <input
                                id="proj-name"
                                type="text"
                                placeholder="My App"
                                value={projectName}
                                onChange={e => setProjectName(e.target.value)}
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={!projectPath.trim()}>
                                <FolderOpen size={14} />
                                Add Project
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

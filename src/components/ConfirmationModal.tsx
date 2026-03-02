'use client';

import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
    onConfirm: () => void;
    variant?: 'danger' | 'primary';
}

export default function ConfirmationModal({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onClose,
    onConfirm,
    variant = 'primary',
}: ConfirmationModalProps) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal confirmation-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={18} style={{ color: variant === 'danger' ? '#ef4444' : '#6366f1' }} />
                        {title}
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-form" style={{ paddingBottom: '20px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                        {message}
                    </p>

                    <div className="modal-actions" style={{ marginTop: '12px' }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={`btn-${variant === 'danger' ? 'danger' : 'primary'}`}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

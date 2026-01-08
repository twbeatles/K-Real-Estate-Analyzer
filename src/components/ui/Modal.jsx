import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';

/**
 * 모달 컴포넌트
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    icon: Icon,
    children,
    footer,
    size = 'md', // sm, md, lg, xl
}) => {
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const sizeStyles = {
        sm: { maxWidth: '400px' },
        md: { maxWidth: '500px' },
        lg: { maxWidth: '700px' },
        xl: { maxWidth: '900px' },
    };

    return (
        <div
            className="modal-overlay animate-fade-in"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '20px',
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="modal-content animate-slide-up"
                style={{
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-xl)',
                    width: '100%',
                    ...sizeStyles[size],
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--color-border)',
                }}>
                    <h2 style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: '1.125rem',
                        fontWeight: 600,
                    }}>
                        {Icon && <Icon size={20} style={{ color: 'var(--color-primary)' }} />}
                        {title}
                    </h2>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    padding: '24px',
                    overflowY: 'auto',
                    flex: 1,
                }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div style={{
                        padding: '16px 24px',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;

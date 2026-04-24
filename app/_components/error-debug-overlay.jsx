'use client';
import React, { Component, useEffect } from 'react';

// ─── Runtime error listener ──────────────────────────────────────────────────
// Catches unhandled JS errors and promise rejections that happen outside React.

function RuntimeErrorListener() {
    useEffect(() => {
        const handleError = (event) => {
            const msg = event.message || String(event);
            const src = event.filename ? `\n${event.filename}:${event.lineno}:${event.colno}` : '';
            const stack = event.error?.stack ? `\n\n${event.error.stack}` : '';
            showDebugAlert(`JS Error${src}\n\n${msg}${stack}`);
        };

        const handleRejection = (event) => {
            const reason = event.reason;
            const msg = reason?.message || String(reason);
            const stack = reason?.stack ? `\n\n${reason.stack}` : '';
            showDebugAlert(`Unhandled Promise Rejection\n\n${msg}${stack}`);
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);
        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, []);

    return null;
}

// ─── Shared overlay renderer ─────────────────────────────────────────────────

function showDebugAlert(message) {
    // Remove any existing overlay first
    document.getElementById('__debug_overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = '__debug_overlay';
    Object.assign(overlay.style, {
        position:        'fixed',
        inset:           '0',
        zIndex:          '99999',
        background:      'rgba(0,0,0,0.85)',
        display:         'flex',
        alignItems:      'flex-start',
        justifyContent:  'center',
        padding:         '1rem',
        overflowY:       'auto',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
        background:    '#1a1a1a',
        border:        '1px solid #f87171',
        borderRadius:  '8px',
        padding:       '1.25rem',
        maxWidth:      '90vw',
        width:         '600px',
        marginTop:     '2rem',
        color:         '#f8fafc',
        fontFamily:    'monospace',
        fontSize:      '0.75rem',
        lineHeight:    '1.6',
        whiteSpace:    'pre-wrap',
        wordBreak:     'break-all',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
        color:         '#f87171',
        fontWeight:    'bold',
        fontSize:      '0.875rem',
        marginBottom:  '0.75rem',
        fontFamily:    'sans-serif',
    });
    title.textContent = '⚠ Client Error';

    const pre = document.createElement('pre');
    pre.style.margin = '0';
    pre.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Dismiss';
    Object.assign(closeBtn.style, {
        marginTop:     '1rem',
        padding:       '0.4rem 1rem',
        background:    '#374151',
        color:         '#f8fafc',
        border:        'none',
        borderRadius:  '4px',
        cursor:        'pointer',
        fontFamily:    'sans-serif',
        fontSize:      '0.8rem',
        display:       'block',
    });
    closeBtn.onclick = () => overlay.remove();

    box.appendChild(title);
    box.appendChild(pre);
    box.appendChild(closeBtn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

// ─── React error boundary ─────────────────────────────────────────────────────
// Catches errors thrown during render / lifecycle of any child component.

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        const stack = info?.componentStack || '';
        showDebugAlert(`React render error\n\n${error?.message}\n${error?.stack}\n\nComponent stack:${stack}`);
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: '2rem', color: '#f87171', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    Render crashed — see error overlay.
                </div>
            );
        }
        return this.props.children;
    }
}

// ─── Combined export ──────────────────────────────────────────────────────────

export default function ErrorDebugOverlay({ children }) {
    return (
        <ErrorBoundary>
            <RuntimeErrorListener />
            {children}
        </ErrorBoundary>
    );
}

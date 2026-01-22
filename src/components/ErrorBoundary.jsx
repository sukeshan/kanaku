import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        // Try to clear local storage if it's potentially corrupted data causing the crash
        if (window.confirm('Resetting app data can fix crash loops. This will NOT delete your cloud data if synced. Continue?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#131316',
                    color: '#fff',
                    fontFamily: "'Outfit', sans-serif",
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'rgba(255, 107, 107, 0.1)',
                        padding: '30px',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 107, 107, 0.2)',
                        maxWidth: '500px',
                        width: '100%'
                    }}>
                        <AlertTriangle size={64} color="#ff6b6b" style={{ marginBottom: '20px' }} />
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Something went wrong</h1>
                        <p style={{ color: '#a0a0b0', marginBottom: '30px', lineHeight: '1.5' }}>
                            The application encountered an unexpected error.
                        </p>

                        <div style={{ background: '#000', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'left', overflow: 'auto', maxHeight: '150px', fontSize: '0.85rem', color: '#ff6b6b' }}>
                            <code>{this.state.error && this.state.error.toString()}</code>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    background: '#6c5ce7',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <RefreshCw size={18} /> Reload App
                            </button>

                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    background: 'transparent',
                                    color: '#ff6b6b',
                                    border: '1px solid #ff6b6b',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Reset Data
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

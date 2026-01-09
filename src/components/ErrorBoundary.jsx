import { Component } from 'react';
import logger from '../utils/logger';

/**
 * 에러 바운더리 컴포넌트
 * 예상치 못한 에러 발생 시 앱 전체 크래시를 방지합니다.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        logger.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback">
                    <div className="error-fallback-icon">
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h2>문제가 발생했습니다</h2>
                    <p>예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해 주세요.</p>
                    <div className="error-fallback-actions">
                        <button
                            className="btn btn-primary"
                            onClick={this.handleReload}
                        >
                            페이지 새로고침
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={this.handleReset}
                        >
                            다시 시도
                        </button>
                    </div>
                    {import.meta.env?.DEV && this.state.error && (
                        <details className="error-fallback-details">
                            <summary>오류 상세 정보 (개발자용)</summary>
                            <pre>{this.state.error.toString()}</pre>
                            {this.state.errorInfo && (
                                <pre>{this.state.errorInfo.componentStack}</pre>
                            )}
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

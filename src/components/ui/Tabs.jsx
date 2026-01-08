import React from 'react';

/**
 * 탭 컴포넌트
 */
const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
    return (
        <div className={`tabs ${className}`}>
            {tabs.map((tab) => {
                const IconElement = tab.icon;

                // 아이콘 렌더링 함수
                const renderIcon = () => {
                    if (!IconElement) return null;

                    // 이미 렌더링된 JSX Element인 경우 (React.isValidElement로 확인)
                    if (React.isValidElement(IconElement)) {
                        return IconElement;
                    }

                    // 함수(React Component) 또는 ForwardRef 객체인 경우
                    // ForwardRef는 typeof가 'object'이지만 $$typeof가 Symbol(react.forward_ref)
                    if (typeof IconElement === 'function' ||
                        (typeof IconElement === 'object' && IconElement.$$typeof)) {
                        return <IconElement size={16} style={{ marginRight: 6 }} />;
                    }

                    return null;
                };

                return (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
                        onClick={() => onChange(tab.id)}
                    >
                        {renderIcon()}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default Tabs;

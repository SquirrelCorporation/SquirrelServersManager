import React, { useState } from 'react';
import { Skeleton, Tooltip } from 'antd';

export interface CountIndicatorProps {
  count: number | null | undefined;
  size?: number;
  isLoading?: boolean;
  tooltipText?: string;
  label?: string;
  errorText?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Count Indicator Component
 * Displays numerical counts in a bordered box with hover effects
 */
const CountIndicator: React.FC<CountIndicatorProps> = ({
  count,
  size = 50,
  isLoading = false,
  tooltipText,
  label,
  errorText = 'N/A',
  className,
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Skeleton.Node active style={{ width: size, height: size }}>
          <div />
        </Skeleton.Node>
      );
    }

    const displayValue =
      count === null || count === undefined || isNaN(count) ? errorText : count;

    const strokeWidth = 4;
    const baseBorderColor = '#4A5568';
    const hoverBorderColor = '#636E82';
    const borderColor = isHovered ? hoverBorderColor : baseBorderColor;
    const borderRadius = '8px';

    return (
      <div
        className={className}
        style={{
          ...style,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          textAlign: 'center',
          border: `${strokeWidth}px solid ${borderColor}`,
          borderRadius: borderRadius,
          boxSizing: 'border-box',
          transition: 'border-color 0.3s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span
          style={{
            fontSize: size * 0.25,
            fontWeight: 600,
            color: '#E2E8F0',
            lineHeight: 1,
          }}
        >
          {displayValue}
        </span>
        {label && (
          <span
            style={{
              fontSize: size * 0.18,
              color: '#A0AEC0',
              lineHeight: 1,
              marginTop: size * 0.05,
            }}
          >
            {label}
          </span>
        )}
      </div>
    );
  };

  if (tooltipText) {
    return <Tooltip title={tooltipText}>{renderContent()}</Tooltip>;
  }

  return renderContent();
};

export default React.memo(CountIndicator);
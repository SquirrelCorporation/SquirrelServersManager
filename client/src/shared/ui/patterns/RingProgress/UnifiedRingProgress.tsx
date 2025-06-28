import React, { useState, useMemo } from 'react';
import { Tooltip, Skeleton } from 'antd';
import type { ReactNode } from 'react';

export type RingProgressType = 'cpu' | 'memory' | 'disk' | 'custom';

export interface RingProgressProps {
  // Core props
  percent: number; // Percentage value (0 to 100)
  size?: number; // Diameter of the ring in pixels
  strokeWidth?: number; // Thickness of the ring
  
  // Visual customization
  type?: RingProgressType; // Type to determine base color
  showText?: boolean; // Whether to show the percentage text
  customText?: string; // Custom text to show instead of percentage
  icon?: ReactNode; // Icon to show in the center
  
  // Colors
  strokeColor?: string | { from: string; to: string }; // Custom stroke color
  trackColor?: string; // Background track color
  hoverTrackColor?: string; // Hover state track color
  
  // Behavior
  tooltipText?: string; // Optional tooltip text
  loading?: boolean; // Loading state
  error?: boolean; // Error state
  errorText?: string; // Text to display on error
  
  // Thresholds
  warningThreshold?: number; // Custom warning threshold (default: 70)
  dangerThreshold?: number; // Custom danger threshold (default: 90)
  
  // Animation
  animationDuration?: number; // Animation duration in ms
  
  // Additional styling
  className?: string;
  style?: React.CSSProperties;
}

const UnifiedRingProgress: React.FC<RingProgressProps> = ({
  percent,
  size = 60,
  strokeWidth = 4,
  type = 'cpu',
  showText = true,
  customText,
  icon,
  strokeColor,
  trackColor: customTrackColor,
  hoverTrackColor: customHoverTrackColor,
  tooltipText,
  loading = false,
  error = false,
  errorText = 'N/A',
  warningThreshold = 70,
  dangerThreshold = 90,
  animationDuration = 300,
  className,
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  // Clamp percent between 0 and 100
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clampedPercent / 100) * circumference;

  // Color configuration
  const colorConfig = useMemo(() => {
    const colors = {
      cpu: { normal: '#38A169', warning: '#ECC94B', danger: '#E53E3E' },
      memory: { normal: '#3182CE', warning: '#ECC94B', danger: '#E53E3E' },
      disk: { normal: '#A0AEC0', warning: '#ECC94B', danger: '#E53E3E' },
      custom: { normal: '#38A169', warning: '#ECC94B', danger: '#E53E3E' },
    };
    
    return colors[type] || colors.custom;
  }, [type]);

  // Determine progress color
  const progressColor = useMemo(() => {
    if (error) return '#718096'; // Gray for error state
    if (strokeColor) {
      if (typeof strokeColor === 'string') return strokeColor;
      // Handle gradient - would need additional SVG defs for gradient
      return strokeColor.from;
    }
    
    if (clampedPercent >= dangerThreshold) return colorConfig.danger;
    if (clampedPercent >= warningThreshold) return colorConfig.warning;
    return colorConfig.normal;
  }, [clampedPercent, strokeColor, error, colorConfig, warningThreshold, dangerThreshold]);

  // Track colors
  const baseTrackColor = customTrackColor || '#4A5568';
  const hoverTrackColor = customHoverTrackColor || '#636E82';
  const trackColor = isHovered ? hoverTrackColor : baseTrackColor;

  // Text configuration
  const textFontSize = size * 0.22;
  const iconSize = size * 0.2;
  
  // Display text
  const displayText = useMemo(() => {
    if (error) return errorText;
    if (customText) return customText;
    return `${Math.round(clampedPercent)}%`;
  }, [error, errorText, customText, clampedPercent]);

  // Loading state
  if (loading) {
    return <Skeleton.Avatar active size={size} shape="circle" />;
  }

  // SVG content
  const svgContent = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{ overflow: 'visible', ...style }}
    >
      {/* Define gradient if needed */}
      {typeof strokeColor === 'object' && (
        <defs>
          <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={strokeColor.from} />
            <stop offset="100%" stopColor={strokeColor.to} />
          </linearGradient>
        </defs>
      )}
      
      {/* Background Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
        style={{ transition: `stroke ${animationDuration}ms ease` }}
      />
      
      {/* Progress Arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={
          typeof strokeColor === 'object' 
            ? `url(#gradient-${type})` 
            : progressColor
        }
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        style={{ 
          transition: `stroke-dashoffset ${animationDuration}ms ease, stroke ${animationDuration}ms ease`,
          opacity: error ? 0.5 : 1,
        }}
      />
      
      {/* Content (Icon + Text) */}
      {showText && (
        <foreignObject x="0" y="0" width={size} height={size}>
          <div
            {...({
              xmlns: 'http://www.w3.org/1999/xhtml',
              style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: error ? '#A0AEC0' : '#E2E8F0',
                fontSize: textFontSize,
                fontWeight: 500,
                lineHeight: 1.2,
                textAlign: 'center',
              },
            } as any)}
          >
            {icon && (
              <span
                style={{
                  display: 'block',
                  fontSize: iconSize,
                  marginBottom: size * 0.02,
                  opacity: error ? 0.5 : 1,
                }}
              >
                {icon}
              </span>
            )}
            <span>{displayText}</span>
          </div>
        </foreignObject>
      )}
    </svg>
  );

  // Conditionally wrap with Tooltip
  if (tooltipText) {
    return <Tooltip title={tooltipText}>{svgContent}</Tooltip>;
  }

  return svgContent;
};

export default UnifiedRingProgress;
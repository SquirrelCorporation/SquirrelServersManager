import React, { useState } from 'react';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react'; // Import ReactNode

export type RingProgressType = 'cpu' | 'memory' | 'disk';

interface CustomRingProgressProps {
  percent: number; // Percentage value (0 to 100)
  size?: number; // Diameter of the ring in pixels
  strokeWidth?: number; // Thickness of the ring
  type?: RingProgressType; // Type to determine base color
  showText?: boolean; // Whether to show the percentage text
  tooltipText?: string; // Optional tooltip text
  icon?: ReactNode; // Add icon prop
}

const CustomRingProgress: React.FC<CustomRingProgressProps> = ({
  percent,
  size = 60,
  strokeWidth = 4,
  type = 'cpu',
  showText = true,
  tooltipText,
  icon, // Destructure icon prop
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;

  // Clamp percent between 0 and 100
  const clampedPercent = Math.max(0, Math.min(100, percent));

  const getColor = (p: number, t: RingProgressType): string => {
    const thresholds = { warning: 70, danger: 90 };
    const colors = {
      cpu: { normal: '#38A169', warning: '#ECC94B', danger: '#E53E3E' },
      memory: { normal: '#3182CE', warning: '#ECC94B', danger: '#E53E3E' },
      disk: { normal: '#A0AEC0', warning: '#ECC94B', danger: '#E53E3E' },
    };
    const typeColors = colors[t] || colors.cpu;

    if (p >= thresholds.danger) return typeColors.danger;
    if (p >= thresholds.warning) return typeColors.warning;
    return typeColors.normal;
  };

  const progressColor = getColor(clampedPercent, type);
  const baseTrackColor = '#4A5568';
  const hoverTrackColor = '#636E82'; // Lighter gray for hover
  const trackColor = isHovered ? hoverTrackColor : baseTrackColor;

  const textFontSize = size * 0.22; // Slightly smaller font size to accommodate icon
  const iconSize = size * 0.2; // Adjust icon size relative to overall size

  // Define the SVG content separately
  const svgContent = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ overflow: 'visible' }} // Allow foreignObject content to potentially overflow slightly if needed
    >
      {/* Background Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
        style={{ transition: 'stroke 0.3s ease' }}
      />
      {/* Progress Arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`} // Start from the top
        style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
      />
      {/* Content (Icon + Text) using foreignObject */}
      {showText && (
        <foreignObject x="0" y="0" width={size} height={size}>
          {/* Required namespace for XHTML */}
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
                color: '#E2E8F0',
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
                }}
              >
                {icon}
              </span>
            )}
            <span>{`${Math.round(clampedPercent)}%`}</span>
          </div>
        </foreignObject>
      )}
    </svg>
  );

  // Conditionally wrap the SVG content with Tooltip
  if (tooltipText) {
    return <Tooltip title={tooltipText}>{svgContent}</Tooltip>;
  }

  // Return just the SVG if no tooltip text is provided
  return svgContent;
};

export default CustomRingProgress;

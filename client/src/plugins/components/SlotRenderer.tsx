import React from 'react';
import { useSlot } from '../contexts/plugin-context';

/**
 * Props for the SlotRenderer component
 */
interface SlotRendererProps {
  /**
   * The name of the slot to render
   */
  slotName: string;

  /**
   * Props to pass to slot components
   */
  slotProps?: Record<string, any>;

  /**
   * Fallback component to render if no components are registered for the slot
   */
  fallback?: React.ReactNode;
}

/**
 * A component that renders plugin components for a specific slot
 */
const SlotRenderer: React.FC<SlotRendererProps> = ({
  slotName,
  slotProps = {},
  fallback = null,
}) => {
  // Get the slot renderer for this slot
  const SlotComponent = useSlot(slotName);

  // If the slot has no components, render the fallback
  if (!SlotComponent) {
    return <>{fallback}</>;
  }

  // Render the slot components with props
  return <SlotComponent {...slotProps} />;
};

export default SlotRenderer;

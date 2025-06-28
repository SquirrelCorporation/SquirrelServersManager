import { message as antMessage } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { motion } from 'framer-motion';
import React from 'react';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
  WarningFilled,
} from '@ant-design/icons';

// Reusable MessageContent component with styling and animation
const MessageContent: React.FC<{
  content: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'loading';
  onClose?: () => void; // Provided by antd message.open
}> = ({ content, type }) => {
  const getBackgroundColorAndIcon = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'rgba(22, 163, 74, 0.9)', // Green
          icon: <CheckCircleFilled />,
        };
      case 'error':
        return {
          bgColor: 'rgba(220, 38, 38, 0.9)', // Red
          icon: <CloseCircleFilled />,
        };
      case 'warning':
        return {
          bgColor: 'rgba(234, 179, 8, 0.9)', // Yellow
          icon: <WarningFilled />,
        };
      case 'loading':
        return {
          bgColor: 'rgba(59, 130, 246, 0.9)', // Blue
          icon: <LoadingOutlined />,
        };
      default: // Info
        return {
          bgColor: 'rgba(59, 130, 246, 0.9)', // Blue
          icon: <InfoCircleFilled />,
        };
    }
  };

  const { bgColor, icon } = getBackgroundColorAndIcon();

  return (
    <motion.div
      layout // Ensures smooth transition if content size changes
      initial={{ y: -60, opacity: 0, scale: 0.7 }} // Start smaller and further up
      animate={{ y: 0, opacity: 1, scale: 1 }} // Animate to final position/size
      exit={{ y: 40, opacity: 0, scale: 0.8, transition: { duration: 0.15 } }} // Faster exit upwards
      transition={{
        delay: 0.2, // Added delay for the whole animation
        type: 'spring',
        stiffness: 350, // Decreased stiffness (slower/softer snap)
        damping: 35, // Increased damping (less oscillation)
        mass: 1, // Standard mass
      }}
      style={{
        backgroundColor: bgColor,
        backdropFilter: 'blur(12px)',
        borderRadius: '9999px',
        padding: '8px 16px',
        boxShadow: '0 5px 25px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        minWidth: '150px',
        maxWidth: '450px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '8px',
        overflow: 'hidden', // Hide content during initial scale animation
      }}
    >
      {/* Icon animation */}
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }} // Start smaller and invisible
        animate={{ opacity: 1, scale: 1 }} // Animate to full size and visible
        transition={{
          delay: 0.5, // Increased delay (starts after main pill delay + 0.15s)
          duration: 0.2,
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        style={{ display: 'flex', alignItems: 'center' }} // Keep flex alignment
      >
        {icon}
      </motion.span>
      {/* Text - remains static relative to pill */}
      <span style={{ lineHeight: '1.1' }}>{content}</span>
    </motion.div>
  );
};

// Function to show the message using Ant Design's system but with custom content
const showDynamicMessage = (
  content: string,
  type: 'success' | 'error' | 'info' | 'warning' | 'loading',
  duration?: number,
) => {
  // Determine default duration based on type if none is provided
  const defaultDuration = type === 'error' ? 6 : 3;
  const finalDuration = duration !== undefined ? duration : defaultDuration;

  // Generate random id
  const key = Math.random().toString(36).substring(2, 15);

  antMessage.open({
    key,
    content: <MessageContent content={content} type={type} />,
    duration: finalDuration,
    icon: <></>, // Explicitly remove the default icon
    className: 'dynamic-message-override',
    style: {
      padding: 0,
      margin: 0,
      backgroundColor: 'transparent',
      boxShadow: 'none',
      display: 'flex',
      justifyContent: 'center',
    },
  });
  return key;
};

// Create enhanced message API
const message = {
  ...antMessage, // Include standard antd methods
  // Implement our custom dynamic methods
  success({ content, duration }: { content: string; duration?: number }) {
    return showDynamicMessage(content, 'success', duration);
  },
  error({ content, duration }: { content: string; duration?: number }) {
    return showDynamicMessage(content, 'error', duration);
  },
  info({ content, duration }: { content: string; duration?: number }) {
    return showDynamicMessage(content, 'info', duration);
  },
  warning({ content, duration }: { content: string; duration?: number }) {
    return showDynamicMessage(content, 'warning', duration);
  },
  loading({ content, duration }: { content: string; duration?: number }) {
    return showDynamicMessage(content, 'loading', duration);
  },
};

export default message;

// CSS overrides - will be applied when the component is imported
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  .dynamic-message-override .ant-message-notice-content {
    padding: 0 !important;
    background-color: transparent !important;
    box-shadow: none !important;
    display: flex;
    justify-content: center;
  }
  .dynamic-message-override {
      /* Adjust positioning if needed - antd might add top/left */
      /* Example: position: relative !important; */
  }
`;
document.head.appendChild(styleSheet);
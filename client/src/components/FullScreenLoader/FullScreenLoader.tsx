import React, { useEffect, useRef } from 'react';
import { Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import runningFoxSvg from '../../../public/squirrels/optimized_running_fox.svg';

const { Text } = Typography;

// Default Polling Configuration (Internal to this component)
const DEFAULT_POLL_URL = '/api/ping';
const DEFAULT_POLL_INTERVAL_MS = 2000; // Check every 2 seconds
const DEFAULT_MAX_POLL_ATTEMPTS = 30; // Try for 60 seconds total
const DEFAULT_INITIAL_POLL_DELAY_MS = 5000; // Wait 5 seconds before starting

interface FullScreenLoaderProps {
  isVisible: boolean;
  message?: string;
  iconUrl?: string;
  iconAlt?: string;
  onPollSuccess?: () => void; // Callback on successful poll
  onPollTimeout?: () => void; // Callback if polling times out
}

// Define styles as constants for better readability
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(255, 255, 255, 0.7)', // White transparent background
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  transition: 'opacity 0.3s ease-in-out', // Smooth transition
};

const contentBoxStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '30px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark transparent background for content
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  textAlign: 'center',
  minWidth: '300px', // Adjusted minWidth
  color: 'white', // Ensure text is visible on dark background
};

const iconStyle: React.CSSProperties = {
  width: '80px', // Adjusted size
  height: 'auto',
  marginBottom: '20px',
};

const loadingIconStyle: React.CSSProperties = {
  color: 'white',
  fontSize: '32px',
  marginBottom: '15px',
};

// Define keyframes for shimmer effect
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

const messageStyle: React.CSSProperties = {
  // Shimmer effect properties
  backgroundImage:
    'linear-gradient(to right, #ffffff 0%, #aaaaaa 40%, #ffffff 60%, #ffffff 100%)',
  backgroundSize: '800px 100%', // Make background wider than text area
  backgroundClip: 'text',
  color: 'transparent', // Make text transparent to show gradient
  animation: 'shimmer 2.5s linear infinite', // Apply shimmer animation

  // Existing styles
  // color: 'white', // Ensure message is white - Overridden by shimmer
  fontSize: '16px',
  marginTop: '15px',
};

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  isVisible,
  message,
  onPollSuccess,
  onPollTimeout,
}) => {
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAttemptRef = useRef<number>(0);

  useEffect(() => {
    const cleanup = () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };

    // Only poll if component is visible AND callbacks are provided
    if (isVisible && onPollSuccess && onPollTimeout) {
      currentAttemptRef.current = 0; // Reset attempts

      const poll = async () => {
        if (pollTimeoutRef.current === null) return; // Check if polling should continue

        currentAttemptRef.current += 1;
        console.log(
          `Polling attempt ${currentAttemptRef.current}/${DEFAULT_MAX_POLL_ATTEMPTS} for ${DEFAULT_POLL_URL}`,
        );

        if (currentAttemptRef.current > DEFAULT_MAX_POLL_ATTEMPTS) {
          console.error(
            `Polling timed out for ${DEFAULT_POLL_URL} after ${DEFAULT_MAX_POLL_ATTEMPTS} attempts.`,
          );
          cleanup();
          onPollTimeout();
          return;
        }

        try {
          const urlWithTimestamp = `${DEFAULT_POLL_URL}${DEFAULT_POLL_URL.includes('?') ? '&' : '?'}t=${Date.now()}`;
          await axios.get(urlWithTimestamp, {
            timeout: DEFAULT_POLL_INTERVAL_MS - 100,
          });

          console.log(`Polling successful for ${DEFAULT_POLL_URL}`);
          cleanup();
          onPollSuccess();
        } catch (error) {
          console.debug(
            `Poll attempt ${currentAttemptRef.current} failed. Retrying in ${DEFAULT_POLL_INTERVAL_MS}ms...`,
          );
          pollTimeoutRef.current = setTimeout(poll, DEFAULT_POLL_INTERVAL_MS);
        }
      };

      // Start the first poll after the initial delay
      pollTimeoutRef.current = setTimeout(poll, DEFAULT_INITIAL_POLL_DELAY_MS);
    } else {
      cleanup(); // Ensure polling stops if visibility changes or callbacks missing
    }

    return cleanup; // Cleanup on unmount or dependency change
  }, [isVisible, onPollSuccess, onPollTimeout]); // Dependencies: only need callbacks and visibility

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{ ...overlayStyle, opacity: isVisible ? 1 : 0 }}>
      <div style={contentBoxStyle}>
        <img
          src={runningFoxSvg}
          alt={'Restarting Server...'}
          style={iconStyle}
        ></img>
        <LoadingOutlined style={loadingIconStyle} />
        <Text style={messageStyle}>{message || 'Restarting Server'}</Text>
      </div>
      <style>{shimmerKeyframes}</style>
    </div>
  );
};

export default FullScreenLoader;

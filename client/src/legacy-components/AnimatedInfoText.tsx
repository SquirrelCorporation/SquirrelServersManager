import React, { useEffect, useRef, useState } from 'react';

interface AnimatedInfoTextProps {
  text: string;
}

const ANIMATION_DURATION = 2; // seconds
const PAUSE_DURATION = 5; // seconds (pause at each end)

const AnimatedInfoText: React.FC<AnimatedInfoTextProps> = ({ text }) => {
  const [playAnimation, setPlayAnimation] = useState(true);
  const spanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Play animation only once
    if (playAnimation) {
      const totalDuration = (ANIMATION_DURATION + PAUSE_DURATION * 2) * 1000;
      const timer = setTimeout(() => setPlayAnimation(false), totalDuration);
      return () => clearTimeout(timer);
    }
  }, [playAnimation]);

  useEffect(() => {
    setPlayAnimation(true);
  }, [text]);

  return (
    <div
      style={{
        overflow: 'hidden',
        width: '100%',
        height: 24,
        display: 'flex',
        alignItems: 'right',
        marginRight: 0,
        position: 'relative',
      }}
    >
      {playAnimation && (
        <>
          <div
            ref={spanRef}
            className={playAnimation ? 'sliding-info-text' : ''}
            style={{
              whiteSpace: 'nowrap',
              display: 'inline-block',
              fontSize: 14,
              fontWeight: 500,
              color: 'inherit', // Use default text color
              transition: 'none',
            }}
            aria-label={text}
          >
            {text}
          </div>

          <style>{`
          @keyframes slide-left-right-once {
            0% { transform: translateX(100%); }
            10% { transform: translateX(100%); }
            40% { transform: translateX(0%); }
            40% { transform: translateX(0%); }
            60% { transform: translateX(0%); }
            60% { transform: translateX(0%); }
            90% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }
          .sliding-info-text {
            animation: slide-left-right-once ${ANIMATION_DURATION + PAUSE_DURATION * 2}s linear 1;
            /* Pause at each end by repeating the same keyframe value */
          }
        `}</style>
        </>
      )}
    </div>
  );
};

export default AnimatedInfoText;

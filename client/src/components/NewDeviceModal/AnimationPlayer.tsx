import { DotLottie, DotLottieReact } from '@lottiefiles/dotlottie-react';
import React from 'react';

const intermission = 5000;

const AnimationPlayer = () => {
  const [dotLottie, setDotLottie] = React.useState<DotLottie | null>(null);
  React.useEffect(() => {
    function onComplete() {
      // Set a timeout to pause for the intermission duration, then replay the animation
      setTimeout(() => dotLottie?.play(), intermission);
    }

    // Add the event listener for the complete event
    dotLottie?.addEventListener('complete', onComplete);

    return () => {
      dotLottie?.removeEventListener('complete', onComplete);
    };
  }, [dotLottie]);
  return (
    <DotLottieReact
      dotLottieRefCallback={setDotLottie}
      src="/lotties/squirrel_find_nut.lottie"
      autoplay
      loop={false}
      mode={'bounce'}
      style={{ height: '90%', width: '90%', alignSelf: 'center' }}
    />
  );
};

export default AnimationPlayer;

import React from 'react';
import { DotLottiePlayer, PlayMode } from '@dotlottie/react-player';

const AnimationPlayer = () => (
  <DotLottiePlayer
    src="/Animation-1709649662243.json"
    autoplay
    loop
    intermission={5000}
    playMode={PlayMode.Bounce}
    style={{ height: '90%', width: '90%', alignSelf: 'center' }}
  />
);

export default AnimationPlayer;

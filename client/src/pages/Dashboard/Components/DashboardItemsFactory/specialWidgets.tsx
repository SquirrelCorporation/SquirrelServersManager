/**
 * Special Widget Definitions (Welcome, Tips, etc.)
 */

import React from 'react';
import WelcomeHeaderSection from '../WelcomeHeaderSection';
import FeaturedAppCard from '../FeaturedAppCard';
import { DashboardItem } from '../../Core/DashboardWidget.types';
import { getSsmTips } from './widgetData';

export const specialWidgets: DashboardItem[] = [
  {
    id: 'welcome-header',
    title: 'Welcome Header',
    size: 'large',
    settings: undefined,
    component: (
      <WelcomeHeaderSection
        buttonText="Go now"
        onButtonClick={() => console.log('Button clicked')}
        illustrationUrl="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Running.png"
      />
    ),
  },
  {
    id: 'tips-of-the-day',
    title: 'Tips of the day',
    size: 'small',
    settings: undefined,
    component: (
      <FeaturedAppCard
        tips={getSsmTips()}
      />
    ),
  },
];
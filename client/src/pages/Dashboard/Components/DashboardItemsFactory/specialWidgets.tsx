/**
 * Special Widget Definitions (Welcome, Tips, etc.)
 */

import React from 'react';
import { history } from '@umijs/max';
import WelcomeHeaderSection from '../WelcomeHeaderSection';
import FeaturedAppCard from '../FeaturedAppCard';
import { DashboardItem } from '../../Core/DashboardWidget.types';
import { getSsmTips } from './widgetData';

export const specialWidgets: DashboardItem[] = [
  {
    id: 'welcome-header',
    title: 'Welcome Header',
    size: 'medium-large',
    settings: undefined,
    component: (
      <WelcomeHeaderSection
        buttonText="Go now"
        onButtonClick={() => history.push('/manage/devices')}
        illustrationUrl="/assets/images/dashboard/welcome/welcome.png"
      />
    ),
  },
  {
    id: 'tips-of-the-day',
    title: 'Tips of the day',
    size: 'small-medium',
    settings: undefined,
    component: (
      <FeaturedAppCard
        tips={getSsmTips()}
      />
    ),
  },
];
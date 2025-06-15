import React from 'react';
import { DashboardItem, WidgetSettings } from './DashboardLayoutEngine';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  UserAddOutlined,
  MessageOutlined,
  PieChartOutlined,
  BarChartOutlined,
  GlobalOutlined,
  DownloadOutlined
} from '@ant-design/icons';

// Import all the dashboard components
import SummaryStatCard from './SummaryStatCard';
import LineChart from './LineChart';
import MiniDonutStatCard from './MiniDonutStatCard';
import BookingStatusCard from './BookingStatusCard';
import ToursAvailableDonutCard from './ToursAvailableDonutCard';
import GradientStatCardWithChart from './GradientStatCardWithChart';
import VisitsPieChartCard from './VisitsPieChartCard';
import WebsiteVisitsBarChartCard from './WebsiteVisitsBarChartCard';
import CompactStatCard from './CompactStatCard';
import DownloadsByOSDonutCard from './DownloadsByOSDonutCard';
import AreaInstalledBarChartCard from './AreaInstalledBarChartCard';
import WelcomeHeaderSection from './WelcomeHeaderSection';
import FeaturedAppCard from './FeaturedAppCard';

// Sample data for line chart - smoother curves
const yearlyData = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
].flatMap((month, index) => {
  // Create smoother data with sine waves for better visualization
  const baseIncome = 70 + Math.sin(index * 0.5) * 30 + (index === 7 ? 40 : 0);
  const baseExpenses = 60 + Math.cos(index * 0.4) * 25;
  
  return [
    {
      month,
      type: 'Total income',
      value: Math.floor(baseIncome)
    },
    {
      month,
      type: 'Total expenses',
      value: Math.floor(baseExpenses)
    }
  ];
});

const bookingStatuses = [
  { name: 'IN PROGRESS', count: '9.91k', percentage: 60, color: '#faad14' },
  { name: 'FAILED', count: '1.95k', percentage: 15, color: '#ff4d4f' },
  { name: 'COMPLETED', count: '9.12k', percentage: 85, color: '#52c41a' },
];

const toursAvailableData = [
  { type: 'Used', value: 120, color: '#52c41a' },
  { type: 'Available', value: 66, color: '#3a3a3e' },
];

const toursLegend = [
  { name: 'Used', value: '120 items', color: '#52c41a' },
  { name: 'Available', value: '66 items', color: '#3a3a3e' },
];

const gradientChartData = Array.from({ length: 10 }, () =>
  Math.floor(Math.random() * 50 + 10),
);

const visitsPieData = [
  { type: 'Category A', value: 43.8, color: '#52c41a' },
  { type: 'Category B', value: 31.3, color: '#faad14' },
  { type: 'Category C', value: 18.8, color: '#1890ff' },
  { type: 'Category D', value: 6.3, color: '#ff4d4f' },
];

const websiteVisitsData = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
].reduce(
  (acc, month) => {
    acc.push({
      month,
      team: 'Group A',
      visits: Math.floor(Math.random() * 60 + 10),
    });
    acc.push({
      month,
      team: 'Group B',
      visits: Math.floor(Math.random() * 60 + 10),
    });
    return acc;
  },
  [] as Array<{ month: string; team: 'Group A' | 'Group B'; visits: number }>,
);

const osDownloadsData = [
  { type: 'Type 1', value: 105345, color: '#1890ff' },
  { type: 'Type 2', value: 55123, color: '#52c41a' },
  { type: 'Type 3', value: 27777, color: '#faad14' },
];

const areaInstallData = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
].reduce(
  (acc, month) => {
    acc.push({
      month,
      region: 'Region A',
      installs: Math.floor(Math.random() * 800 + 100),
    });
    acc.push({
      month,
      region: 'Region B',
      installs: Math.floor(Math.random() * 800 + 100),
    });
    acc.push({
      month,
      region: 'Region C',
      installs: Math.floor(Math.random() * 800 + 100),
    });
    return acc;
  },
  [] as Array<{ month: string; region: string; installs: number }>,
);

// Factory function to create dashboard items
export const createDashboardItems = (): DashboardItem[] => {
  return [
    {
      id: 'welcome-header',
      title: 'Welcome Header',
      size: 'large',
      settings: undefined, // No settings for welcome header
      component: (
        <WelcomeHeaderSection
          userName="Jaydon Frankie"
          greeting="Congratulations"
          subtitle="Best seller of the month you have done 57.6% more sales today."
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
      settings: undefined, // No custom settings for tips carousel
      component: (
        <FeaturedAppCard
          tips={[
            {
              tagText: "FEATURED APP",
              title: "The Rise of Remote Work: Benefits, Challenges, and Best Practices",
              description: "The aroma of freshly brewed coffee filled the air, awakening my senses and preparing me for the day ahead.",
              imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80"
            },
            {
              tagText: "PRODUCTIVITY TIP",
              title: "Mastering Time Management in the Digital Age",
              description: "Discover proven techniques to boost your productivity and achieve work-life balance in today's fast-paced world.",
              imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80"
            },
            {
              tagText: "TECH INSIGHT",
              title: "AI Revolution: How Machine Learning is Transforming Industries",
              description: "Explore the latest advancements in artificial intelligence and their impact on businesses worldwide.",
              imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
            }
          ]}
        />
      ),
    },
    {
      id: 'single-number-variation',
      title: 'Metric Card with Trend',
      size: 'small',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Widget Title', defaultValue: 'Total Count' },
        { type: 'icon', label: 'Icon' }
      ],
      component: (
        <SummaryStatCard
          title="Total Count"
          value="714k"
          trendValue="+2.6"
          trendDirection="up"
          icon={<DashboardOutlined />}
          illustrationUrl="/assets/images/dashboard/booking-illustration.png"
        />
      ),
    },
    {
      id: 'medium-graph',
      title: 'Line Chart',
      size: 'large',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Graph Title', defaultValue: 'Yearly sales' }
      ],
      component: (
        <LineChart
          title="Yearly sales"
          subtitle="(+43%) than last year"
          incomeValue="1.23k"
          incomeLabel="Total income"
          expensesValue="6.79k"
          expensesLabel="Total expenses"
          chartData={yearlyData}
          currentYear={2023}
          availableYears={[2023, 2022, 2021]}
          onYearChange={(year) => console.log('Year changed:', year)}
        />
      ),
    },
    {
      id: 'progress-lines-graph',
      title: 'Progress Bars',
      size: 'medium',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Title', defaultValue: 'Status Overview' }
      ],
      component: (
        <BookingStatusCard 
          title="Status Overview" 
          statuses={bookingStatuses} 
        />
      ),
    },
    {
      id: 'percentage',
      title: 'Mini Donut Chart',
      size: 'small',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Label', defaultValue: 'Completed' },
        { type: 'backgroundColor', label: 'Color', defaultValue: '#52c41a' }
      ],
      component: (
        <MiniDonutStatCard
          percentage={73.9}
          value="38,566"
          label="Completed"
          color="#52c41a"
        />
      ),
    },
    {
      id: 'ring-progress',
      title: 'Donut Chart with Legend',
      size: 'medium',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Title', defaultValue: 'Resource Distribution' }
      ],
      component: (
        <ToursAvailableDonutCard
          title="Resource Distribution"
          totalTours={186}
          mainLabel="Items"
          chartData={toursAvailableData}
          legendItems={toursLegend}
        />
      ),
    },
    {
      id: 'single-number-card-variation',
      title: 'Sparkline Card',
      size: 'small',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Title', defaultValue: 'Weekly Activity' },
        { type: 'icon', label: 'Icon' },
        { type: 'backgroundColor', label: 'Background Color', defaultValue: '#8A2BE2' }
      ],
      component: (
        <GradientStatCardWithChart
          title="Weekly Activity"
          value="714k"
          trendValue="+2.6"
          trendDirection="up"
          icon={<ShoppingOutlined />}
          gradientColors={['#8A2BE2', '#4B0082']}
          lineColor="rgba(255,255,255,0.7)"
          chartData={gradientChartData}
        />
      ),
    },
    {
      id: 'pie-chart',
      title: 'Pie Chart',
      size: 'medium',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Chart Title', defaultValue: 'Category Distribution' }
      ],
      component: (
        <VisitsPieChartCard
          title="Category Distribution"
          chartData={visitsPieData}
        />
      ),
    },
    {
      id: 'website-visits',
      title: 'Grouped Bar Chart',
      size: 'large',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Chart Title', defaultValue: 'Monthly Comparison' }
      ],
      component: (
        <WebsiteVisitsBarChartCard
          title="Monthly Comparison"
          subtitle="(+43%) than last year"
          chartData={websiteVisitsData}
          categoryColors={{ 'Group A': '#40a9ff', 'Group B': '#ffc53d' }}
        />
      ),
    },
    {
      id: 'single-number-variation-popover',
      title: 'Compact Metric Card',
      size: 'small',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Title', defaultValue: 'Active Items' }
      ],
      component: (
        <CompactStatCard
          title="Active Items"
          value="18,765"
          trendValue="+2.6"
          trendDirection="up"
          trendDescription="last 7 days"
          trendColor="#52c41a"
        />
      ),
    },
    {
      id: 'total-downloads',
      title: 'Metric Card with Negative Trend',
      size: 'small',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Title', defaultValue: 'Total Operations' }
      ],
      component: (
        <CompactStatCard
          title="Total Operations"
          value="678"
          trendValue="-0.1"
          trendDirection="down"
          trendDescription="last 7 days"
          trendColor="#ff4d4f"
        />
      ),
    },
    {
      id: 'area-chart',
      title: 'Stacked Area Chart',
      size: 'large',
      settings: [
        { type: 'statistics', label: 'Data Source' },
        { type: 'title', label: 'Chart Title', defaultValue: 'Regional Metrics' }
      ],
      component: (
        <AreaInstalledBarChartCard
          title="Regional Metrics"
          subtitle="(+43%) than last year"
          currentYear={2023}
          availableYears={[2023, 2022, 2021]}
          onYearChange={(year) => console.log('Year changed:', year)}
          chartData={areaInstallData}
          regionColors={{
            'Region A': '#ffc53d',
            'Region B': '#40a9ff',
            'Region C': '#52c41a',
          }}
        />
      ),
    },
  ];
};

export default createDashboardItems;
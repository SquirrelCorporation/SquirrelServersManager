import React from 'react';
import { DashboardItem } from './DashboardLayoutEngine';
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
import TotalIncomesCard from './TotalIncomesCard';
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

// Sample data
const totalIncomesData = Array.from({ length: 20 }, (_, i) => ({
  date: `Day ${i + 1}`,
  value: Math.floor(Math.random() * 500 + 100),
}));

const bookingStatuses = [
  { name: 'PENDING', count: '9.91k', percentage: 60, color: '#faad14' },
  { name: 'CANCELED', count: '1.95k', percentage: 15, color: '#ff4d4f' },
  { name: 'SOLD', count: '9.12k', percentage: 85, color: '#52c41a' },
];

const toursAvailableData = [
  { type: 'Sold out', value: 120, color: '#52c41a' },
  { type: 'Available', value: 66, color: '#3a3a3e' },
];

const toursLegend = [
  { name: 'Sold out', value: '120 tours', color: '#52c41a' },
  { name: 'Available', value: '66 tours', color: '#3a3a3e' },
];

const gradientChartData = Array.from({ length: 10 }, () =>
  Math.floor(Math.random() * 50 + 10),
);

const visitsPieData = [
  { type: 'America', value: 43.8, color: '#52c41a' },
  { type: 'Asia', value: 31.3, color: '#faad14' },
  { type: 'Europe', value: 18.8, color: '#1890ff' },
  { type: 'Africa', value: 6.3, color: '#ff4d4f' },
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
      team: 'Team A',
      visits: Math.floor(Math.random() * 60 + 10),
    });
    acc.push({
      month,
      team: 'Team B',
      visits: Math.floor(Math.random() * 60 + 10),
    });
    return acc;
  },
  [] as Array<{ month: string; team: 'Team A' | 'Team B'; visits: number }>,
);

const osDownloadsData = [
  { type: 'Windows', value: 105345, color: '#1890ff' },
  { type: 'macOS', value: 55123, color: '#52c41a' },
  { type: 'Linux', value: 27777, color: '#faad14' },
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
      region: 'Asia',
      installs: Math.floor(Math.random() * 800 + 100),
    });
    acc.push({
      month,
      region: 'Europe',
      installs: Math.floor(Math.random() * 800 + 100),
    });
    acc.push({
      month,
      region: 'Americas',
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
      size: 'wide',
      component: (
        <WelcomeHeaderSection
          userName="Jaydon Frankie"
          subtitle="Welcome to your customizable dashboard. Add and arrange widgets as you prefer."
          buttonText="Get Started"
          onButtonClick={() => console.log('Button clicked')}
          illustrationUrl="/assets/images/dashboard/welcome-illustration.png"
        />
      ),
    },
    {
      id: 'featured-app',
      title: 'Featured App',
      size: 'medium',
      component: (
        <FeaturedAppCard
          tagText="FEATURED APP"
          title="Mental Health in the Digital Age"
          description="Learn about the latest digital wellness tools and strategies for mental health."
          imageUrl="/assets/images/dashboard/featured-app-image.png"
        />
      ),
    },
    {
      id: 'total-booking',
      title: 'Total Booking',
      size: 'small',
      component: (
        <SummaryStatCard
          title="Total booking"
          value="714k"
          trendValue="+2.6"
          trendDirection="up"
          icon={<DashboardOutlined />}
          illustrationUrl="/assets/images/dashboard/booking-illustration.png"
        />
      ),
    },
    {
      id: 'sold-summary',
      title: 'Sold Summary',
      size: 'small',
      component: (
        <SummaryStatCard
          title="Sold"
          value="311k"
          trendValue="+0.2"
          trendDirection="up"
          icon={<ShoppingCartOutlined />}
          illustrationUrl="/assets/images/dashboard/sold-illustration.png"
        />
      ),
    },
    {
      id: 'canceled-summary',
      title: 'Canceled Summary',
      size: 'small',
      component: (
        <SummaryStatCard
          title="Canceled"
          value="124k"
          trendValue="-0.1"
          trendDirection="down"
          icon={<CloseCircleOutlined />}
          illustrationUrl="/assets/images/dashboard/canceled-illustration.png"
        />
      ),
    },
    {
      id: 'total-incomes',
      title: 'Total Incomes',
      size: 'large',
      component: (
        <TotalIncomesCard
          title="Total incomes"
          amount="$18,765"
          trendPercentage={2.6}
          trendDescription="last month"
          chartData={totalIncomesData}
        />
      ),
    },
    {
      id: 'booking-status',
      title: 'Booking Status',
      size: 'medium',
      component: (
        <BookingStatusCard 
          title="Booked" 
          statuses={bookingStatuses} 
        />
      ),
    },
    {
      id: 'sold-donut',
      title: 'Sold Percentage',
      size: 'small',
      component: (
        <MiniDonutStatCard
          percentage={73.9}
          value="38,566"
          label="Sold"
          color="#52c41a"
        />
      ),
    },
    {
      id: 'pending-payment',
      title: 'Pending Payment',
      size: 'small',
      component: (
        <MiniDonutStatCard
          percentage={45.6}
          value="18,472"
          label="Pending for payment"
          color="#faad14"
        />
      ),
    },
    {
      id: 'tours-available',
      title: 'Tours Available',
      size: 'medium',
      component: (
        <ToursAvailableDonutCard
          title="Tours available"
          totalTours={186}
          mainLabel="Tours"
          chartData={toursAvailableData}
          legendItems={toursLegend}
        />
      ),
    },
    {
      id: 'weekly-sales',
      title: 'Weekly Sales',
      size: 'small',
      component: (
        <GradientStatCardWithChart
          title="Weekly sales"
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
      id: 'new-users',
      title: 'New Users',
      size: 'small',
      component: (
        <GradientStatCardWithChart
          title="New users"
          value="1.35m"
          trendValue="-0.1"
          trendDirection="down"
          icon={<UserAddOutlined />}
          gradientColors={['#1E90FF', '#00008B']}
          lineColor="rgba(255,255,255,0.7)"
          chartData={gradientChartData}
        />
      ),
    },
    {
      id: 'purchase-orders',
      title: 'Purchase Orders',
      size: 'small',
      component: (
        <GradientStatCardWithChart
          title="Purchase orders"
          value="1.72m"
          trendValue="+2.8"
          trendDirection="up"
          icon={<ShoppingCartOutlined />}
          gradientColors={['#FF8C00', '#B8860B']}
          lineColor="rgba(255,255,255,0.7)"
          chartData={gradientChartData}
        />
      ),
    },
    {
      id: 'messages',
      title: 'Messages',
      size: 'small',
      component: (
        <GradientStatCardWithChart
          title="Messages"
          value="234"
          trendValue="+3.6"
          trendDirection="up"
          icon={<MessageOutlined />}
          gradientColors={['#DC143C', '#8B0000']}
          lineColor="rgba(255,255,255,0.7)"
          chartData={gradientChartData}
        />
      ),
    },
    {
      id: 'current-visits',
      title: 'Current Visits',
      size: 'medium',
      component: (
        <VisitsPieChartCard
          title="Current visits"
          chartData={visitsPieData}
        />
      ),
    },
    {
      id: 'website-visits',
      title: 'Website Visits',
      size: 'large',
      component: (
        <WebsiteVisitsBarChartCard
          title="Website visits"
          subtitle="(+43%) than last year"
          chartData={websiteVisitsData}
          categoryColors={{ 'Team A': '#40a9ff', 'Team B': '#ffc53d' }}
        />
      ),
    },
    {
      id: 'active-users',
      title: 'Active Users',
      size: 'small',
      component: (
        <CompactStatCard
          title="Total active users"
          value="18,765"
          trendValue="+2.6"
          trendDirection="up"
          trendDescription="last 7 days"
          trendColor="#52c41a"
        />
      ),
    },
    {
      id: 'total-installed',
      title: 'Total Installed',
      size: 'small',
      component: (
        <CompactStatCard
          title="Total installed"
          value="4,876"
          trendValue="+0.2"
          trendDirection="up"
          trendDescription="last 7 days"
          trendColor="#40a9ff"
        />
      ),
    },
    {
      id: 'total-downloads',
      title: 'Total Downloads',
      size: 'small',
      component: (
        <CompactStatCard
          title="Total downloads"
          value="678"
          trendValue="-0.1"
          trendDirection="down"
          trendDescription="last 7 days"
          trendColor="#ff4d4f"
        />
      ),
    },
    {
      id: 'os-downloads',
      title: 'Downloads by OS',
      size: 'medium',
      component: (
        <DownloadsByOSDonutCard
          title="Current download"
          subtitle="Downloaded by operating system"
          totalDownloadsLabel="Total"
          totalDownloadsValue="188,245"
          chartData={osDownloadsData}
        />
      ),
    },
    {
      id: 'area-installed',
      title: 'Area Installed',
      size: 'large',
      component: (
        <AreaInstalledBarChartCard
          title="Area installed"
          subtitle="(+43%) than last year"
          currentYear={2023}
          availableYears={[2023, 2022, 2021]}
          onYearChange={(year) => console.log('Year changed:', year)}
          chartData={areaInstallData}
          regionColors={{
            Asia: '#ffc53d',
            Europe: '#40a9ff',
            Americas: '#52c41a',
          }}
        />
      ),
    },
  ];
};

export default createDashboardItems;
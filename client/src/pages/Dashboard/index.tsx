import React from 'react';
import { Row, Col, Space } from 'antd';
import {
  DashboardOutlined,
  AppstoreAddOutlined,
  RiseOutlined,
  FallOutlined,
  ShoppingCartOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  UserAddOutlined,
  MessageOutlined,
  PieChartOutlined,
  BarChartOutlined,
  DownloadOutlined,
  GlobalOutlined,
  EyeOutlined,
  BugOutlined,
  UserOutlined,
  LayoutOutlined,
} from '@ant-design/icons';

// Layout Components
import StyledTabContainer, {
  IconWrapper,
  TabLabel,
} from '@/components/Layout/StyledTabContainer';

// Existing Dashboard Components
import MainChartCard from '@/pages/Dashboard/Components/MainChartCard';
import DashboardTop from '@/pages/Dashboard/Components/DashboardTop';
import { useSlot } from '@/plugins/contexts/plugin-context';

// New Demo Components
import SummaryStatCard from '@/pages/Dashboard/Components/SummaryStatCard';
import TotalIncomesCard from '@/pages/Dashboard/Components/TotalIncomesCard';
import MiniDonutStatCard from '@/pages/Dashboard/Components/MiniDonutStatCard';
import BookingStatusCard from '@/pages/Dashboard/Components/BookingStatusCard';
import ToursAvailableDonutCard from '@/pages/Dashboard/Components/ToursAvailableDonutCard';
import GradientStatCardWithChart from '@/pages/Dashboard/Components/GradientStatCardWithChart';
import VisitsPieChartCard from '@/pages/Dashboard/Components/VisitsPieChartCard';
import WebsiteVisitsBarChartCard from '@/pages/Dashboard/Components/WebsiteVisitsBarChartCard';
import WelcomeHeaderSection from '@/pages/Dashboard/Components/WelcomeHeaderSection';
import FeaturedAppCard from '@/pages/Dashboard/Components/FeaturedAppCard';
import CompactStatCard from '@/pages/Dashboard/Components/CompactStatCard';
import DownloadsByOSDonutCard from '@/pages/Dashboard/Components/DownloadsByOSDonutCard';
import AreaInstalledBarChartCard from '@/pages/Dashboard/Components/AreaInstalledBarChartCard';

// Customizable Dashboard Engine
import DashboardLayoutEngine from '@/pages/Dashboard/Components/DashboardLayoutEngine';
import { createDashboardItems } from '@/pages/Dashboard/Components/DashboardItemsFactory';

// --- Placeholder Data for Demo Components ---

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

// --- Component Start ---

const Index: React.FC = () => {
  // Get the dashboard widgets slot renderer
  const DashboardWidgetsSlot = useSlot('dashboard-widgets');
  // Create available dashboard items for the customizable dashboard
  const availableDashboardItems = createDashboardItems();

  const tabItems = [
    {
      key: 'main',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="#1890ff">
            <DashboardOutlined />
          </IconWrapper>
          <span>Main Dashboard</span>
        </TabLabel>
      ),
      children: (
        <>
          <DashboardTop />
          <MainChartCard />
          {/* Render plugin dashboard widgets */}
          <div style={{ marginTop: '24px' }}>
            <DashboardWidgetsSlot />
          </div>
        </>
      ),
    },
    {
      key: 'demo',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="#52c41a">
            <AppstoreAddOutlined />
          </IconWrapper>
          <span>Demo Components</span>
        </TabLabel>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Welcome Header */}
          <Row gutter={[24, 24]}>
           <Col xs={24} lg={16}>
          <WelcomeHeaderSection
            userName="Jaydon Frankie"
            subtitle="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
            buttonText="Go now"
            onButtonClick={() => console.log('Button clicked')}
            illustrationUrl="/assets/images/dashboard/welcome-illustration.png" // Replace with actual path
          />
            </Col>
            <Col xs={24} lg={8}>
          <FeaturedAppCard
            tagText="FEATURED APP"
            title="Mental Health in the Digital Age: Navi..."
            description="He carefully crafted a beautiful sculpture out of clay, ..."
            imageUrl="/assets/images/dashboard/featured-app-image.png" // Replace with actual path
          />
            </Col>
          </Row>
          {/* Top Row Stat Cards (Screenshot 1 Style) */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={8}>
              <SummaryStatCard
                title="Total booking"
                value="714k"
                trendValue="+2.6"
                trendDirection="up"
                icon={<DashboardOutlined />} // Placeholder Icon
                illustrationUrl="/assets/images/dashboard/booking-illustration.png" // Replace with actual path
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <SummaryStatCard
                title="Sold"
                value="311k"
                trendValue="+0.2"
                trendDirection="up"
                icon={<ShoppingCartOutlined />} // Placeholder Icon
                illustrationUrl="/assets/images/dashboard/sold-illustration.png" // Replace with actual path
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <SummaryStatCard
                title="Canceled"
                value="124k"
                trendValue="-0.1"
                trendDirection="down"
                icon={<CloseCircleOutlined />} // Placeholder Icon
                illustrationUrl="/assets/images/dashboard/canceled-illustration.png" // Replace with actual path
              />
            </Col>
          </Row>

          {/* Second Row (Screenshot 1 Style) */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              {/* Note: TotalIncomesCard may have rendering issues due to AreaConfig problems */}
              <TotalIncomesCard
                title="Total incomes"
                amount="$18,765"
                trendPercentage={2.6}
                trendDescription="last month"
                chartData={totalIncomesData}
              />
            </Col>
            <Col xs={24} lg={8}>
              <BookingStatusCard title="Booked" statuses={bookingStatuses} />
            </Col>
          </Row>

          {/* Third Row (Screenshot 1 Style) */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={8}>
              <MiniDonutStatCard
                percentage={73.9}
                value="38,566"
                label="Sold"
                color="#52c41a"
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <MiniDonutStatCard
                percentage={45.6}
                value="18,472"
                label="Pending for payment"
                color="#faad14"
              />
            </Col>
            <Col xs={24} lg={8}>
              <ToursAvailableDonutCard
                title="Tours available"
                totalTours={186}
                mainLabel="Tours"
                chartData={toursAvailableData}
                legendItems={toursLegend}
              />
            </Col>
          </Row>

          {/* Gradient Cards (Screenshot 2 Style) */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <GradientStatCardWithChart
                title="Weekly sales"
                value="714k"
                trendValue="+2.6"
                trendDirection="up"
                icon={<ShoppingOutlined />}
                gradientColors={['#8A2BE2', '#4B0082']} // Purple gradient
                lineColor="rgba(255,255,255,0.7)"
                chartData={gradientChartData} // Optional
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <GradientStatCardWithChart
                title="New users"
                value="1.35m"
                trendValue="-0.1"
                trendDirection="down"
                icon={<UserAddOutlined />}
                gradientColors={['#1E90FF', '#00008B']} // Blue gradient
                lineColor="rgba(255,255,255,0.7)"
                chartData={gradientChartData} // Optional
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <GradientStatCardWithChart
                title="Purchase orders"
                value="1.72m"
                trendValue="+2.8"
                trendDirection="up"
                icon={<ShoppingCartOutlined />}
                gradientColors={['#FF8C00', '#B8860B']} // Orange gradient
                lineColor="rgba(255,255,255,0.7)"
                chartData={gradientChartData} // Optional
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <GradientStatCardWithChart
                title="Messages"
                value="234"
                trendValue="+3.6"
                trendDirection="up"
                icon={<MessageOutlined />}
                gradientColors={['#DC143C', '#8B0000']} // Red gradient
                lineColor="rgba(255,255,255,0.7)"
                chartData={gradientChartData} // Optional
              />
            </Col>
          </Row>

          {/* Pie and Bar Charts (Screenshot 2 Style) */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <VisitsPieChartCard
                title="Current visits"
                chartData={visitsPieData}
              />
            </Col>
            <Col xs={24} lg={16}>
              <WebsiteVisitsBarChartCard
                title="Website visits"
                subtitle="(+43%) than last year"
                chartData={websiteVisitsData}
                categoryColors={{ 'Team A': '#40a9ff', 'Team B': '#ffc53d' }}
              />
            </Col>
          </Row>
          {/* Compact Stats (Screenshot 4 Style) */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={8}>
              <CompactStatCard
                title="Total active users"
                value="18,765"
                trendValue="+2.6"
                trendDirection="up"
                trendDescription="last 7 days"
                trendColor="#52c41a"
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <CompactStatCard
                title="Total installed"
                value="4,876"
                trendValue="+0.2"
                trendDirection="up"
                trendDescription="last 7 days"
                trendColor="#40a9ff"
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <CompactStatCard
                title="Total downloads"
                value="678"
                trendValue="-0.1"
                trendDirection="down"
                trendDescription="last 7 days"
                trendColor="#ff4d4f"
              />
            </Col>
          </Row>

          {/* Download/Install Charts (Screenshot 4 Style) */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <DownloadsByOSDonutCard
                title="Current download"
                subtitle="Downloaded by operating system"
                totalDownloadsLabel="Total"
                totalDownloadsValue="188,245"
                chartData={osDownloadsData}
              />
            </Col>
            <Col xs={24} lg={16}>
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
            </Col>
          </Row>
        </Space>
      ),
    },
    {
      key: 'customizable',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="#722ed1">
            <LayoutOutlined />
          </IconWrapper>
          <span>Customizable Dashboard</span>
        </TabLabel>
      ),
      children: (
        <DashboardLayoutEngine availableItems={availableDashboardItems} />
      ),
    },
  ];

  return (
    <StyledTabContainer
      header={{
        title: 'Dashboard Overview',
      }}
      tabItems={tabItems}
      defaultActiveKey="main" // Or "demo" if you want that default
    />
  );
};

export default Index;

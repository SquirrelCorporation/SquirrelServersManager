import HeaderDropdown from '@/components/HeaderDropdown';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { useModel } from '@umijs/max';
import {
  Avatar,
  Badge,
  DropdownProps,
  MenuProps,
  Spin,
  Typography,
} from 'antd';
import React from 'react';

export const DevicesHeaderWidget: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const actionClassName = useEmotionCss(({ token }) => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const { initialState } = useModel('@@initialState');

  const loading = (
    <span className={actionClassName}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );
  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.devices) {
    return loading;
  }
  const ElNetwork = (props: any) => (
    <svg
      width="1.5em"
      height="1.5em"
      viewBox="0 0 1200 1200"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="currentColor"
        d="M1.422 630.365C-.4 620.378.049 611.896.049 601.507v-2.748c163.322-14.011 341.241-55.15 473.665-149.787c37.996 17.409 75.363 15.034 111.208-2.748c75.104 75.855 148.807 128.574 247.13 159.405c10.067 25.652 26.086 45.35 48.054 59.091c-26.543 65.961-63.612 124.136-111.209 174.521c-70.346-50.674-163.23-13.979-194.957 59.091c-220.012-2.384-441.761-98.642-572.518-267.967m571.143 354.54c-112.313 58.005-230.856 89.276-351.474 82.451C127.796 989.072 60.567 886.74 26.135 780.151c151.522 130.23 352.912 204.549 546.43 204.754m248.503-16.49c127.807-26.659 245.244-78.05 340.488-156.657c-125.012 325.938-501.479 474.94-810.035 336.676c100.162-14.432 194.251-49.025 274.588-94.817c80.286 46.004 175.832-2.388 194.959-85.202m236.146-335.302c49.196-3.631 97.167-7.251 142.786-15.116c-.089 12.283-1.357 24.374-1.373 35.729c-85.771 109.767-214.696 184.762-343.235 219.87c47.966-58.233 83.545-122.923 108.462-188.264c39.174-5.082 71.173-23.077 93.36-52.219m21.968-87.948c-5.416-40.734-25.791-73.796-57.664-94.819c10.072-93.269 11.733-184.275 4.119-272.089c96.156 99.264 154.383 225.964 170.244 351.792c-34.781 7.329-73.682 12.368-116.699 15.116M410.559 387.133C289.275 463.55 147.263 500.671 6.914 512.185C41.964 293.143 191.16 112.112 391.337 38.09c5.438 71.134 21.91 139.81 48.054 199.257c-41.973 42.622-51.941 97.264-28.832 149.786m236.145-101.69c63.215-78.489 115.77-158.695 145.532-252.851C843.492 50 889.715 72.444 930.903 99.928c14.386 113.183 16.386 225.917 5.491 331.18c-49.729 8.487-88.823 38.744-105.717 82.45c-73.416-26.576-133.514-76.068-186.72-129.174c13.364-34.477 13.869-66.794 2.747-98.941m-127.683-81.077c-25.545-63.148-42.218-124.34-42.562-191.012c76.599-17.623 159.296-17.036 232.027-2.748c-27.786 77.786-71.688 149.88-118.073 208.876c-16.321-6.971-56.075-22.499-71.392-15.116"
      />
    </svg>
  );

  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setOpen(nextOpen);
    }
  };

  const items: MenuProps['items'] =
    currentUser?.devices?.overview?.map(
      (e: { name?: string; status?: string }, index: number) => {
        return {
          key: `${index}`,
          label: (
            <Badge
              status={e.status === 'online' ? 'success' : 'error'}
              text={
                <Typography.Text
                  style={{ width: 200 }}
                  ellipsis={{ tooltip: e.name }}
                >
                  {e.name}
                </Typography.Text>
              }
            />
          ),
        };
      },
    ) || [];

  return (
    <>
      <HeaderDropdown
        menu={{
          items,
        }}
        onOpenChange={handleOpenChange}
        open={open}
      >
        <a onClick={(e) => e.preventDefault()}>
          <Badge
            count={currentUser.devices.offline}
            className="site-badge-count-109"
            offset={[0, 10]}
          >
            <Avatar
              src={<ElNetwork style={{ color: 'rgba(255, 255, 255, 0.65)' }} />}
            />
          </Badge>
        </a>
      </HeaderDropdown>
    </>
  );
};

import { OsLogo as OriginalOsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import { CarbonBatchJob } from '@/components/Icons/CustomIcons';
import { TerminalStateProps } from '@/components/PlaybookExecutionModal';
import Title, { TitleColors } from '@/components/Template/Title';
import { getDevices } from '@/services/rest/device';
import {
  AppstoreOutlined,
  ControlOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Avatar, Button, Card, List, Tooltip } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce } from 'lodash';
import React, {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { API, SsmStatus } from 'ssm-shared-lib';
import styles from './Devices.less';

const DeviceQuickActionDropDown = React.lazy(
  () =>
    import(
      '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionDropDown'
    ),
);
const TerminalModal = React.lazy(
  () => import('@/components/PlaybookExecutionModal'),
);
const ListContent = React.lazy(
  () => import('@/pages/Devices/components/ListComponent'),
);

const OsLogo = (logoFile: string | undefined): string => {
  return OriginalOsLogo(logoFile);
};

const initialTerminalState: TerminalStateProps = {
  isOpen: false,
  command: undefined,
  target: undefined,
  playbookName: undefined,
};

const shineAnimation = {
  initial: {
    backgroundPosition: '200% 0',
  },
  animate: {
    backgroundPosition: ['200% 0', '-200% 0', '200% 0'],
    transition: {
      duration: 4, // Total duration, including delay effect
      ease: 'linear',
      repeat: Infinity,
      times: [0, 0.5, 1], // [start, midpoint, end]
    },
  },
};

const DeviceListPage = memo(() => {
  const [deviceList, setDeviceList] = useState<API.DeviceList>({});
  const [loading, setLoading] = useState(false);
  const [terminal, setTerminal] =
    useState<TerminalStateProps>(initialTerminalState);

  const openOrCloseTerminalModal = useCallback((open: boolean) => {
    setTerminal((prevState) => ({ ...prevState, isOpen: open }));
  }, []);

  const debouncedFetchDeviceList = useMemo(
    () =>
      debounce(async () => {
        setLoading(true);
        try {
          const data = await getDevices();
          setDeviceList(data);
        } finally {
          setLoading(false);
        }
      }, 300),
    [],
  );

  useEffect(() => {
    debouncedFetchDeviceList();
  }, [debouncedFetchDeviceList]);

  const onDropDownClicked = useCallback((key: string) => {
    switch (
      key
      // TODO: Implement logic
    ) {
    }
  }, []);

  const renderListItem = useCallback(
    (item: API.DeviceItem, index: number) => {
      const delay = index * 0.1; // Adjust delay as needed for staggering effect
      return (
        <motion.div
          key={item.uuid}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, delay }}
          style={{ borderBlockEnd: '1px solid rgba(246, 217, 158, 0.12)' }}
        >
          <List.Item
            actions={[
              <Link
                to={{
                  pathname: `/manage/services`,
                  search: `deviceUuid=${item.uuid}`,
                }}
                key={`services-${item.uuid}`}
              >
                <Tooltip title="Services">
                  <AppstoreOutlined />
                </Tooltip>
              </Link>,
              <Link
                to={`/admin/inventory/${item.uuid}`}
                key={`devicesettings-${item.uuid}`}
              >
                <Tooltip title="Device Settings">
                  <ControlOutlined />
                </Tooltip>
              </Link>,
              <DeviceQuickActionDropDown
                key={`quickAction-${item.uuid}`}
                onDropDownClicked={onDropDownClicked}
                setTerminal={setTerminal}
                target={item}
              />,
            ]}
          >
            <List.Item.Meta
              avatar={
                item.status === SsmStatus.DeviceStatus.ONLINE ? (
                  <motion.div
                    style={{
                      display: 'inline-block',
                      background:
                        'linear-gradient(90deg, rgba(0,255,0,0) 0%, rgba(0,255,0,0.2) 50%, rgba(0,255,0,0) 100%)',
                      backgroundSize: '200% 200%',
                      borderRadius: '50%',
                    }}
                    initial="initial"
                    animate="animate"
                    variants={shineAnimation}
                  >
                    <Avatar src={OsLogo(item.osLogoFile)} size="large" />
                  </motion.div>
                ) : (
                  <Avatar src={OsLogo(item.osLogoFile)} size="large" />
                )
              }
              title={item.hostname}
              description={item.ip}
            />
            <ListContent
              uuid={item.uuid}
              createdAt={item.createdAt}
              status={item.status}
              cpuSpeed={item.cpuSpeed}
              mem={item.mem}
            />
          </List.Item>
        </motion.div>
      );
    },
    [onDropDownClicked],
  );

  const cardBodyStyle = useMemo(() => ({ padding: '0 32px 40px 32px' }), []);

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title="Devices"
            backgroundColor={TitleColors.DEVICES}
            icon={<TableOutlined />}
          />
        ),
      }}
    >
      <div className={styles.standardList}>
        <Card
          title="List of your devices"
          className={styles.listCard}
          bordered={false}
          style={{ marginTop: 0 }}
          bodyStyle={cardBodyStyle}
          extra={
            <DeviceQuickActionDropDown
              onDropDownClicked={onDropDownClicked}
              setTerminal={setTerminal}
            >
              <Button icon={<CarbonBatchJob />}>Apply to all</Button>
            </DeviceQuickActionDropDown>
          }
        >
          <AnimatePresence>
            <List
              size="large"
              rowKey="uuid"
              loading={loading}
              pagination={{ pageSize: 10, showQuickJumper: true }}
              dataSource={deviceList?.data}
              renderItem={renderListItem}
            />
          </AnimatePresence>
        </Card>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <TerminalModal
          terminalProps={{ ...terminal, setIsOpen: openOrCloseTerminalModal }}
        />
      </Suspense>
    </PageContainer>
  );
});

export default DeviceListPage;

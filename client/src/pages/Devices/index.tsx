import React, {
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Avatar, Button, Card, List, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  ControlOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { API } from 'ssm-shared-lib';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Devices.less';
import { OsLogo as OriginalOsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import Title, { TitleColors } from '@/components/Template/Title';
import { CarbonBatchJob } from '@/components/Icons/CustomIcons';
import { TerminalStateProps } from '@/components/PlaybookExecutionModal';
import { getDevices } from '@/services/rest/device';

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
              avatar={<Avatar src={OsLogo(item.osLogoFile)} size="large" />}
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

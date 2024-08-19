import DeviceQuickActionDropDown from '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionDropDown';
import { OsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import { CarbonBatchJob } from '@/components/Icons/CustomIcons';
import TerminalModal, {
  TerminalStateProps,
} from '@/components/PlaybookExecutionModal';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import ListContent from '@/pages/Devices/components/ListComponent';
import { getDevices } from '@/services/rest/device';
import {
  AppstoreOutlined,
  ControlOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Avatar, Button, Card, List, Tooltip } from 'antd';
import React, { memo, useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';
import styles from './Devices.less';

const Index = memo(() => {
  const [deviceList, setDeviceList] = React.useState<API.DeviceList>({});
  const [loading, setLoading] = React.useState(false);
  const [terminal, setTerminal] = useState<TerminalStateProps>({
    isOpen: false,
    command: undefined,
    target: undefined,
    playbookName: undefined,
  });

  const openOrCloseTerminalModal = (open: boolean) => {
    setTerminal({ ...terminal, isOpen: open });
  };

  const fetchDeviceList = async () => {
    setLoading(true);
    await getDevices()
      .then((data) => {
        setDeviceList(data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeviceList();
  }, []);

  const onDropDownClicked = (key: string) => {
    switch (
      key
      //TODO
    ) {
    }
  };

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Devices'}
            backgroundColor={PageContainerTitleColors.DEVICES}
            icon={<TableOutlined />}
          />
        ),
      }}
    >
      <div className={styles.standardList}>
        <Card
          title={'List of your devices'}
          className={styles.listCard}
          bordered={false}
          style={{ marginTop: 0 }}
          bodyStyle={{ padding: '0 32px 40px 32px' }}
          extra={
            <a href="#">
              <DeviceQuickActionDropDown
                onDropDownClicked={onDropDownClicked}
                setTerminal={setTerminal}
              >
                <Button icon={<CarbonBatchJob />}>Apply to all</Button>
              </DeviceQuickActionDropDown>
            </a>
          }
        >
          <List
            size="large"
            rowKey="uuid"
            loading={loading}
            pagination={{
              pageSize: 10,
              showQuickJumper: true,
            }}
            dataSource={deviceList?.data}
            renderItem={(item) => (
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
                  <a key={`quickAction-${item.uuid}`} onClick={() => {}}>
                    <DeviceQuickActionDropDown
                      onDropDownClicked={onDropDownClicked}
                      setTerminal={setTerminal}
                      target={item}
                    />
                  </a>,
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
            )}
          />
        </Card>
      </div>
      <TerminalModal
        terminalProps={{ ...terminal, setIsOpen: openOrCloseTerminalModal }}
      />
    </PageContainer>
  );
});

export default Index;

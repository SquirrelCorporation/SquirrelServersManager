import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import TinyLineDeviceGraph from '@/components/Charts/TinyLineDeviceGraph';
import TinyRingProgressDeviceGraph from '@/components/Charts/TinyRingProgressDeviceGraph';
import TinyRingProgressDeviceIndicator from '@/components/Charts/TinyRingProgressDeviceIndicator';
import DeviceStatusTag from '@/components/DeviceComponents/DeviceStatusTag';
import { OsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import { CarbonBatchJob, WhhCpu, WhhRam } from '@/components/Icons/CustomIcons';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import QuickActionDropDown from '@/components/QuickAction/QuickActionDropDown';
import TerminalModal from '@/components/TerminalModal';
import { getDevices } from '@/services/rest/device';
import { Link, useClientLoaderData } from '@@/exports';
import {
  AppstoreOutlined,
  ControlOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Carousel,
  Col,
  List,
  Row,
  Tooltip,
  Typography,
} from 'antd';
import React, { memo, useEffect, useState } from 'react';
import { TerminalContextProvider } from 'react-terminal';
import styles from './Devices.less';
import DeviceStatus from '@/utils/devicestatus';
import { API } from 'ssm-shared-lib';

const { Text } = Typography;

export type StateType = {
  visible?: boolean;
  done?: boolean;
  current?: API.DeviceItem;
};

// https://umijs.org/en-US/docs/guides/client-loader
export async function clientLoader() {
  return await getDevices();
}

const Index = memo(() => {
  const [deviceList, setDeviceList] = React.useState<API.DeviceList>({});
  const [loading, setLoading] = React.useState(false);
  const { data } = useClientLoaderData();
  const [terminal, setTerminal] = useState<{
    isOpen: boolean;
    command: string | undefined;
    target?: API.DeviceItem[];
  }>({
    isOpen: false,
    command: undefined,
    target: undefined,
  });
  const openOrCloseTerminalModal = (open: boolean) => {
    setTerminal({ ...terminal, isOpen: open });
  };

  useEffect(() => {
    setDeviceList(data);
  }, []);
  /*
  const showModal = () => {
    setState({
      visible: true,
      current: undefined,
    });
  };
*/

  const onDropDownClicked = (key: string) => {
    switch (
      key
      //TODO
    ) {
    }
  };

  const ListContent: React.FC<API.DeviceItem> = (props: API.DeviceItem) => (
    <div className={styles.listContent} key={props.uuid}>
      <div className={styles.listContentItem}>
        <span>
          <DeviceStatusTag status={props.status} />
        </span>
        <p>{props.hostname}</p>
      </div>
      <div className={styles.listContentItem} style={{ width: '80px' }}>
        {props.status !== DeviceStatus.UNMANAGED && (
          <>
            <p style={{ minWidth: '80px' }}>
              <WhhCpu /> {props.cpuSpeed?.toFixed(1)} Ghz
            </p>
            <p style={{ minWidth: '80px' }}>
              <WhhRam /> {props.mem ? (props.mem / 1024).toFixed(0) : 'NaN'} Gb
            </p>
          </>
        )}
      </div>
      <div className={styles.listContentItem}>
        {(props.status !== DeviceStatus.UNMANAGED && (
          <Carousel
            style={{ width: 300, height: 70, zIndex: 1000 }}
            dotPosition={'right'}
          >
            <div style={{ width: 300, height: 70, zIndex: 1000 }}>
              <div
                style={{
                  width: 300,
                  height: 70,
                  zIndex: 1000,
                  paddingTop: '15px',
                }}
              >
                <Row style={{ alignItems: 'center' }} justify="center">
                  <Col span={6}>
                    <TinyRingProgressDeviceGraph
                      type={DeviceStatType.CPU}
                      deviceUuid={props.uuid}
                    />
                  </Col>
                  <Col span={6}>
                    <TinyRingProgressDeviceGraph
                      type={DeviceStatType.MEM_USED}
                      deviceUuid={props.uuid}
                    />
                  </Col>
                  <Col span={6}>
                    <TinyRingProgressDeviceIndicator deviceUuid={props.uuid} />
                  </Col>
                </Row>
              </div>
            </div>
            <div style={{ width: 300, height: 70, zIndex: 1000 }}>
              <div style={{ width: 300, height: 70, zIndex: 1000 }}>
                <Row style={{ alignItems: 'center' }} justify="center">
                  <Col span={24}>
                    <TinyLineDeviceGraph
                      type={DeviceStatType.CPU}
                      deviceUuid={props.uuid}
                      from={24}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col
                    span={24}
                    style={{ marginTop: '-5px', textAlign: 'center' }}
                  >
                    <Text type="secondary" style={{ fontSize: '8px' }}>
                      CPU
                    </Text>
                  </Col>
                </Row>
              </div>
            </div>
            <div style={{ width: 300, height: 70, zIndex: 1000 }}>
              <div style={{ width: 300, height: 70, zIndex: 1000 }}>
                <Row style={{ alignItems: 'center' }} justify="center">
                  <Col span={24}>
                    <TinyLineDeviceGraph
                      type={DeviceStatType.MEM_USED}
                      deviceUuid={props.uuid}
                      from={24}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col
                    span={24}
                    style={{ marginTop: '-5px', textAlign: 'center' }}
                  >
                    <Text type="secondary" style={{ fontSize: '8px' }}>
                      MEM USED
                    </Text>
                  </Col>
                </Row>{' '}
              </div>
            </div>
          </Carousel>
        )) || <div style={{ width: 300, height: 70, zIndex: 1000 }} />}
      </div>
    </div>
  );

  return (
    <TerminalContextProvider>
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
                <QuickActionDropDown
                  onDropDownClicked={onDropDownClicked}
                  setTerminal={setTerminal}
                >
                  <Button icon={<CarbonBatchJob />}>Apply to all</Button>
                </QuickActionDropDown>
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
                    <a
                      key={`showEditModal-${item.uuid}`}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Tooltip title="Services">
                        <AppstoreOutlined />
                      </Tooltip>
                    </a>,
                    <Link
                      to={`/admin/inventory/${item.uuid}`}
                      key={`devicesettings-${item.uuid}`}
                    >
                      <Tooltip title="Device Settings">
                        <ControlOutlined />
                      </Tooltip>
                    </Link>,
                    <a key={`quickAction-${item.uuid}`} onClick={() => {}}>
                      <QuickActionDropDown
                        onDropDownClicked={onDropDownClicked}
                        setTerminal={setTerminal}
                        target={[item]}
                      />
                    </a>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar src={OsLogo(item.osLogoFile)} size="large" />
                    }
                    title={<a href={item.hostname}>{item.hostname}</a>}
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
    </TerminalContextProvider>
  );
});

export default Index;

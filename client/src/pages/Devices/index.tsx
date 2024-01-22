import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import TinyLineDeviceGraph from '@/components/Charts/TinyLineDeviceGraph';
import TinyRingProgressDeviceIndicator from '@/components/Charts/TinyRingProgressDeviceIndicator';
import DeviceStatusTag from '@/components/DeviceStatus/DeviceStatusTag';
import PlaybookSelectionModal from '@/components/PlaybookSelectionModal/PlaybookSelectionModal';
import QuickActionDropDown from '@/components/QuickAction/QuickActionDropDown';
import { OsLogo } from '@/components/misc/OsLogo';
import TerminalModal from '@/components/TerminalModal';
import { getDevices } from '@/services/rest/device';
import { AppstoreOutlined, CaretLeftOutlined, CaretRightOutlined, ControlOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Avatar, Card, List, Tooltip, message, Col, Row, Carousel, Typography } from 'antd';
import moment from 'moment';
import React, { memo, useEffect, useState } from 'react';
import { TerminalContextProvider } from 'react-terminal';
import styles from './Devices.less';
import TinyRingProgressDeviceGraph from '@/components/Charts/TinyRingProgressDeviceGraph';

const { Text, Link } = Typography;

export type StateType = {
  visible?: boolean;
  done?: boolean;
  current?: API.DeviceItem;
};

const Index = memo(() => {
  const stateT: StateType = { visible: false, done: false };
  const [state, setState] = React.useState(stateT);
  const [deviceList, setDeviceList] = React.useState<API.DeviceList>({});
  const [currentRow, setCurrentRow] = useState<API.DeviceItem>();
  const [showPlaybookModal, setShowPlaybookModal] = React.useState(false);
  const [terminal, setTerminal] = useState<{isOpen: boolean; command: string | undefined}>({ isOpen: false, command: undefined});

  const asyncFetch = async () => {
    await getDevices()
      .then((list) => {
        setDeviceList(list);
      })
      .catch((error) => {
        message.error(error);
      });
  };
  useEffect(() => {
    asyncFetch();
  }, []);

  const showModal = () => {
    setState({
      visible: true,
      current: undefined
    });
  };

  const showEditModal = (item: API.DeviceItem) => {
    setState({
      visible: true,
      current: item
    });
  };

  const onDropDownClicked = (key: string) => {
    switch (key) {
      case '-1':
        setShowPlaybookModal(true);
        return;
      case '3':
        openOrCloseTerminalModal(true);
        return;
    }
  };

  const openOrCloseTerminalModal = (open: boolean) => {
    setTerminal({...terminal, isOpen: open});
  }

  const ListContent: React.FC<API.DeviceItem> = (props: API.DeviceItem) => (
    <div className={styles.listContent} key={props.uuid}>
      <div className={styles.listContentItem}>
        <span>
          <DeviceStatusTag status={props.status} />
        </span>
        <p>{props.hostname}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>Updated At</span>
        <p>{moment(props.updatedAt).format('YYYY-MM-DD, HH:mm')}</p>
      </div>
      <div className={styles.listContentItem}>
        <Carousel style={{ width: 300, height: 70, zIndex: 1000 }} dotPosition={'right'}>
          <div style={{ width: 300, height: 70, zIndex: 1000 }}>
            <div style={{ width: 300, height: 70, zIndex: 1000, paddingTop: '15px' }}>
              <Row type="flex"
                   style={{ alignItems: 'center' }}
                   justify="center">
                <Col span={6}>
                  <TinyRingProgressDeviceGraph type={DeviceStatType.CPU} deviceUuid={props.uuid}
                                               from={24} />
                </Col>
                <Col span={6}><TinyRingProgressDeviceGraph type={DeviceStatType.MEM_USED} deviceUuid={props.uuid}
                                                           from={24} />
                </Col>
                <Col span={6}><TinyRingProgressDeviceIndicator type={DeviceStatType.CPU} deviceUuid={props.uuid}
                                                           from={24} />
                </Col>
              </Row>
            </div>
          </div>
          <div style={{ width: 300, height: 70, zIndex: 1000 }}>
            <div style={{ width: 300, height: 70, zIndex: 1000 }}>
              <Row type="flex"
                   style={{ alignItems: 'center' }}
                   justify="center">
                <Col span={24}>
                  <TinyLineDeviceGraph type={DeviceStatType.CPU} deviceUuid={props.uuid} from={24} />
                </Col>
              </Row>
              <Row>
                <Col span={24} style={{ marginTop: '-5px', textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: '8px' }}>CPU</Text>
                </Col>
              </Row>
            </div>
          </div>
          <div style={{ width: 300, height: 70, zIndex: 1000 }}>
            <div style={{ width: 300, height: 70, zIndex: 1000 }}>
              <Row type="flex"
                   style={{ alignItems: 'center' }}
                   justify="center">
                <Col span={24}>
                  <TinyLineDeviceGraph type={DeviceStatType.MEM_USED} deviceUuid={props.uuid} from={24} />
                </Col>
              </Row>
              <Row>
                <Col span={24} style={{ marginTop: '-5px', textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: '8px' }}>MEM USED</Text>
                </Col>
              </Row>   </div>
          </div>

        </Carousel>
      </div>
    </div>
  );

  return (
    <TerminalContextProvider>
      <PageContainer>
        <PlaybookSelectionModal
          isModalOpen={showPlaybookModal}
          setIsModalOpen={setShowPlaybookModal}
          itemSelected={currentRow}
        />
        <div className={styles.standardList}>
          <Card
            title={'List of your devices'}
            className={styles.listCard}
            bordered={false}
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
          >
            <List
              size="large"
              rowKey="uuid"
              loading={false}
              pagination={{
                pageSize: 10,
                showQuickJumper: true
              }}
              dataSource={deviceList?.data}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a
                      key={`showEditModal-${item.uuid}`}
                      onClick={(e) => {
                        e.preventDefault();
                        showEditModal(item);
                      }}
                    >
                      <Tooltip title="Services">
                        <AppstoreOutlined />
                      </Tooltip>
                    </a>,
                    <a
                      key={`devicesettings-${item.uuid}`}
                      onClick={(e) => {
                        e.preventDefault();
                        showEditModal(item);
                      }}
                    >
                      <Tooltip title="Device Settings">
                        <ControlOutlined />
                      </Tooltip>
                    </a>,
                    <a
                      key={`quickAction-${item.uuid}`}
                      onClick={() => {
                        setCurrentRow(item);
                      }}
                    >
                      <QuickActionDropDown onDropDownClicked={onDropDownClicked} setTerminal={setTerminal} />
                    </a>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={OsLogo(item.osLogoFile)} size="large" />}
                    title={<a href={item.hostname}>{item.hostname}</a>}
                    description={item.ip}
                  />
                  <ListContent uuid={item.uuid} createdAt={item.createdAt} status={item.status} />
                </List.Item>
              )}
            />
          </Card>
        </div>
        <TerminalModal terminalProps={{...terminal, setIsOpen: openOrCloseTerminalModal}} />
      </PageContainer>
    </TerminalContextProvider>
  );
});

export default Index;

import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import TinyLine from '@/components/Charts/TinyLine';
import DeviceStatusTag from '@/components/DeviceStatus/DeviceStatusTag';
import PlaybookSelectionModal from '@/components/PlaybookSelectionModal/PlaybookSelectionModal';
import QuickActionDropDown from '@/components/QuickAction/QuickActionDropDown';
import { OsLogo } from '@/components/misc/OsLogo';
import { getDevices } from '@/services/ant-design-pro/device';
import { AppstoreOutlined, ControlOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Avatar, Card, List, Tooltip, message } from 'antd';
import moment from 'moment';
import React, { memo, useEffect, useState } from 'react';
import styles from './Devices.less';

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
      current: undefined,
    });
  };

  const showEditModal = (item: API.DeviceItem) => {
    setState({
      visible: true,
      current: item,
    });
  };

  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 5,
    total: 50,
  };
  const onDropDownClicked = (key: string) => {
    switch (key) {
      case '-1':
        setShowPlaybookModal(true);
        return;
    }
  };
  const ListContent: React.FC<API.DeviceItem> = (props: API.DeviceItem) => (
    <div className={styles.listContent}>
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
        <TinyLine type={DeviceStatType.CPU} deviceUuid={props.uuid} from={24} />
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PlaybookSelectionModal
        isModalOpen={showPlaybookModal}
        setIsModalOpen={setShowPlaybookModal}
        itemSelected={currentRow}
      />
      <div className={styles.standardList}>
        <Card
          className={styles.listCard}
          bordered={false}
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '0 32px 40px 32px' }}
        >
          <List
            size="large"
            rowKey="uuid"
            loading={false}
            pagination={paginationProps}
            dataSource={deviceList?.data}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a
                    key={item.uuid}
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
                    key={item.uuid}
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
                    key="quickAction"
                    onClick={() => {
                      setCurrentRow(item);
                    }}
                  >
                    <QuickActionDropDown onDropDownClicked={onDropDownClicked} />
                  </a>,
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
    </PageContainer>
  );
});

export default Index;

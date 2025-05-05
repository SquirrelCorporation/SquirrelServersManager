import { OsLogo as OriginalOsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import { CarbonBatchJob } from '@/components/Icons/CustomIcons';
import { TerminalStateProps } from '@/components/PlaybookExecutionModal';
import Title, { TitleColors } from '@/components/Template/Title';
import { getDevices } from '@/services/rest/devices/devices';
import { executePlaybook } from '@/services/rest/playbooks/playbooks';
import {
  AppstoreOutlined,
  ControlOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { PageContainer, ProList } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Avatar, Button, Card, List, Tooltip } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import React, { memo, Suspense, useCallback, useMemo, useState } from 'react';
import { API, SsmStatus } from 'ssm-shared-lib';
import styles from './Devices.less';
import {
  playbookExecutionEvents,
  PLAYBOOK_EXECUTION_START,
} from '@/components/HeaderComponents/PlaybookExecutionWidget';

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

const executePlaybookWithTarget = async (
  playbook: string,
  displayName: string,
  target: API.DeviceItem[],
) => {
  try {
    const res = await executePlaybook(
      playbook,
      target.map((e) => e.uuid),
    );
    playbookExecutionEvents.emit(PLAYBOOK_EXECUTION_START, {
      execId: res.data.execId,
      displayName,
    });
  } catch (error) {
    // Handle error (e.g., show notification)
  }
};

const DeviceListPage = memo(() => {
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
                  pathname: `/manage/containers`,
                  search: `deviceUuid=${item.uuid}`,
                }}
                key={`containers-${item.uuid}`}
              >
                <Tooltip title="See containers">
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
                    <Avatar
                      src={OsLogo(
                        item.systemInformation?.system?.raspberry?.type
                          ? 'raspbian'
                          : item.systemInformation?.os?.logofile,
                      )}
                      size="large"
                      className={styles['elevated-avatar']}
                    />
                  </motion.div>
                ) : (
                  <Avatar
                    src={OsLogo(
                      item.systemInformation?.system?.raspberry?.type
                        ? 'raspbian'
                        : item.systemInformation?.os?.logofile,
                    )}
                    size="large"
                    className={styles['elevated-avatar']}
                  />
                )
              }
              title={item.hostname}
              description={item.ip}
            />
            <ListContent
              uuid={item.uuid}
              createdAt={item.createdAt}
              status={item.status}
              systemInformation={item.systemInformation}
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
        >
          <AnimatePresence>
            <ProList
              rowKey="uuid"
              pagination={{
                pageSize: 10,
                showQuickJumper: true,
                responsive: true,
              }}
              request={getDevices}
              debounceTime={300}
              renderItem={renderListItem}
            />
          </AnimatePresence>
        </Card>
      </div>
    </PageContainer>
  );
});

export default DeviceListPage;

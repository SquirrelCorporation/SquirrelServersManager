import TinyLineDeviceGraph from '@/components/Charts/TinyLineDeviceGraph';
import TinyRingProgressDeviceGraph from '@/components/Charts/TinyRingProgressDeviceGraph';
import TinyRingProgressDeviceIndicator from '@/components/Charts/TinyRingProgressDeviceIndicator';
import DeviceStatusTag from '@/components/DeviceComponents/DeviceStatusTag';
import { WhhCpu, WhhRam } from '@/components/Icons/CustomIcons';
import styles from '@/pages/Devices/Devices.less';
import DeviceStatus from '@/utils/devicestatus';
import { Carousel, Col, Row, Typography } from 'antd';
import React, { useMemo } from 'react';
import { API, StatsType } from 'ssm-shared-lib';

const { Text } = Typography;

const ListContent: React.FC<Partial<API.DeviceItem>> = React.memo((device) => {
  const cpuSpeed = useMemo(
    () => device.systemInformation?.cpu?.speed?.toFixed(1),
    [device.systemInformation?.cpu?.speed],
  );
  const memSize = useMemo(
    () =>
      device.systemInformation?.mem?.total
        ? Math.ceil(device.systemInformation?.mem?.total / (1024 * 1024 * 1024))
        : 'NaN',
    [device.systemInformation?.mem?.total],
  );

  const carouselContent = useMemo(() => {
    if (device.status !== DeviceStatus.UNMANAGED) {
      return (
        <div className={styles.listItemCarousel}>
          <Carousel
            style={{ width: 300, height: 70, zIndex: 1000 }}
            dotPosition="right"
            lazyLoad="ondemand"
            speed={300}
            slidesToShow={1}
            slidesToScroll={1}
            infinite={false}
            adaptiveHeight={true}
          >
            <div style={{ width: 300, height: 70, zIndex: 1000 }} key="1">
              <div
                style={{
                  width: 300,
                  height: 70,
                  zIndex: 1000,
                  paddingTop: '15px',
                }}
              >
                <Row style={{ alignItems: 'center' }} justify="center">
                  <Col
                    span={6}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TinyRingProgressDeviceGraph
                      type={StatsType.DeviceStatsType.CPU}
                      deviceUuid={device.uuid as string}
                    />
                  </Col>
                  <Col
                    span={6}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TinyRingProgressDeviceGraph
                      type={StatsType.DeviceStatsType.MEM_USED}
                      deviceUuid={device.uuid as string}
                    />
                  </Col>
                  <Col
                    span={6}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TinyRingProgressDeviceIndicator
                      type={StatsType.DeviceStatsType.CONTAINERS}
                      deviceUuid={device.uuid as string}
                    />
                  </Col>
                </Row>
              </div>
            </div>
            <div style={{ width: 300, height: 70, zIndex: 1000 }} key="2">
              <div style={{ width: 300, height: 70, zIndex: 1000 }}>
                <Row style={{ alignItems: 'center' }} justify="center">
                  <Col span={24}>
                    <TinyLineDeviceGraph
                      type={StatsType.DeviceStatsType.CPU}
                      deviceUuid={device.uuid as string}
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
            <div style={{ width: 300, height: 70, zIndex: 1000 }} key="3">
              <div style={{ width: 300, height: 70, zIndex: 1000 }}>
                <Row style={{ alignItems: 'center' }} justify="center">
                  <Col span={24}>
                    <TinyLineDeviceGraph
                      type={StatsType.DeviceStatsType.MEM_USED}
                      deviceUuid={device.uuid as string}
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
                </Row>
              </div>
            </div>
          </Carousel>
        </div>
      );
    }
    return (
      <div className={styles.listItemCarousel}>
        <div style={{ width: 300, height: 70, zIndex: 1000 }} />
      </div>
    );
  }, [device.status, device.uuid]);

  return (
    <div className={styles.listContent} key={device.uuid}>
      <div className={styles.listContentItem}>
        <span>
          <DeviceStatusTag status={device.status as number} />
        </span>
        <p>{device.hostname}</p>
      </div>
      {(device.status !== DeviceStatus.UNMANAGED && (
        <div className={styles.listContentItem} style={{ width: '80px' }}>
          <p style={{ minWidth: '80px' }}>
            <WhhCpu /> {cpuSpeed} GHz
          </p>
          <p style={{ minWidth: '80px' }}>
            <WhhRam /> {memSize} Gb
          </p>
        </div>
      )) || (
        <div className={styles.listContentItem} style={{ width: '80px' }} />
      )}
      <div className={styles.listContentItem}>{carouselContent}</div>
    </div>
  );
});

export default ListContent;

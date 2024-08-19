import React, { useMemo } from 'react';
import { Carousel, Col, Row, Typography } from 'antd';
import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import TinyLineDeviceGraph from '@/components/Charts/TinyLineDeviceGraph';
import TinyRingProgressDeviceGraph from '@/components/Charts/TinyRingProgressDeviceGraph';
import TinyRingProgressDeviceIndicator from '@/components/Charts/TinyRingProgressDeviceIndicator';
import DeviceStatusTag from '@/components/DeviceComponents/DeviceStatusTag';
import { WhhCpu, WhhRam } from '@/components/Icons/CustomIcons';
import DeviceStatus from '@/utils/devicestatus';
import { API } from 'ssm-shared-lib';
import styles from '@/pages/Devices/Devices.less';

const { Text } = Typography;

const ListContent: React.FC<API.DeviceItem> = React.memo((props) => {
  const cpuSpeed = useMemo(() => props.cpuSpeed?.toFixed(1), [props.cpuSpeed]);
  const memSize = useMemo(
    () => (props.mem ? (props.mem / 1024).toFixed(0) : 'NaN'),
    [props.mem],
  );

  const carouselContent = useMemo(() => {
    if (props.status !== DeviceStatus.UNMANAGED) {
      return (
        <div className={styles.listItemCarousel}>
          <Carousel
            style={{ width: 300, height: 70, zIndex: 1000 }}
            dotPosition="right"
            lazyLoad="progressive"
            speed={300}
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
                    <TinyRingProgressDeviceIndicator
                      type={DeviceStatType.SERVICES}
                      deviceUuid={props.uuid}
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
            <div style={{ width: 300, height: 70, zIndex: 1000 }} key="3">
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
                </Row>
              </div>
            </div>
          </Carousel>
        </div>
      );
    }
    return <div style={{ width: 300, height: 70, zIndex: 1000 }} />;
  }, [props.status, props.uuid]);

  return (
    <div className={styles.listContent} key={props.uuid}>
      <div className={styles.listContentItem}>
        <span>
          <DeviceStatusTag status={props.status} />
        </span>
        <p>{props.hostname}</p>
      </div>
      {props.status !== DeviceStatus.UNMANAGED && (
        <div className={styles.listContentItem} style={{ width: '80px' }}>
          <p style={{ minWidth: '80px' }}>
            <WhhCpu /> {cpuSpeed} Ghz
          </p>
          <p style={{ minWidth: '80px' }}>
            <WhhRam /> {memSize} Gb
          </p>
        </div>
      )}
      <div className={styles.listContentItem}>{carouselContent}</div>
    </div>
  );
});

export default ListContent;

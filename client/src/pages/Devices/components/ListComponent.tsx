import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import TinyLineDeviceGraph from '@/components/Charts/TinyLineDeviceGraph';
import TinyRingProgressDeviceGraph from '@/components/Charts/TinyRingProgressDeviceGraph';
import TinyRingProgressDeviceIndicator from '@/components/Charts/TinyRingProgressDeviceIndicator';
import DeviceStatusTag from '@/components/DeviceComponents/DeviceStatusTag';
import { WhhCpu, WhhRam } from '@/components/Icons/CustomIcons';
import styles from '@/pages/Devices/Devices.less';
import DeviceStatus from '@/utils/devicestatus';
import { Carousel, Col, Row, Typography } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const { Text } = Typography;

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
          lazyLoad={'progressive'}
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
                  <TinyRingProgressDeviceIndicator
                    deviceUuid={props.uuid}
                    type={DeviceStatType.SERVICES}
                  />
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

export default ListContent;

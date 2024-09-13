import {
  Bridge,
  ElNetwork,
  Labels,
  NetworkOverlay,
  OuiMlCreateAdvancedJob,
  Target,
  Vlan,
} from '@/components/Icons/CustomIcons';
import DockerOpsModal from '@/pages/Containers/components/sub-components/DockerOpsModal';
import { getDevices } from '@/services/rest/device';
import { postNetwork } from '@/services/rest/services';
import { cidrContains, isCidr, isIp, isNetworkBaseAddress } from '@/utils/ip';
import {
  CheckCircleFilled,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  CheckCard,
  ModalForm,
  ProForm,
  ProFormDependency,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  RequestOptionsType,
} from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
} from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

export const validateSubnet = () => (rule: any, value: string) => {
  return new Promise<void>((resolve, reject) => {
    if (!value) {
      return resolve();
    }
    // Ensure IP/CIDR value is valid
    if (!isCidr(value)) {
      return reject('CIDR format invalid');
    }
    if (!isNetworkBaseAddress(value)) {
      return reject(
        'CIDR ${value} is incorrectly formed. It should start with the base like 192.168.0.0/24',
      );
    }
    return resolve();
  });
};

export const validateIpRangeInSubnet =
  (getFieldValue: (name: string) => any) => (rule: any, value: string) => {
    return new Promise<void>((resolve, reject) => {
      const subnet = getFieldValue('v4_subnet');
      if (!value) {
        return resolve();
      }
      // Ensure IP/CIDR value is valid
      if (!isCidr(value)) {
        return reject('CIDR format invalid');
      }

      if (!isNetworkBaseAddress(value)) {
        return reject(
          `CIDR ${value} is incorrectly formed. It should start with the base like 192.168.0.0/24`,
        );
      }

      // Validate CIDR containment for a single IP or base IP of CIDR
      const valueBaseIp = value.split('/')[0];
      if (!cidrContains(subnet, valueBaseIp)) {
        return reject('CIDR not within the subnet');
      }

      // Additional check if value is CIDR: prefix lengths comparison
      if (isCidr(value)) {
        const valuePrefixLength = parseInt(value.split('/')[1], 10);
        const subnetPrefixLength = parseInt(subnet.split('/')[1], 10);
        if (valuePrefixLength < subnetPrefixLength) {
          return reject('IP range is less than the subnet prefix');
        }
      }

      return resolve();
    });
  };

export const validateIpInSubnet =
  (getFieldValue: (name: string) => any) => (rule: any, value: string) => {
    return new Promise<void>((resolve, reject) => {
      const subnet = getFieldValue('v4_subnet');
      if (!value) {
        return resolve();
      }

      // Ensure IP/CIDR value is valid
      if (!isIp(value)) {
        return reject('Invalid IP format');
      }

      if (!cidrContains(subnet, value)) {
        return reject('IP not within the subnet');
      }

      return resolve();
    });
  };

const CreateNetworkModal = () => {
  const [form] = ProForm.useForm();
  const [createNetworkModalOpened, setCreateNetworkModalOpened] =
    React.useState(false);
  const [data, setData] = React.useState<API.CreateNetwork | undefined>();
  return (
    <>
      <DockerOpsModal
        data={data as API.CreateNetwork}
        setIsOpen={setCreateNetworkModalOpened}
        isOpen={createNetworkModalOpened}
        call={postNetwork}
        displayName={'createDockerNetwork'}
      />
      <ModalForm
        form={form}
        title={
          <>
            <ElNetwork /> Create a Network
          </>
        }
        autoFocusFirstInput
        trigger={
          <Button type="primary">
            <PlusOutlined />
            Create a network
          </Button>
        }
        onFinish={async (values) => {
          const { target, ...config } = values;
          setData({ config, target });
          setCreateNetworkModalOpened(true);
          return true;
        }}
      >
        <Card type={'inner'}>
          <ProFormText
            label={'Name'}
            name={'name'}
            rules={[{ required: true }]}
          />
        </Card>
        <Divider dashed plain>
          Configuration
        </Divider>
        <Card type={'inner'} style={{ marginTop: 5 }}>
          <ProForm.Item
            name="network"
            label="Driver Configuration"
            style={{ width: '100%' }}
            initialValue={'bridge'}
          >
            <CheckCard.Group style={{ width: '100%' }} defaultValue={'bridge'}>
              <Row>
                <Col span={8}>
                  <CheckCard
                    defaultChecked
                    size={'small'}
                    title="Bridge"
                    avatar={<Avatar src={<Bridge />} size="small" />}
                    value="bridge"
                  />
                </Col>
                <Col span={8}>
                  <CheckCard
                    size={'small'}
                    title="IP-VLAN"
                    avatar={<Avatar src={<Vlan />} size="small" />}
                    value="ipvlan"
                  />
                </Col>
                <Col span={8}>
                  <CheckCard
                    size={'small'}
                    title="Overlay"
                    avatar={<Avatar src={<NetworkOverlay />} size="small" />}
                    value="overlay"
                  />
                </Col>
              </Row>
            </CheckCard.Group>
          </ProForm.Item>
          <ProForm.Group
            title={
              <>
                <Avatar
                  size={'small'}
                  src={<ElNetwork />}
                  style={{ marginRight: 8 }}
                />
                IPV4 Network configuration
              </>
            }
            direction={'horizontal'}
            collapsible
            defaultCollapsed={false}
            titleStyle={{ marginBottom: 8, padding: 0 }}
          >
            <ProFormText
              label={'Subnet'}
              name={'v4_subnet'}
              placeholder={'e.g. 172.20.0.0/16'}
              rules={[
                { required: true, message: 'Please input the subnet' },
                {
                  validator: validateSubnet(),
                },
              ]}
            />
            <ProFormText
              label={'Gateway'}
              name={'v4_gateway'}
              placeholder={'e.g. 172.20.0.11'}
              rules={[
                { required: true, message: 'Please input the gateway' },
                {
                  validator: validateIpInSubnet(form.getFieldValue),
                },
              ]}
            />
            <ProFormText
              label={'IP range'}
              name={'v4_range'}
              placeholder={'e.g. 172.20.10.128/25'}
              rules={[
                { required: true, message: 'Please input the IP range' },
                {
                  validator: validateIpRangeInSubnet(form.getFieldValue),
                },
              ]}
            />
            <ProForm.Group titleStyle={{ marginBottom: 8, padding: 0 }}>
              <ProForm.Item shouldUpdate>
                <Form.List name="v4_excludedIps">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 0,
                            width: '100%',
                          }}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            style={{ flex: 1, marginRight: 8 }}
                            rules={[
                              {
                                required: true,
                                message: 'Please input a name',
                              },
                            ]}
                          >
                            <Input
                              addonBefore="Name"
                              placeholder="Name e.g. host1"
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            style={{ flex: 1, marginRight: 8 }}
                            rules={[
                              {
                                required: true,
                                message: 'Please input an IP',
                              },
                              {
                                validator: validateIpInSubnet(
                                  form.getFieldValue,
                                ),
                              },
                            ]}
                          >
                            <Input
                              addonBefore="IP"
                              placeholder="IP e.g. 172.20.0.12"
                            />
                          </Form.Item>
                          <Form.Item style={{ flexBasis: 'auto' }}>
                            <Button
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                            />
                          </Form.Item>
                        </div>
                      ))}
                      <Form.Item style={{ width: '100%' }}>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                          style={{ width: '100%' }}
                        >
                          Add Excluded IP
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </ProForm.Item>
            </ProForm.Group>
          </ProForm.Group>
          <ProFormDependency name={['network']}>
            {({ network }) => {
              if (network === 'bridge') {
                return (
                  <ProForm.Group
                    title={
                      <>
                        <Avatar
                          size={'small'}
                          src={<ElNetwork />}
                          style={{ marginRight: 8 }}
                        />
                        IPV6 Network configuration
                      </>
                    }
                    direction={'horizontal'}
                    collapsible
                    defaultCollapsed={true}
                    titleStyle={{ marginBottom: 8, padding: 0 }}
                  >
                    <ProFormText
                      label={'Subnet'}
                      name={'v6-subnet'}
                      placeholder={'e.g. 2001:db8::/48'}
                    />
                    <ProFormText
                      label={'Gateway'}
                      name={'v6-gateway'}
                      placeholder={'e.g. 2001:db8::1'}
                    />
                    <ProFormText
                      label={'IP range'}
                      name={'v6-range'}
                      placeholder={'e.g. 2001:db8::/64'}
                    />
                    <ProForm.Group>
                      <ProForm.Item shouldUpdate>
                        <Form.List name="v6_excludedIps">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <div
                                  key={key}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: 0,
                                    width: '100%',
                                  }}
                                >
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'name']}
                                    style={{ flex: 1, marginRight: 8 }}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please input a name',
                                      },
                                    ]}
                                  >
                                    <Input
                                      addonBefore="Name"
                                      placeholder="Name e.g. host1"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'value']}
                                    style={{ flex: 1, marginRight: 8 }}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please input an IP',
                                      },
                                    ]}
                                  >
                                    <Input
                                      addonBefore="IP"
                                      placeholder="IP e.g. 172.20.0.12"
                                    />
                                  </Form.Item>
                                  <Form.Item style={{ flexBasis: 'auto' }}>
                                    <Button
                                      icon={<MinusCircleOutlined />}
                                      onClick={() => remove(name)}
                                    />
                                  </Form.Item>
                                </div>
                              ))}
                              <Form.Item style={{ width: '100%' }}>
                                <Button
                                  type="dashed"
                                  onClick={() => add()}
                                  block
                                  icon={<PlusOutlined />}
                                  style={{ width: '100%' }}
                                >
                                  Add Excluded IP
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </ProForm.Item>
                    </ProForm.Group>
                  </ProForm.Group>
                );
              }
            }}
          </ProFormDependency>
          <ProForm.Group
            title={
              <>
                <Avatar
                  src={<Labels />}
                  size={'small'}
                  style={{ marginRight: 8 }}
                />
                Labels
              </>
            }
            collapsible
            defaultCollapsed
            grid
            titleStyle={{ marginBottom: 8, padding: 0 }}
          >
            <ProForm.Item shouldUpdate>
              <Form.List name="labels">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: 0,
                          width: '100%',
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          style={{ flex: 1, marginRight: 8 }}
                          rules={[
                            {
                              required: true,
                              message: 'Please input a label name',
                            },
                          ]}
                        >
                          <Input
                            addonBefore="Name"
                            placeholder="Name e.g. com.example.foo"
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          style={{ flex: 1, marginRight: 8 }}
                          rules={[
                            {
                              required: true,
                              message: 'Please input a label value',
                            },
                          ]}
                        >
                          <Input
                            addonBefore="Value"
                            placeholder="Value e.g. bar"
                          />
                        </Form.Item>
                        <Form.Item style={{ flexBasis: 'auto' }}>
                          <Button
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Form.Item>
                      </div>
                    ))}
                    <Form.Item style={{ width: '100%' }}>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        style={{ width: '100%' }}
                      >
                        Add label
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </ProForm.Item>
          </ProForm.Group>
          <ProForm.Group
            title={
              <>
                <Avatar
                  src={<OuiMlCreateAdvancedJob />}
                  size={'small'}
                  style={{ marginRight: 8 }}
                />
                Advanced
              </>
            }
            collapsible
            defaultCollapsed
            grid
            titleStyle={{ marginBottom: 8, padding: 0 }}
            rowProps={{
              gutter: { xs: 8, sm: 16, md: 24, lg: 32 },
              justify: 'space-around',
            }}
          >
            <ProFormSwitch
              name={'attachable'}
              label={'Attachable'}
              tooltip={'Enable manual container attachment'}
              fieldProps={{
                checkedChildren: 'Attachable',
                unCheckedChildren: 'Attachable',
              }}
            />
            <ProFormSwitch
              name={'isolated'}
              label={'Isolated'}
              tooltip={
                "Containers within an isolated network cannot communicate with external networks, including the host's network. Only containers on the same isolated network can communicate with each other."
              }
              fieldProps={{
                checkedChildren: 'Isolated',
                unCheckedChildren: 'Isolated',
              }}
            />
          </ProForm.Group>
        </Card>
        <Divider dashed plain>
          Target
        </Divider>
        <ProFormSelect
          name={'target'}
          style={{ marginTop: 10 }}
          mode={'single'}
          fieldProps={{
            menuItemSelectedIcon: <CheckCircleFilled />,
            labelRender: (_) => (
              <Space>
                <span role="img" aria-label={_.label as string}>
                  <Target />
                </span>
                {_.label}
              </Space>
            ),
          }}
          placeholder={'Please select a target'}
          request={async () => {
            return getDevices().then((e) => {
              return e?.data?.map((device: API.DeviceItem) => ({
                label: `${device.fqdn} (${device.ip})`,
                value: device.uuid,
              })) as RequestOptionsType[];
            });
          }}
          rules={[{ required: true }]}
        />
      </ModalForm>
    </>
  );
};

export default CreateNetworkModal;

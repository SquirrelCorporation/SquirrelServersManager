import { GrommetIconsInstall } from '@shared/ui/icons/categories/actions';
import {
  getCollection,
  getCollections,
  postInstallCollection,
} from '@/services/rest/ansible/ansible.galaxy';
import { ProDescriptions, ProList, ProTable } from '@ant-design/pro-components';
import { message } from '@shared/ui/feedback/DynamicMessage';
import { Avatar, Button, Modal, Tag, Typography } from 'antd';
import React, { Dispatch, SetStateAction } from 'react';
import { AnsibleAPI } from 'ssm-shared-lib';

export type GalaxyStoreModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const GalaxyStoreModal: React.FC<GalaxyStoreModalProps> = ({
  open,
  setOpen,
}) => {
  const [selectedRow, setSelectedRow] = React.useState<AnsibleAPI.Data>();
  const [loading, setLoading] = React.useState(false);
  return (
    <Modal
      title="Ansible Galaxy Collections"
      centered
      open={open}
      onOk={() => {
        setSelectedRow(undefined);
        setOpen(false);
      }}
      onCancel={() => {
        setSelectedRow(undefined);
        setOpen(false);
      }}
      width={1500}
    >
      {(!selectedRow && (
        <ProList<any>
          ghost={false}
          itemCardProps={{
            ghost: false,
          }}
          pagination={{
            defaultPageSize: 9,
            showSizeChanger: false,
          }}
          showActions="hover"
          rowSelection={false}
          grid={{ gutter: 8, column: 3 }}
          request={getCollections}
          onItem={(record: any) => {
            return {
              onMouseEnter: () => {
                console.log(record);
              },
              onClick: () => {
                console.log(record);
              },
            };
          }}
          search={{
            filterType: 'light',
          }}
          metas={{
            title: {
              search: false,
              dataIndex: ['collection_version', 'name'],
            },
            subTitle: {
              title: 'Namespace',
              dataIndex: 'namespace',
              render: (_, row) => (
                <Tag key={row.collection_version.namespace}>
                  {row.collection_version.namespace}
                </Tag>
              ),
            },
            avatar: {
              search: false,
              dataIndex: 'logo',
              render: (_, row) => (
                <>
                  {(row?.namespace_metadata?.avatar_url && (
                    <Avatar
                      size={50}
                      shape="square"
                      style={{
                        marginRight: 4,
                        backgroundColor: 'rgba(41,70,147,0.51)',
                      }}
                      src={row.namespace_metadata.avatar_url}
                    />
                  )) || (
                    <Avatar
                      size={50}
                      shape="square"
                      style={{
                        marginRight: 4,
                        backgroundColor: 'rgba(41,70,147,0.51)',
                      }}
                    />
                  )}
                </>
              ),
            },
            content: {
              title: 'Keywords',
              render: (_, row) => (
                <Typography.Paragraph
                  style={{ height: '40px' }}
                  ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                >
                  {row.collection_version.description}
                </Typography.Paragraph>
              ),
            },
            actions: {
              search: false,
              cardActionProps: 'actions',
              render: (_, row) => {
                return [
                  <a key="details" onClick={() => setSelectedRow(row)}>
                    Details
                  </a>,
                ];
              },
            },
          }}
        />
      )) || (
        <ProDescriptions
          title={selectedRow?.collection_version.name}
          request={async () => {
            return await getCollection({
              name: selectedRow?.collection_version.name || '',
              namespace: selectedRow?.collection_version.namespace || '',
              version: selectedRow?.collection_version.version || '',
            });
          }}
          extra={
            <>
              {' '}
              <Button type="default" onClick={() => setSelectedRow(undefined)}>
                Back to collections
              </Button>
              <Button
                type={'primary'}
                icon={<GrommetIconsInstall />}
                loading={loading}
                onClick={async () => {
                  setLoading(true);
                  await postInstallCollection({
                    name: selectedRow?.collection_version.name || '',
                    namespace: selectedRow?.collection_version.namespace || '',
                  })
                    .then(() => {
                      message.success({
                        content: 'Successfully installed',
                        duration: 6,
                      });
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
              >
                Install
              </Button>
            </>
          }
          style={{ height: 600, marginTop: 20 }}
          column={4}
        >
          <ProDescriptions.Item
            render={() => {
              return (
                (selectedRow?.namespace_metadata?.avatar_url && (
                  <Avatar
                    size={50}
                    shape="square"
                    style={{
                      marginRight: 4,
                      backgroundColor: 'rgba(41,70,147,0.51)',
                    }}
                    src={selectedRow.namespace_metadata.avatar_url}
                  />
                )) || (
                  <Avatar
                    size={50}
                    shape="square"
                    style={{
                      marginRight: 4,
                      backgroundColor: 'rgba(41,70,147,0.51)',
                    }}
                  />
                )
              );
            }}
          />
          <ProDescriptions.Item
            label="License"
            dataIndex={['manifest', 'collection_info', 'license']}
            valueType="text"
          />
          <ProDescriptions.Item
            label="Version"
            dataIndex={['manifest', 'collection_info', 'version']}
            valueType="text"
          />
          <ProDescriptions.Item
            label="Repo"
            dataIndex={['manifest', 'collection_info', 'repository']}
            render={(_, row) => (
              <Typography.Link
                href={row.manifest?.collection_info?.repository}
                ellipsis={true}
              >
                {row.manifest?.collection_info?.repository}
              </Typography.Link>
            )}
          />
          <ProDescriptions.Item
            span={4}
            label="Tags"
            render={(_, row) =>
              row.manifest?.collection_info?.tags?.map((e: string) => (
                <Tag>{e}</Tag>
              ))
            }
          />
          <ProDescriptions.Item
            dataIndex="description"
            label="Description"
            valueType="textarea"
            span={4}
          />
          <ProDescriptions.Item
            dataIndex="Install"
            label="Installation"
            span={2}
            render={(_, row) => (
              <>
                <Typography.Text code>
                  $ansible-galaxy collection install {row.namespace}.{row.name}
                </Typography.Text>
              </>
            )}
          />
          <ProDescriptions.Item
            dataIndex="requires_ansible"
            label="Requires Ansible"
            valueType="textarea"
            span={2}
          />
          <ProDescriptions.Item
            span={4}
            render={(_, row) => (
              <ProTable
                dataSource={row.contents}
                search={false}
                style={{ width: '100%' }}
                toolBarRender={false}
                pagination={false}
                scroll={{ y: 250 }}
                columns={[
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                    valueType: 'text',
                  },
                  {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                    valueType: 'text',
                  },
                  {
                    title: 'Type',
                    dataIndex: 'content_type',
                    key: 'content_type',
                    valueType: 'text',
                  },
                ]}
              />
            )}
          />
        </ProDescriptions>
      )}
    </Modal>
  );
};

export default GalaxyStoreModal;

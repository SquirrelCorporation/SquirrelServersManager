import { getCollections } from '@/services/rest/ansible';
import { ProList } from '@ant-design/pro-components';
import { Avatar, Modal, Tag, Typography } from 'antd';
import React from 'react';

export type GalaxyStoreModalProps = {
  open: boolean;
  setOpen: any;
};

const GalaxyStoreModal: React.FC<GalaxyStoreModalProps> = (
  props: GalaxyStoreModalProps,
) => {
  const [data, setData] = React.useState();

  const asyncFetch = async () => {
    await getCollections().then((res) => {
      setData(res.data.data);
    });
  };

  React.useEffect(() => {
    asyncFetch();
  }, []);

  return (
    <Modal
      title="Appstore"
      centered
      open={props.open}
      onOk={() => props.setOpen(false)}
      onCancel={() => props.setOpen(false)}
      width={1500}
    >
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
        rowSelection={{}}
        grid={{ gutter: 16, column: 3 }}
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
        search={{}}
        metas={{
          title: {
            title: 'Title',
            dataIndex: ['collection_version', 'name'],
          },
          subTitle: {
            title: 'Namespace',
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
              <Avatar
                size={50}
                shape="square"
                style={{
                  marginRight: 4,
                  backgroundColor: 'rgba(41,70,147,0.51)',
                }}
                src={row.namespace_metadata.avatar_url}
              />
            ),
          },
          content: {
            title: 'Description',
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
            render: () => {
              return [<a key="details">Details</a>];
            },
          },
        }}
        dataSource={data}
      />
    </Modal>
  );
};

export default GalaxyStoreModal;

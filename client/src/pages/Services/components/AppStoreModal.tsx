import { ProList } from '@ant-design/pro-components';
import { Avatar, Modal, Tag, Typography } from 'antd';
import React from 'react';
import rawTemplates from './templates.json';

export type AppStoreModalProps = {
  open: boolean;
  setOpen: any;
};

const AppStoreModal: React.FC<AppStoreModalProps> = (
  props: AppStoreModalProps,
) => {
  const data = rawTemplates.templates.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
  });
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
          },
          subTitle: {
            title: 'Categories',
            render: (_, row) => (
              <>
                {row.categories?.map((e: string) => {
                  return <Tag key={e}>{e}</Tag>;
                })}
              </>
            ),
          },
          type: { search: false },
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
                src={row.logo}
              />
            ),
          },
          content: {
            dataIndex: 'description',
            title: 'Description',
            render: (_, row) => (
              <Typography.Paragraph
                ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
              >
                {row.description}
              </Typography.Paragraph>
            ),
          },
          actions: {
            search: false,
            cardActionProps: 'actions',
            render: () => {
              return [<a key="install">Install</a>];
            },
          },
        }}
        dataSource={data}
      />
    </Modal>
  );
};

export default AppStoreModal;

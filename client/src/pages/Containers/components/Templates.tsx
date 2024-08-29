import { Deploy } from '@/components/Icons/CustomIcons';
import ContainerStartModal from '@/pages/Containers/components/sub-components/ContainerStartModal';
import { getTemplates } from '@/services/rest/services';
import { ProList } from '@ant-design/pro-components';
import { Avatar, Tag, Typography } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const Templates: React.FC = () => {
  const [containerStartModalOpen, setContainerStartModalOpen] =
    React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<
    unknown | API.Template
  >();

  return (
    <>
      <ContainerStartModal
        template={selectedRow as unknown as API.Template}
        open={containerStartModalOpen}
        setOpen={setContainerStartModalOpen}
      />
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
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 3 }}
        search={{
          labelWidth: 140,
          filterType: 'light',
        }}
        metas={{
          title: {
            title: 'Title',
          },
          subTitle: {
            title: 'Categories',
            dataIndex: 'categories',
            render: (_, row) => (
              <>
                {row.categories?.map((e: string) => {
                  return <Tag key={e}>{e}</Tag>;
                })}
              </>
            ),
            valueType: 'select',
            valueEnum: {
              Authentication: { text: 'Authentication' },
              Arr: { text: 'Arr' },
              Communication: { text: 'Communication' },
              CMS: { text: 'CMS' },
              Database: { text: 'Database' },
              Dashboard: { text: 'Dashboard' },
              Development: { text: 'Development' },
              Downloaders: { text: 'Downloaders' },
              Finance: { text: 'Finance' },
              Gaming: { text: 'Gaming' },
              LDAP: { text: 'LDAP' },
              Media: { text: 'Media' },
              Monitoring: { text: 'Web' },
              Multimedia: { text: 'Multimedia' },
              Networking: { text: 'Networking' },
              Other: { text: 'Other' },
              Paid: { text: 'Paid' },
              Productivity: { text: 'Productivity' },
              Security: { text: 'Security' },
              Tools: { text: 'Tools' },
              VPN: { text: 'VPN' },
              Web: { text: 'Web' },
            },
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
                style={{ minHeight: '66px' }}
                ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
              >
                {row.description}
              </Typography.Paragraph>
            ),
          },
          actions: {
            search: false,
            cardActionProps: 'actions',
            render: (_, row) => {
              return [
                <a
                  key="deploy-details"
                  onClick={() => {
                    setSelectedRow(row);
                    setContainerStartModalOpen(true);
                  }}
                >
                  <Deploy /> Deploy
                </a>,
              ];
            },
          },
        }}
        request={getTemplates}
      />
    </>
  );
};

export default Templates;

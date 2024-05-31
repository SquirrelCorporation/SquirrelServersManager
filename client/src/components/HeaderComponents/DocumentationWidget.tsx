import { QuestionCircleOutlined } from '@ant-design/icons';
import { Avatar, Drawer, Spin } from 'antd';
import React from 'react';

const DocumentationWidget = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <>
      <Drawer
        open={isOpen}
        width={600}
        title={'Documentation'}
        bodyStyle={{ padding: '0px' }}
        onClose={() => setIsOpen(false)}
      >
        <Spin size="large" spinning={isLoading} style={{ width: '100%' }} />
        <iframe
          src={'https://squirrelserversmanager.io/docs/userguide'}
          style={{ width: '100%', height: '100%', borderWidth: 0 }}
          onLoad={() => setIsLoading(false)}
        />
      </Drawer>
      <Avatar
        onClick={() => {
          setIsOpen(true);
        }}
        src={
          <QuestionCircleOutlined
            style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.65)' }}
          />
        }
      />
    </>
  );
};

export default DocumentationWidget;

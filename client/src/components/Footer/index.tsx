import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} Squirrel Team (AGPL-3.0 license).`}
      links={[
        {
          key: 'ssm',
          title: 'Squirrel Servers Manager',
          href: 'https://squirrelserversmanager.io/',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/SquirrelCorporation/SquirrelServersManager',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;

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
      copyright={`${currentYear} Squirrel Team.`}
      links={[
        {
          key: 'ssm',
          title: 'Squirrel Servers Manager',
          href: 'https://pro.ant.design',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/facos86/ssm',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;

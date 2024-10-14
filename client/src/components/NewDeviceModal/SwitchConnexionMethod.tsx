import { SwapOutlined, SwitcherOutlined } from '@ant-design/icons';
import { Alert, Button, Space, Typography } from 'antd';
import React from 'react';

const SwitchConnexionMethod = () => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <Alert
      style={{ marginTop: 15 }}
      message={'Encountering problems?'}
      description={
        showDetails ? (
          <Space direction={'vertical'}>
            <Typography.Text>
              Try switching to the classic Ansible SSH connexion method instead
              of paramiko (not available when using a passphrase protected key).
            </Typography.Text>
            <Typography.Text>
              SSH &rarr; Show advanced &rarr; Connection Method &rarr; *SSH*
            </Typography.Text>
            <Typography.Link
              href={
                'https://squirrelserversmanager.io/docs/technical-guide/troubleshoot'
              }
              target={'_blank'}
            >
              [More details]
            </Typography.Link>
          </Space>
        ) : undefined
      }
      action={
        showDetails ? undefined : (
          <Button size="small" onClick={() => setShowDetails(true)}>
            Details
          </Button>
        )
      }
      showIcon
    />
  );
};

export default SwitchConnexionMethod;

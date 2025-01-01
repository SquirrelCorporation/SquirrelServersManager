import {
  Ansible,
  Link,
  MedicalSearchDiagnosisSolid,
  Proxmox,
  Squirrel,
} from '@/components/Icons/CustomIcons';
import TroubleshootSelect from '@/components/Troubleshoot/TroubleshootSelect';
import { getGitPlaybooksRepositories } from '@/services/rest/playbooks-repositories';
import { DockerOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormDependency,
  ProFormRadio,
} from '@ant-design/pro-components';
import { Breadcrumb, Button, Col, Row, Space, Tag, Typography } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const TroubleshootActions = {
  playbooks_repositories_git_errors: {
    type: 'logs',
    view: (
      <>
        <TroubleshootSelect
          request={async () => {
            return (await getGitPlaybooksRepositories()).data?.map((repo) => ({
              value: repo.uuid,
              label: repo.name,
            }));
          }}
          label={'Select a Git Playbooks Repository'}
        />
        {/* Right-aligned button using AntD Row and Col */}
        <Row justify="end" style={{ marginTop: 16 }}>
          <ProFormDependency name={['troubleshoot_select']}>
            {({ troubleshoot_select }) => {
              if (troubleshoot_select) {
                return (
                  <Col>
                    <Button type="primary">Run Diagnostic</Button>
                  </Col>
                );
              }
            }}
          </ProFormDependency>
        </Row>
      </>
    ),
  },
};

export const TroubleshootOptions = [
  {
    label: (
      <>
        <Squirrel /> Squirrel Servers Manager (Playbooks, Playbooks
        Repositories, Stacks)
      </>
    ),
    value: 'ssm',
    children: [
      {
        value: 'playbooks_repositories',
        label: 'Playbooks Repositories (Local, Git)',
        children: [
          {
            value: 'git_playbooks_repositories',
            label: 'Git Playbooks Repositories',
            children: [
              {
                value: 'playbooks_repositories_internal_errors',
                label:
                  'I am experiencing internal errors when running a playbook from a repository.',
              },
              {
                value: 'playbooks_repositories_git_errors',
                label: 'I cannot clone a Git repository.',
              },
              {
                value: 'playbooks_repositories_git_errors',
                label: 'I cannot pull a Git repository.',
              },
            ],
          },
          {
            value: 'local_playbooks_repositories',
            label: 'Local Playbooks Repositories',
            children: [
              {
                value: 'playbooks_repositories_internal_errors',
                label:
                  'I am experiencing internal errors when running a playbook from a repository.',
              },
            ],
          },
        ],
      },
      {
        value: 'playbooks',
        label: 'Playbooks',
        children: [
          {
            value: 'playbooks_repositories_internal_errors',
            label: 'I am experiencing errors when running a playbook.',
          },
        ],
      },
    ],
  },
  {
    label: (
      <>
        <Ansible /> Ansible
      </>
    ),
    value: 'ansible',
    children: [
      {
        value: 'ansible_connection_errors',
        label: 'Ansible is not able to connect to the remote host.',
      },
    ],
  },
  {
    label: (
      <>
        <DockerOutlined /> Docker
      </>
    ),
    value: 'docker',
    children: [
      {
        value: 'docker_connection_errors',
        label: 'SSM is not able to connect to the remote host\s Docker daemon.',
      },
      {
        value: 'docker_containers_errors',
        label:
          'SSM is not able to retrieving docker containers, or the list is incomplete.',
      },
    ],
  },
  {
    label: (
      <>
        <Proxmox /> Proxmox
      </>
    ),
    value: 'proxmox',
    children: [
      {
        value: 'proxmox_connection_errors',
        label: "SSM is not able to connect to the remote host's Proxmox API.",
      },
      {
        value: 'proxmox_containers_errors',
        label:
          'SSM is not able to retrieving proxmox lxd/qemu containers, or the list is incomplete.',
      },
    ],
  },
];

type TroubleshootModalProps = {
  device?: API.DeviceItem;
};

const TroubleshootModal: React.FC<TroubleshootModalProps> = ({ device }) => {
  // History stack to navigate options
  const [historyStack, setHistoryStack] = React.useState([TroubleshootOptions]);
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null); // State to track the selected value in the current view
  const [showAction, setShowAction] = React.useState();
  const currentOptions = historyStack[historyStack.length - 1];

  const handleOptionChange = (value: string) => {
    const nextOption = currentOptions.find((option) => option.value === value);
    if (nextOption?.children) {
      // Navigate to the selected option's children
      setHistoryStack((prevStack) => [...prevStack, nextOption.children]);
      setSelectedValue(null); // Reset the selection for the next level
    } else {
      setShowAction(TroubleshootActions[value]);
    }
  };

  const handleGoBack = () => {
    setShowAction(undefined);
    if (historyStack.length > 1) {
      // Remove the last level and go back
      setHistoryStack((prevStack) => prevStack.slice(0, -1));
      setSelectedValue(null); // Reset the selection when going back
    }
  };

  return (
    <ModalForm
      destroyOnClose
      trigger={<Button>Run troubleshooting</Button>}
      title={
        <>
          <MedicalSearchDiagnosisSolid /> Troubleshoot
        </>
      }
      onFinish={() => {}}
      submitter={{
        resetButtonProps: { style: { display: 'none' } },
        submitButtonProps: { style: { display: 'none' } },
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Radio Group for Current Options */}
        <ProFormRadio.Group
          layout={'vertical'}
          name="radio-group"
          label="Select the element you want to troubleshoot:"
          fieldProps={{
            onChange: (event) => {
              setSelectedValue(event.target.value); // Update the selection in state
              handleOptionChange(event.target?.value);
            },
            value: selectedValue, // Bind the state to the form field value
          }}
          options={currentOptions}
        />

        {showAction && <>{showAction.view}</>}

        {/* Go Back Button */}
        {historyStack.length > 1 && (
          <Button onClick={handleGoBack} style={{ marginBottom: 16 }}>
            Go Back
          </Button>
        )}
      </Space>
    </ModalForm>
  );
};

export default TroubleshootModal;

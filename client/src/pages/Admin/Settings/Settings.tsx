import Title, { TitleColors } from '@/components/Template/Title';
import AdvancedSettings from '@/pages/Admin/Settings/components/AdvancedSettings';
import AuthenticationSettings from '@/pages/Admin/Settings/components/AuthenticationSettings';
import ContainerStacksSettings from '@/pages/Admin/Settings/components/ContainerStacksSettings';
import GeneralSettings from '@/pages/Admin/Settings/components/GeneralSettings';
import Information from '@/pages/Admin/Settings/components/Information';
import PlaybookSettings from '@/pages/Admin/Settings/components/PlaybooksSettings';
import RegistrySettings from '@/pages/Admin/Settings/components/RegistrySettings';
import {
  UserOutlined,
  SettingOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
  CloudServerOutlined,
  SafetyCertificateOutlined,
  CodeOutlined,
  ControlOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import React from 'react';
import { useSlot } from '@/plugins/contexts/plugin-context';
import MCPSettings from './components/MCPSettings';
import StyledTabContainer, {
  TabLabel,
  IconWrapper,
} from '@/components/Layout/StyledTabContainer';
import {
  AiBusinessImpactAssessment,
  SkillLevelAdvanced,
} from '@/components/Icons/CustomIcons';

const Settings: React.FC = () => {
  const SettingsPanelsSlot = useSlot('settings-panels');

  const settingsTabItems = [
    {
      key: 'general-settings',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #6B8CEA, #6A44E4)">
            <SettingOutlined />
          </IconWrapper>
          General settings
        </TabLabel>
      ),
      children: <GeneralSettings />,
    },
    {
      key: 'authentication',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #5856D6, #3634A3)">
            <SafetyCertificateOutlined />
          </IconWrapper>
          Authentication
        </TabLabel>
      ),
      children: <AuthenticationSettings />,
    },
    {
      key: 'playbooks',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #FF9500, #E67C22)">
            <CodeOutlined />
          </IconWrapper>
          Playbooks
        </TabLabel>
      ),
      children: <PlaybookSettings />,
    },
    {
      key: 'container-stacks',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #32D74B, #27AE60)">
            <CloudServerOutlined />
          </IconWrapper>
          Container Stacks
        </TabLabel>
      ),
      children: <ContainerStacksSettings />,
    },
    {
      key: 'container-registries',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #64D2FF, #5AC8FA)">
            <DatabaseOutlined />
          </IconWrapper>
          Container Registries
        </TabLabel>
      ),
      children: <RegistrySettings />,
    },
    {
      key: 'mcp-settings',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #FF375F, #E31B4E)">
            <AiBusinessImpactAssessment />
          </IconWrapper>
          MCP
        </TabLabel>
      ),
      children: <MCPSettings />,
    },
    {
      key: 'advanced',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #BF5AF2, #9D4ECA)">
            <SkillLevelAdvanced />
          </IconWrapper>
          Advanced
        </TabLabel>
      ),
      children: <AdvancedSettings />,
    },
    {
      key: 'system-information',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #FF2D55, #FF375F)">
            <InfoCircleOutlined />
          </IconWrapper>
          System Information
        </TabLabel>
      ),
      children: <Information />,
    },
    {
      key: 'plugins',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #30B0C7, #2891A5)">
            <AppstoreOutlined />
          </IconWrapper>
          Plugins
        </TabLabel>
      ),
      children: <SettingsPanelsSlot />,
    },
  ];

  return (
    <StyledTabContainer
      tabItems={settingsTabItems}
    />
  );
};

export default Settings;

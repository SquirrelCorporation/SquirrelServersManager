import Icon from '@ant-design/icons';
import React from 'react';
import {
  CibNpm,
  DeviconPlainBash,
  DeviconPlainGcc,
  DeviconPlainRedisWordmark,
  EpLock,
  GenericSoftwareResource,
  GrommetIconsNode,
  JamFish,
  LaGrunt,
  LaGulp,
  LaJava,
  LaYarn,
  SimpleIconsApache,
  SimpleIconsDocker,
  SimpleIconsDotnet,
  SimpleIconsGit,
  SimpleIconsMongodb,
  SimpleIconsMysql,
  SimpleIconsNginx,
  SimpleIconsPhp,
  SimpleIconsPm2,
  SimpleIconsPostgresql,
  SimpleIconsPowershell,
  SimpleIconsPython,
  SimpleIconsV8,
  SimpleIconsVirtualbox,
  SimpleIconsZsh,
  StreamlineComputerChip2CoreMicroprocessorDeviceElectronicsChipComputer,
  VscodeIconsFileTypePip,
  VscodeIconsFileTypeTsconfig,
  WhhPerlalt,
} from '@/components/DeviceComponents/OSSoftwaresVersions/SoftwareIcons';

type SoftwareIconType = {
  name: string;
};

const iconMap: { [key: string]: (props: any) => JSX.Element } = {
  kernel:
    StreamlineComputerChip2CoreMicroprocessorDeviceElectronicsChipComputer,
  openssl: EpLock,
  systemopenssl: EpLock,
  systemopenssllib: EpLock,
  node: GrommetIconsNode,
  v8: SimpleIconsV8,
  npm: CibNpm,
  yarn: LaYarn,
  pm2: SimpleIconsPm2,
  gulp: LaGulp,
  grunt: LaGrunt,
  git: SimpleIconsGit,
  tsc: VscodeIconsFileTypeTsconfig,
  mysql: SimpleIconsMysql,
  redis: DeviconPlainRedisWordmark,
  mongodb: SimpleIconsMongodb,
  apache: SimpleIconsApache,
  nginx: SimpleIconsNginx,
  php: SimpleIconsPhp,
  docker: SimpleIconsDocker,
  postgresql: SimpleIconsPostgresql,
  perl: WhhPerlalt,
  python: SimpleIconsPython,
  python3: SimpleIconsPython,
  pip: VscodeIconsFileTypePip,
  pip3: VscodeIconsFileTypePip,
  java: LaJava,
  gcc: DeviconPlainGcc,
  bash: DeviconPlainBash,
  zsh: SimpleIconsZsh,
  fish: JamFish,
  powershell: SimpleIconsPowershell,
  dotnet: SimpleIconsDotnet,
  virtualbox: SimpleIconsVirtualbox,
};

const SoftwareIcon: React.FC<SoftwareIconType> = ({ name }) => {
  const IconComponent = iconMap[name.toLowerCase()] || GenericSoftwareResource;
  return (
    <Icon
      component={IconComponent}
      style={{ verticalAlign: 'middle', fontSize: '16px' }}
    />
  );
};

export default SoftwareIcon;

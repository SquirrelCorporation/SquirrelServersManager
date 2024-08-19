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
import React from 'react';

type SoftwareIconType = {
  name: string;
};

const SoftwareIcon: React.FC<SoftwareIconType> = (props) => {
  switch (props.name.toLowerCase()) {
    case 'kernel':
      return (
        <StreamlineComputerChip2CoreMicroprocessorDeviceElectronicsChipComputer
          style={{ verticalAlign: 'middle' }}
        />
      );
    case 'openssl':
    case 'systemopenssl':
    case 'systemopenssllib':
      return <EpLock style={{ verticalAlign: 'middle' }} />;
    case 'node':
      return <GrommetIconsNode style={{ verticalAlign: 'middle' }} />;
    case 'v8':
      return <SimpleIconsV8 style={{ verticalAlign: 'middle' }} />;
    case 'npm':
      return <CibNpm style={{ verticalAlign: 'middle' }} />;
    case 'yarn':
      return <LaYarn style={{ verticalAlign: 'middle' }} />;
    case 'pm2':
      return <SimpleIconsPm2 style={{ verticalAlign: 'middle' }} />;
    case 'gulp':
      return <LaGulp style={{ verticalAlign: 'middle' }} />;
    case 'grunt':
      return <LaGrunt style={{ verticalAlign: 'middle' }} />;
    case 'git':
      return <SimpleIconsGit style={{ verticalAlign: 'middle' }} />;
    case 'tsc':
      return (
        <VscodeIconsFileTypeTsconfig style={{ verticalAlign: 'middle' }} />
      );
    case 'mysql':
      return <SimpleIconsMysql style={{ verticalAlign: 'middle' }} />;
    case 'redis':
      return <DeviconPlainRedisWordmark style={{ verticalAlign: 'middle' }} />;
    case 'mongodb':
      return <SimpleIconsMongodb style={{ verticalAlign: 'middle' }} />;
    case 'apache':
      return <SimpleIconsApache style={{ verticalAlign: 'middle' }} />;
    case 'nginx':
      return <SimpleIconsNginx style={{ verticalAlign: 'middle' }} />;
    case 'php':
      return <SimpleIconsPhp style={{ verticalAlign: 'middle' }} />;
    case 'docker':
      return <SimpleIconsDocker style={{ verticalAlign: 'middle' }} />;
    case 'postgresql':
      return <SimpleIconsPostgresql style={{ verticalAlign: 'middle' }} />;
    case 'perl':
      return <WhhPerlalt style={{ verticalAlign: 'middle' }} />;
    case 'python':
    case 'python3':
      return <SimpleIconsPython style={{ verticalAlign: 'middle' }} />;
    case 'pip':
    case 'pip3':
      return <VscodeIconsFileTypePip style={{ verticalAlign: 'middle' }} />;
    case 'java':
      return <LaJava style={{ verticalAlign: 'middle' }} />;
    case 'gcc':
      return <DeviconPlainGcc style={{ verticalAlign: 'middle' }} />;
    case 'bash':
      return <DeviconPlainBash style={{ verticalAlign: 'middle' }} />;
    case 'zsh':
      return <SimpleIconsZsh style={{ verticalAlign: 'middle' }} />;
    case 'fish':
      return <JamFish style={{ verticalAlign: 'middle' }} />;
    case 'powershell':
      return <SimpleIconsPowershell style={{ verticalAlign: 'middle' }} />;
    case 'dotnet':
      return <SimpleIconsDotnet style={{ verticalAlign: 'middle' }} />;
    case 'virtualbox':
      return <SimpleIconsVirtualbox style={{ verticalAlign: 'middle' }} />;
    default:
      return <GenericSoftwareResource style={{ verticalAlign: 'middle' }} />;
  }
  /*
      "systemOpenssl": "3.2.0",

      "git": "2.23.0",
      "tsc": "5.3.3",
      "mysql": "",
      "cache": "",
      "mongodb": "7.0.2",
      "apache": "2.4.56",
      "nginx": "",
      "php": "",
      "docker": "24.0.7",
      "postfix": "3.2.2",
      "postgresql": "",
      "perl": "5.30.3",
      "python": "",
      "python3": "3.11.7",
      "pip": "23.3.2",
      "pip3": "23.3.2",
      "java": "15.0.1",
      "gcc": "15.0.0",
      "virtualbox": "7.0.8_BETA4",
      "bash": "3.2.57",
      "zsh": "5.9",
      "fish": "",
      "powershell": "",
      "dotnet": ""
  }*/
};

export default SoftwareIcon;

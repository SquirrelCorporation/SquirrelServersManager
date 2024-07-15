import {
  DeviconAzure,
  DeviconGooglecloud,
  FluentMdl2RegistryEditor,
  LogosAws,
  LogosGitlab,
  LogosQuay,
  SimpleIconsForgejo,
  SimpleIconsGitea,
  VaadinCubes,
  VscodeIconsFileTypeDocker2,
  ZmdiGithub,
} from '@/components/Icons/CustomIcons';
import React from 'react';

type RegistryLogoProps = {
  provider: string;
};

const RegistryLogo: React.FC<RegistryLogoProps> = (props) => {
  switch (props.provider) {
    case 'ghcr':
      return <ZmdiGithub style={{ fontSize: '28px' }} />;
    case 'gcr':
      return <DeviconGooglecloud style={{ fontSize: '28px' }} />;
    case 'acr':
      return <DeviconAzure style={{ fontSize: '28px' }} />;
    case 'hub':
      return <VscodeIconsFileTypeDocker2 style={{ fontSize: '28px' }} />;
    case 'ecr':
      return <LogosAws style={{ fontSize: '28px' }} />;
    case 'quay':
      return <LogosQuay style={{ fontSize: '28px' }} />;
    case 'forgejo':
      return <SimpleIconsForgejo style={{ fontSize: '28px' }} />;
    case 'gitea':
      return <SimpleIconsGitea style={{ fontSize: '28px' }} />;
    case 'lscr':
      return <VaadinCubes style={{ fontSize: '28px' }} />;
    case 'gitlab':
      return <LogosGitlab style={{ fontSize: '28px' }} />;
    default:
      return <FluentMdl2RegistryEditor style={{ fontSize: '28px' }} />;
  }
};

export default RegistryLogo;

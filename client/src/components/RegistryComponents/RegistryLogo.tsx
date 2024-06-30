import {
  DeviconAzure,
  DeviconGooglecloud,
  FluentMdl2RegistryEditor,
  LogoHotIo,
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
      return <ZmdiGithub />;
    case 'gcr':
      return <DeviconGooglecloud />;
    case 'acr':
      return <DeviconAzure />;
    case 'hotio':
      return <LogoHotIo />;
    case 'hub':
      return <VscodeIconsFileTypeDocker2 />;
    case 'ecr':
      return <LogosAws />;
    case 'quay':
      return <LogosQuay />;
    case 'forgejo':
      return <SimpleIconsForgejo />;
    case 'gitea':
      return <SimpleIconsGitea />;
    case 'lscr':
      return <VaadinCubes />;
    case 'gitlab':
      return <LogosGitlab />;
    default:
      return <FluentMdl2RegistryEditor />;
  }
};

export default RegistryLogo;

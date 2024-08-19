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

const iconMapping: { [key: string]: React.ElementType } = {
  ghcr: ZmdiGithub,
  gcr: DeviconGooglecloud,
  acr: DeviconAzure,
  hub: VscodeIconsFileTypeDocker2,
  ecr: LogosAws,
  quay: LogosQuay,
  forgejo: SimpleIconsForgejo,
  gitea: SimpleIconsGitea,
  lscr: VaadinCubes,
  gitlab: LogosGitlab,
  default: FluentMdl2RegistryEditor,
};

const defaultStyle = { fontSize: '28px' };

const RegistryLogo: React.FC<RegistryLogoProps> = React.memo(({ provider }) => {
  const IconComponent = iconMapping[provider] || iconMapping.default;
  return <IconComponent style={defaultStyle} />;
});

export default RegistryLogo;

import debian from './img/128_debian.png';
import darwin from './img/apple.png';

import {Avatar} from "antd";
import React from "react";

export type OsLogoAttributes = {
  logoFile?: string;
};
export const OsLogo : React.FC<OsLogoAttributes> = (logoAttributes) => {
  switch (logoAttributes.logoFile) {
    case 'apple':
    case 'darwin':
      return <Avatar src={<img src={darwin} alt={logoAttributes.logoFile}/>}/>;
    case 'windows':
      return <></>;
    case 'arch':
      return <></>;
    case 'centos':
      return <></>;
    case 'coreos':
      return <></>;
    case 'debian':
      return <></>;
    case 'deepin':
      return <></>;
    case 'elementary':
      return <></>;
    case 'fedora':
      return <></>;
    case 'gentoo':
      return <></>;
    case 'mageia':
      return <></>;
    case 'mandriva':
      return <></>;
    case 'manjaro':
      return <></>;
    case 'mint':
      return <></>;
    case 'mx':
      return <></>;
    case 'openbsd':
      return <></>;
    case 'freebsd':
      return <></>;
    case 'pclinuxos':
      return <></>;
    case 'puppy':
      return <></>;
    case 'raspbian':
      return <></>;
    case 'reactos':
      return <></>;
    case 'slackware':
      return <></>;
    case 'sugar':
      return <></>;
    case 'redhat':
      return <></>;
    case 'steam':
      return <></>;
    case 'suse':
      return <></>;
    case 'mate':
      return <></>;
    case 'xubuntu':
      return <></>;
    case 'lubuntu':
      return <></>;
    case 'ubuntu':
      return <></>;
    case 'solaris':
      return <></>;
    case 'tails':
      return <></>;
   default:
    return <></>
  }
}

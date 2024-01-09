import debian from './img/128_debian.png';
import darwin from './img/apple.png';

export const OsLogo = (logoFile: string | undefined): string => {
  switch (logoFile) {
    case 'apple':
    case 'darwin':
      return darwin;
    case 'windows':
      return '';
    case 'arch':
      return '';
    case 'centos':
      return '';
    case 'coreos':
      return '';
    case 'debian':
      return debian;
    case 'deepin':
      return '';
    case 'elementary':
      return '';
    case 'fedora':
      return '';
    case 'gentoo':
      return '';
    case 'mageia':
      return '';
    case 'mandriva':
      return '';
    case 'manjaro':
      return '';
    case 'mint':
      return '';
    case 'mx':
      return '';
    case 'openbsd':
      return '';
    case 'freebsd':
      return '';
    case 'pclinuxos':
      return '';
    case 'puppy':
      return '';
    case 'raspbian':
      return '';
    case 'reactos':
      return '';
    case 'slackware':
      return '';
    case 'sugar':
      return '';
    case 'redhat':
      return '';
    case 'steam':
      return '';
    case 'suse':
      return '';
    case 'mate':
      return '';
    case 'xubuntu':
      return '';
    case 'lubuntu':
      return '';
    case 'ubuntu':
      return '';
    case 'solaris':
      return '';
    case 'tails':
      return '';
    default:
      return '';
  }
};

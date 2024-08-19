import arch from './img/128_arch.png';
import centos from './img/128_centos_blue.png';
import debian from './img/128_debian.png';
import deepin from './img/128_deepin.png';
import elementary from './img/128_elementary.png';
import fedora from './img/128_fedora_newlogo.png';
import generic from './img/128_generic.png';
import gentoo from './img/128_gentoo.png';
import lubuntu from './img/128_lubuntu.png';
import mageia from './img/128_mageia.png';
import manjaro from './img/128_manjaro.png';
import mint from './img/128_mint.png';
import mx from './img/128_mx.png';
import mandriva from './img/128_openmandriva.png';
import pclinuxos from './img/128_pclinuxos.png';
import puppy from './img/128_puppy_blue.png';
import raspbian from './img/128_raspios.png';
import redhat from './img/128_redhat.png';
import slackware from './img/128_slackware.png';
import suse from './img/128_suse.png';
import tails from './img/128_tails.png';
import coreos from './img/128_tinycore.png';
import ubuntu from './img/128_ubuntu.png';
import mate from './img/128_ubuntu_mate.png';
import windows from './img/128_windows.png';
import xubuntu from './img/128_xubuntu.png';
import darwin from './img/apple.png';
import freebsd from './img/freebsd.jpeg';
import openbsd from './img/openbsd_logo_icon_248311.png';
import reactos from './img/reactos.png';

export const OsLogo = (logoFile: string | undefined): string => {
  switch (logoFile) {
    case 'apple':
    case 'darwin':
      return darwin;
    case 'windows':
      return windows;
    case 'arch':
      return arch;
    case 'centos':
      return centos;
    case 'coreos':
      return coreos;
    case 'debian':
      return debian;
    case 'deepin':
      return deepin;
    case 'elementary':
      return elementary;
    case 'fedora':
      return fedora;
    case 'gentoo':
      return gentoo;
    case 'mageia':
      return mageia;
    case 'mandriva':
      return mandriva;
    case 'manjaro':
      return manjaro;
    case 'mint':
      return mint;
    case 'mx':
      return mx;
    case 'openbsd':
      return openbsd;
    case 'freebsd':
      return freebsd;
    case 'pclinuxos':
      return pclinuxos;
    case 'puppy':
      return puppy;
    case 'raspbian':
      return raspbian;
    case 'reactos':
      return reactos;
    case 'slackware':
      return slackware;
    case 'redhat':
      return redhat;
    case 'steam':
      return generic;
    case 'suse':
      return suse;
    case 'mate':
      return mate;
    case 'xubuntu':
      return xubuntu;
    case 'lubuntu':
      return lubuntu;
    case 'ubuntu':
      return ubuntu;
    case 'solaris':
      return '';
    case 'tails':
      return tails;
    default:
      return generic;
  }
};

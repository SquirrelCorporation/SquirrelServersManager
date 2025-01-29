import { SsmAnsible } from 'ssm-shared-lib';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import { DEFAULT_VAULT_ID, vaultDecrypt } from '../../modules/ansible-vault/ansible-vault';

export async function generateSudoCommand(deviceUuid: string): Promise<string> {
  const deviceAuth = (await DeviceAuthRepo.findOneByDeviceUuid(deviceUuid))?.[0];
  if (!deviceAuth) {
    throw new Error(`DeviceAuth with uuid: ${deviceUuid} not found`);
  }
  const { user, password, method } = {
    user: deviceAuth.becomeUser,
    password: deviceAuth.becomePass
      ? await vaultDecrypt(deviceAuth.becomePass, DEFAULT_VAULT_ID)
      : undefined,
    method: deviceAuth.becomeMethod,
  };

  switch (method) {
    case SsmAnsible.AnsibleBecomeMethod.SUDO:
      // Sudo command with password
      if (password) {
        return `echo ${JSON.stringify(password)} | sudo -S -p "" true`;
      }
      // Sudo without password
      return user ? `sudo -u ${user} true` : `sudo true`;

    case SsmAnsible.AnsibleBecomeMethod.SU:
      // su command with password
      if (password) {
        return `echo ${JSON.stringify(password)} | su ${user || ''}`;
      }
      // su without password
      return `su ${user || ''}`;

    case SsmAnsible.AnsibleBecomeMethod.PBRUN:
      // pbrun doesn't natively support password passing; use user if available
      return user ? `pbrun -u ${user}` : `pbrun`;

    case SsmAnsible.AnsibleBecomeMethod.PFEXEC:
      // pfexec (no password support; only provide user if available)
      return user ? `pfexec -u ${user}` : `pfexec`;

    case SsmAnsible.AnsibleBecomeMethod.DOAS:
      // doas (openbsd tool, may support user config in doas.conf)
      return user ? `doas -u ${user}` : `doas`;

    case SsmAnsible.AnsibleBecomeMethod.DZDO:
      // dzdo (Powerbroker; usually interactive, user pre-configured)
      if (user) {
        return password
          ? `echo ${JSON.stringify(password)} | dzdo -u ${user} true`
          : `dzdo -u ${user} true`;
      }
      return `dzdo true`;

    case SsmAnsible.AnsibleBecomeMethod.KSU:
      // ksu (Kerberos su, user optional; may not support password)
      return user ? `ksu ${user}` : `ksu`;

    case SsmAnsible.AnsibleBecomeMethod.RUNAS:
      // runas (Windows-specific, password likely provided interactively)
      return user ? `runas /user:${user}` : `runas`;

    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

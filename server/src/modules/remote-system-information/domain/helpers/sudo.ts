import { SsmAnsible } from 'ssm-shared-lib';
import { IDeviceAuthService } from '@modules/devices';
import { DEFAULT_VAULT_ID } from '@modules/ansible-vaults';
import { VaultService } from '@infrastructure/security/vault-crypto/services/vault.service';
import { VAULT_PWD } from 'src/config';

const vaultDecrypt = async (str: string, vault: string) => {
  const _vault = new VaultService({ password: VAULT_PWD });
  return await _vault.decrypt(str, vault);
};

/**
 * Generate sudo command based on device authentication information
 * @param deviceUuid Device UUID
 * @param deviceAuthService Service for accessing device authentication data
 */
export async function generateSudoCommand(
  deviceUuid: string,
  deviceAuthService?: IDeviceAuthService,
): Promise<string> {
  if (!deviceAuthService) {
    throw new Error('DeviceAuthService is required');
  }

  // Find device auth by device UUID
  const deviceAuthList = await deviceAuthService.findDeviceAuthByDeviceUuid(deviceUuid);
  const deviceAuth = deviceAuthList?.[0];
  if (!deviceAuth) {
    throw new Error(`DeviceAuth with uuid: ${deviceUuid} not found`);
  }

  const { becomeUser: user, becomePass, becomeMethod: method } = deviceAuth;

  // Decrypt password if available
  const password = becomePass ? await vaultDecrypt(becomePass, DEFAULT_VAULT_ID) : undefined;

  switch (method) {
    case SsmAnsible.AnsibleBecomeMethod.SUDO:
      if (user && password) {
        return `echo ${JSON.stringify(password)} | su - ${user} -c "%command%"`;
      }
      // Sudo command with password
      if (password) {
        return `echo ${JSON.stringify(password)} | sudo -S -p "" %command%`;
      }
      // Sudo without password
      return user ? `sudo -u ${user} %command%` : `sudo %command%`;

    case SsmAnsible.AnsibleBecomeMethod.SU:
      // su command with password
      if (password) {
        return `echo ${JSON.stringify(password)} | su ${user || ''} -c "%command%"`;
      }
      // su without password
      return `su ${user || ''}`;

    case SsmAnsible.AnsibleBecomeMethod.PBRUN:
      // pbrun doesn't natively support password passing; use user if available
      return user ? `pbrun -u ${user} %command%` : `pbrun %command%`;

    case SsmAnsible.AnsibleBecomeMethod.PFEXEC:
      // pfexec (no password support; only provide user if available)
      return user ? `pfexec -u ${user} %command%` : `pfexec %command%`;

    case SsmAnsible.AnsibleBecomeMethod.DOAS:
      // doas (openbsd tool, may support user config in doas.conf)
      return user ? `doas -u ${user} %command%` : `doas %command%`;

    case SsmAnsible.AnsibleBecomeMethod.DZDO:
      // dzdo (Powerbroker; usually interactive, user pre-configured)
      if (user) {
        return password
          ? `echo ${JSON.stringify(password)} | dzdo -u ${user} %command%`
          : `dzdo -u ${user} %command%`;
      }
      return `dzdo %command%`;

    case SsmAnsible.AnsibleBecomeMethod.KSU:
      // ksu (Kerberos su, user optional; may not support password)
      return user ? `ksu ${user} %command%` : `ksu %command%`;

    case SsmAnsible.AnsibleBecomeMethod.RUNAS:
      // runas (Windows-specific, password likely provided interactively)
      return user ? `runas /user:${user} %command%` : `runas %command%`;

    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

import { getFromCache, setToCache } from '../../data/cache';
import Shell from '../../modules/shell';

export async function getAnsibleVersion() {
  const ansibleVersion = await getFromCache('ansible-version');
  if (ansibleVersion) {
    return ansibleVersion;
  } else {
    const retrievedAnsibleVersion = await Shell.AnsibleShellCommandsManager.getAnsibleVersion();
    if (retrievedAnsibleVersion) {
      await setToCache('ansible-version', retrievedAnsibleVersion);
    }
    return retrievedAnsibleVersion;
  }
}

export async function setAnsibleVersion() {
  const retrievedAnsibleVersion = await Shell.AnsibleShellCommandsManager.getAnsibleVersion();
  if (retrievedAnsibleVersion) {
    await setToCache('ansible-version', retrievedAnsibleVersion);
  }
}

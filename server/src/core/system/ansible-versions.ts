import { getFromCache, setToCache } from '../../data/cache';
import Shell from '../../modules/shell';

export async function setAnsibleVersions() {
  await setAnsibleVersion();
  await setAnsibleRunnerVersion();
}

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

async function setAnsibleVersion() {
  const retrievedAnsibleVersion = await Shell.AnsibleShellCommandsManager.getAnsibleVersion();
  if (retrievedAnsibleVersion) {
    await setToCache('ansible-version', retrievedAnsibleVersion);
  }
}

export async function getAnsibleRunnerVersion() {
  const ansibleRunnerVersion = await getFromCache('ansible-runner-version');
  if (ansibleRunnerVersion) {
    return ansibleRunnerVersion;
  } else {
    const retrievedAnsibleRunnerVersion =
      await Shell.AnsibleShellCommandsManager.getAnsibleRunnerVersion();
    if (retrievedAnsibleRunnerVersion) {
      await setToCache('ansible-runner-version', retrievedAnsibleRunnerVersion);
    }
    return retrievedAnsibleRunnerVersion;
  }
}
async function setAnsibleRunnerVersion() {
  const retrievedRunnerAnsibleVersion =
    await Shell.AnsibleShellCommandsManager.getAnsibleRunnerVersion();
  if (retrievedRunnerAnsibleVersion) {
    await setToCache('ansible-runner-version', retrievedRunnerAnsibleVersion);
  }
}

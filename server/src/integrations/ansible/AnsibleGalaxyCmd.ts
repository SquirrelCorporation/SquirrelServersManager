class AnsibleGalaxyCommandBuilder {
  static readonly ansibleGalaxy = 'playbooks-galaxy';
  static readonly collection = 'collection';

  getInstallCollectionCmd(name: string, namespace: string) {
    return `${AnsibleGalaxyCommandBuilder.ansibleGalaxy} ${AnsibleGalaxyCommandBuilder.collection} install ${namespace}.${name}`;
  }

  getListCollectionsCmd(name: string, namespace: string) {
    return `${AnsibleGalaxyCommandBuilder.ansibleGalaxy} ${AnsibleGalaxyCommandBuilder.collection} list`;
  }
}

export default new AnsibleGalaxyCommandBuilder();

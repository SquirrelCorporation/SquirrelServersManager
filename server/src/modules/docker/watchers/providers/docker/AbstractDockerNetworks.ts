import Dockerode, { IPAM } from 'dockerode';
import ContainerNetwork from '../../../../../data/database/model/ContainerNetwork';
import ContainerNetworkRepo from '../../../../../data/database/repository/ContainerNetworkRepo';
import DeviceRepo from '../../../../../data/database/repository/DeviceRepo';
import DockerListener from './AbstractDockerListener';

export default class DockerNetworks extends DockerListener {
  dockerApi: Dockerode | undefined = undefined;

  public async watchNetworksFromCron() {
    this.childLogger.info(
      `watchNetworksFromCron - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );
    try {
      const device = await DeviceRepo.findOneByUuid(this.configuration.deviceUuid);
      if (!device) {
        throw new Error(
          `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
        );
      }
      const rawCurrentNetworks = await this.dockerApi?.listNetworks();
      const currentNetworks = rawCurrentNetworks?.map((rawCurrentNetwork) => {
        return {
          id: rawCurrentNetwork.Id,
          name: rawCurrentNetwork.Name,
          watcher: this.name,
          device: device,
          created: rawCurrentNetwork.Created,
          scope: rawCurrentNetwork.Scope,
          driver: rawCurrentNetwork.Driver,
          enableIPv6: rawCurrentNetwork.EnableIPv6,
          ipam: rawCurrentNetwork.IPAM as IPAM,
          internal: rawCurrentNetwork.Internal,
          attachable: rawCurrentNetwork.Attachable,
          ingress: rawCurrentNetwork.Ingress,
          configFrom: rawCurrentNetwork.ConfigFrom,
          configOnly: rawCurrentNetwork.ConfigOnly,
          containers: rawCurrentNetwork.Containers,
          options: rawCurrentNetwork.Options,
          labels: rawCurrentNetwork.Labels,
        } as ContainerNetwork;
      });
      const networksInDb = await ContainerNetworkRepo.findNetworksByWatcher(this.name);
      await this.insertNewNetworks(currentNetworks, networksInDb);
      this.deleteOldNetworks(currentNetworks, networksInDb);
    } catch (error: any) {
      this.childLogger.error(error);
    }
  }

  private async insertNewNetworks(
    currentNetworks: (ContainerNetwork | undefined)[] | undefined,
    networksInDb: ContainerNetwork[] | null,
  ) {
    const networksToInsert = currentNetworks?.filter((network) => {
      return networksInDb?.find((e) => e.id === network?.id) === undefined;
    });
    if (networksToInsert) {
      this.childLogger.info(
        `insertNewNetworks - got ${networksToInsert?.length} networks to insert (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
      );
      await Promise.all(
        networksToInsert.map(async (network) => {
          if (network) {
            void ContainerNetworkRepo.create(network);
          }
        }),
      );
    }
  }

  private deleteOldNetworks(
    newNetworks: (ContainerNetwork | undefined)[] | undefined,
    networksInDb: ContainerNetwork[] | null,
  ) {
    const networksToRemove = this.getOldNetworks(newNetworks, networksInDb);
    networksToRemove.forEach((networkToRemove) => {
      void ContainerNetworkRepo.deleteNetworkById(networkToRemove.id);
    });
  }

  private getOldNetworks(
    newNetworks: (ContainerNetwork | undefined)[] | undefined,
    networksInDb: ContainerNetwork[] | null,
  ) {
    if (!networksInDb || !newNetworks) {
      return [];
    }
    return networksInDb.filter((networkFromDb) => {
      const isStillToWatch = newNetworks.find((newNetwork) => newNetwork?.id === networkFromDb.id);
      return isStillToWatch === undefined;
    });
  }
}

import { Playbooks } from '../../../../types/typings';
import { IDeviceAuth } from '../../../devices';

export const INVENTORY_TRANSFORMER_SERVICE = 'INVENTORY_TRANSFORMER_SERVICE';

/**
 * Interface for the Inventory Transformer Service
 */
export interface IInventoryTransformerService {
  /**
   * Build Ansible inventory for multiple devices
   * @param devicesAuth Device authentication information
   * @param execUuid Execution UUID
   * @returns Ansible hosts inventory
   */
  inventoryBuilder(devicesAuth: IDeviceAuth[], execUuid: string): Promise<Playbooks.Hosts>;

  /**
   * Build Ansible inventory for specific target devices
   * @param devicesAuth Device authentication information
   * @param execUuid Execution UUID
   * @returns Ansible hosts inventory for specific targets
   */
  inventoryBuilderForTarget(
    devicesAuth: Partial<IDeviceAuth>[],
    execUuid: string
  ): Promise<Playbooks.All & Playbooks.HostGroups>;
}
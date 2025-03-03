import { ModuleRef } from '@nestjs/core';
import DeviceAuth from '../../../data/database/model/DeviceAuth';
import { Playbooks } from '../../../types/typings';
import { InventoryTransformerService } from '../services/inventory-transformer.service';

/**
 * This is a bridge class that provides a static interface to the InventoryTransformerService
 * for backward compatibility with existing code.
 */
class InventoryTransformer {
  private static inventoryTransformerService: InventoryTransformerService;
  private static moduleRef: ModuleRef;

  /**
   * Set the ModuleRef to allow access to the NestJS dependency injection container
   */
  static setModuleRef(moduleRef: ModuleRef): void {
    InventoryTransformer.moduleRef = moduleRef;
  }

  /**
   * Get the InventoryTransformerService instance
   */
  private static getService(): InventoryTransformerService {
    if (!InventoryTransformer.inventoryTransformerService) {
      if (!InventoryTransformer.moduleRef) {
        throw new Error('ModuleRef not set in InventoryTransformer');
      }
      InventoryTransformer.inventoryTransformerService = InventoryTransformer.moduleRef.get(
        InventoryTransformerService,
        { strict: false },
      );
    }
    return InventoryTransformer.inventoryTransformerService;
  }

  /**
   * Build Ansible inventory for multiple devices
   */
  static async inventoryBuilder(
    devicesAuth: DeviceAuth[],
    execUuid: string,
  ): Promise<Playbooks.Hosts> {
    return InventoryTransformer.getService().inventoryBuilder(devicesAuth, execUuid);
  }

  /**
   * Build Ansible inventory for specific target devices
   */
  static async inventoryBuilderForTarget(
    devicesAuth: Partial<DeviceAuth>[],
    execUuid: string,
  ): Promise<Playbooks.All & Playbooks.HostGroups> {
    return InventoryTransformer.getService().inventoryBuilderForTarget(devicesAuth, execUuid);
  }
}

export default InventoryTransformer;

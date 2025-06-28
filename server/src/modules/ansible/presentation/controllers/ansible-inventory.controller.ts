import { Body, Controller, Get, Inject, Logger, Query, ValidationPipe } from '@nestjs/common';
import { DEVICE_AUTH_SERVICE, IDeviceAuth, IDeviceAuthService } from '@modules/devices';
import { EntityNotFoundException } from '@infrastructure/exceptions/app-exceptions';
import { IInventoryTransformerService, INVENTORY_TRANSFORMER_SERVICE } from '@modules/ansible';
import {
  AnsibleInventoryControllerDocs,
  GetInventoryDoc,
} from '../decorators/ansible-inventory.decorator';
import { GetInventoryQueryDto } from '../dtos/get-inventory-query.dto';
import { GetInventoryBodyDto } from '../dtos/get-inventory-body.dto';

@AnsibleInventoryControllerDocs()
@Controller('ansible/inventory')
export class AnsibleInventoryController {
  private readonly logger = new Logger(AnsibleInventoryController.name);
  constructor(
    @Inject(DEVICE_AUTH_SERVICE) private readonly deviceAuthService: IDeviceAuthService,
    @Inject(INVENTORY_TRANSFORMER_SERVICE)
    private readonly inventoryTransformerService: IInventoryTransformerService,
  ) {}

  @Get()
  @GetInventoryDoc()
  async getInventory(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: GetInventoryQueryDto,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) body: GetInventoryBodyDto,
  ) {
    const { execUuid } = query;
    const { target } = body;
    let devicesAuth: IDeviceAuth[] | null = [];

    if (target) {
      this.logger.debug(`[CONTROLLER][ANSIBLE][Inventory] - Target is ${target}`);
      devicesAuth = await this.deviceAuthService.findDeviceAuthByDeviceUuid(target);
    } else {
      this.logger.debug(`[CONTROLLER][ANSIBLE][Inventory] - No target, get all`);
      devicesAuth = await this.deviceAuthService.findAllPop();
    }

    if (Array.isArray(devicesAuth) && devicesAuth.length > 0) {
      const inventory = await this.inventoryTransformerService.inventoryBuilder(
        devicesAuth,
        execUuid,
      );
      return inventory;
    } else {
      const message = target
        ? `No device auth found for target: ${target}`
        : 'No devices auth found';
      throw new EntityNotFoundException(message);
    }
  }
}

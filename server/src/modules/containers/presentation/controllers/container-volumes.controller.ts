import * as os from 'os';
import { parse } from 'url';
import { filterByFields, filterByQueryParams } from '@infrastructure/common/query/filter.util';
import { paginate } from '@infrastructure/common/query/pagination.util';
import { sortByFields } from '@infrastructure/common/query/sorter.util';
import { PaginatedResponseDto } from '@modules/containers/presentation/dtos/paginated-response.dto';
import { FileSystemService } from '@modules/shell';
import { IUser } from '@modules/users';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { SsmContainer } from 'ssm-shared-lib';
import {
  CONTAINER_VOLUMES_SERVICE,
  IContainerVolumesService,
} from '../../applicati../../domain/interfaces/container-volumes-service.interface';
import { CreateVolumeDto } from '../dtos/create-volume.dto';

@Controller('container-volumes')
export class ContainerVolumesController {
  constructor(
    @Inject(CONTAINER_VOLUMES_SERVICE)
    private readonly volumesService: IContainerVolumesService,
    private readonly fileSystemService: FileSystemService,
  ) {}

  /**
   * Get all volumes with pagination, sorting, and filtering
   */
  @Get()
  async getVolumes(@Req() req) {
    const realUrl = req.url;
    const { current, pageSize } = req.query;
    const params = parse(realUrl, true).query as any;

    const volumes = await this.volumesService.getAllVolumes();

    // Apply sorting, filtering, and pagination
    let dataSource = sortByFields(volumes, params);
    dataSource = filterByFields(dataSource, params);
    dataSource = filterByQueryParams(
      dataSource.map((e) => ({ ...e, deviceUuid: e.deviceUuid })),
      params,
      ['name', 'scope', 'driver', 'deviceUuid'],
    );

    const totalBeforePaginate = dataSource?.length || 0;
    if (current && pageSize) {
      dataSource = paginate(dataSource, current as number, pageSize as number);
    }

    return new PaginatedResponseDto(dataSource, {
      total: totalBeforePaginate,
      pageSize,
      current: parseInt(`${current}`, 10) || 1,
    });
  }

  @Post()
  async createVolume(@Body() createVolumeDto: CreateVolumeDto, @Req() req) {
    return this.volumesService.createVolumeWithPlaybook(createVolumeDto, req.user as IUser);
  }

  @Get('device/:deviceUuid')
  async getVolumesByDevice(@Param('deviceUuid') deviceUuid: string) {
    return this.volumesService.getVolumesByDeviceUuid(deviceUuid);
  }

  @Get(':uuid')
  async getVolumeByUuid(@Param('uuid') uuid: string) {
    return this.volumesService.getVolumeByUuid(uuid);
  }

  @Delete(':uuid')
  async deleteVolume(@Param('uuid') uuid: string) {
    const success = await this.volumesService.deleteVolume(uuid);
    return { success };
  }

  /**
   * Backup a volume
   */
  @Post('backup/:uuid')
  async postBackupVolume(@Param('uuid') uuid: string, @Body() body: { mode: string }) {
    const { mode } = body;

    const volume = await this.volumesService.getVolumeByUuid(uuid);
    if (!volume) {
      throw new HttpException('Volume not found', HttpStatus.NOT_FOUND);
    }

    const { filePath, fileName } = await this.volumesService.backupVolume(
      volume,
      mode as SsmContainer.VolumeBackupMode,
      true,
    );

    return {
      filePath: `${filePath}${fileName}`,
      fileName,
      mode,
    };
  }

  /**
   * Download a volume backup
   */
  @Get('backup')
  async getBackupVolume(@Query('fileName') fileName: string, @Res() res) {
    const filePath = os.tmpdir() + '/';

    if (!this.fileSystemService.test('-f', `${filePath}${fileName}`)) {
      throw new HttpException(`File not found ${filePath}${fileName}`, HttpStatus.NOT_FOUND);
    }

    return res.download(`${filePath}${fileName}`);
  }
}

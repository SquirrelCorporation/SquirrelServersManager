import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Inject,
  Query,
  Req,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { parse } from 'url';
import * as os from 'os';
import { JwtAuthGuard } from '../../../auth/strategies/jwt-auth.guard';
import { ContainerVolumesServiceInterface, CONTAINER_VOLUMES_SERVICE } from '../../application/interfaces/container-volumes-service.interface';
import { CreateVolumeDto } from '../dtos/create-volume.dto';
import { filterByFields, filterByQueryParams } from '../../../../helpers/query/FilterHelper';
import { paginate } from '../../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../../helpers/query/SorterHelper';
import { FileSystemService } from '../../../../shell/services/file-system.service';

@Controller('volumes')
@UseGuards(JwtAuthGuard)
export class ContainerVolumesController {
  constructor(
    @Inject(CONTAINER_VOLUMES_SERVICE)
    private readonly volumesService: ContainerVolumesServiceInterface,
    private readonly fileSystemService: FileSystemService,
  ) {}

  /**
   * Get all volumes with pagination, sorting, and filtering
   */
  @Get()
  async getVolumes(@Req() req, @Res() res) {
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

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Got volumes',
      data: dataSource,
      meta: {
        total: totalBeforePaginate,
        success: true,
        pageSize,
        current: parseInt(`${params.current}`, 10) || 1,
      },
    });
  }

  @Get('device/:deviceUuid')
  async getVolumesByDevice(@Param('deviceUuid') deviceUuid: string) {
    return this.volumesService.getVolumesByDeviceUuid(deviceUuid);
  }

  @Get(':uuid')
  async getVolumeByUuid(@Param('uuid') uuid: string) {
    return this.volumesService.getVolumeByUuid(uuid);
  }

  @Post('device/:deviceUuid')
  async createVolume(
    @Param('deviceUuid') deviceUuid: string,
    @Body() createVolumeDto: CreateVolumeDto,
  ) {
    return this.volumesService.createVolume(deviceUuid, createVolumeDto);
  }

  @Patch(':uuid')
  async updateVolume(
    @Param('uuid') uuid: string,
    @Body() updateVolumeDto: Partial<CreateVolumeDto>,
  ) {
    return this.volumesService.updateVolume(uuid, updateVolumeDto);
  }

  @Delete(':uuid')
  async deleteVolume(@Param('uuid') uuid: string) {
    const success = await this.volumesService.deleteVolume(uuid);
    return { success };
  }

  @Post('prune/device/:deviceUuid')
  async pruneVolumes(@Param('deviceUuid') deviceUuid: string) {
    return this.volumesService.pruneVolumes(deviceUuid);
  }
  
  /**
   * Backup a volume
   */
  @Post('backup/:uuid')
  async postBackupVolume(
    @Param('uuid') uuid: string,
    @Body() body: { mode: string },
    @Res() res,
  ) {
    const { mode } = body;

    const volume = await this.volumesService.getVolumeByUuid(uuid);
    if (!volume) {
      throw new HttpException('Volume not found', HttpStatus.NOT_FOUND);
    }

    const { filePath, fileName } = await this.volumesService.backupVolume(volume, mode);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Volume backed up',
      data: {
        filePath: `${filePath}${fileName}`,
        fileName,
        mode,
      },
    });
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
import { parse } from 'url';
import * as os from 'os';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { API, SsmContainer } from 'ssm-shared-lib';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { ContainerVolumesService } from '../services/container-volumes.service';
import { ContainerVolumeRepository } from '../repositories/container-volume.repository';
import { PlaybookRepository } from '../../playbooks/repositories/playbook.repository';
import { PlaybookService } from '../../playbooks/services/playbook.service';
import { FileSystemService } from '../../shell/services/file-system.service';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';

@Controller('volumes')
@UseGuards(JwtAuthGuard)
export class VolumesController {
  constructor(
    private readonly containerVolumesService: ContainerVolumesService,
    private readonly containerVolumeRepository: ContainerVolumeRepository,
    private readonly playbookRepository: PlaybookRepository,
    private readonly playbookService: PlaybookService,
    private readonly fileSystemService: FileSystemService,
  ) {}

  /**
   * Get all volumes with pagination, sorting, and filtering
   */
  @Get()
  async getVolumes(@Req() req, @Res() res) {
    const realUrl = req.url;
    const { current, pageSize } = req.query;
    const params = parse(realUrl, true).query as unknown as API.PageParams &
      API.ContainerVolume & {
        sorter: any;
        filter: any;
      };

    const volumes = await this.containerVolumeRepository.findAll();

    // Apply sorting, filtering, and pagination
    let dataSource = sortByFields(volumes, params);
    dataSource = filterByFields(dataSource, params);
    dataSource = filterByQueryParams(
      dataSource.map((e) => ({ ...e, deviceUuid: e.device?.uuid })),
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

  /**
   * Create a new volume
   */
  @Post()
  async postVolume(@Req() req, @Res() res) {
    const { config, target }: API.CreateNetwork = req.body;

    const playbook = await this.playbookRepository.findOneByUniqueQuickReference('createDockerVolume');
    if (!playbook) {
      throw new HttpException('Playbook \'createDockerVolume\' not found', HttpStatus.NOT_FOUND);
    }

    if (!req.user) {
      throw new HttpException('No user', HttpStatus.NOT_FOUND);
    }

    const createVolumeConfig: API.ExtraVars = [];
    Object.keys(config).forEach((key) => {
      let value = config[key];
      if (value) {
        if (typeof value !== 'string') {
          // If value is an object (including arrays), stringify it
          value = JSON.stringify(value);
        }
        createVolumeConfig.push({ extraVar: key, value: value });
      }
    });

    try {
      const execId = await this.playbookService.executePlaybook(
        playbook,
        req.user,
        [target],
        createVolumeConfig,
      );

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Execution in progress',
        data: { execId: execId } as API.ExecId,
      });
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Backup a volume
   */
  @Post('backup/:uuid')
  async postBackupVolume(
    @Param('uuid') uuid: string,
    @Body() body: { mode: SsmContainer.VolumeBackupMode },
    @Res() res,
  ) {
    const { mode } = body;

    const volume = await this.containerVolumeRepository.findByUuid(uuid);
    if (!volume) {
      throw new HttpException('Volume not found', HttpStatus.NOT_FOUND);
    }

    const { filePath, fileName } = await this.containerVolumesService.backupVolume(volume, mode);

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

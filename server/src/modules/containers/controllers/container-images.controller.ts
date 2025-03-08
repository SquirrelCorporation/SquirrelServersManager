import { parse } from 'url';
import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import { ContainerImageRepository } from '../repositories/container-image.repository';

@Controller('images')
@UseGuards(JwtAuthGuard)
export class ContainerImagesController {
  constructor(private readonly containerImageRepository: ContainerImageRepository) {}

  /**
   * Get all container images with pagination, sorting, and filtering
   */
  @Get()
  async getImages(@Req() req, @Res() res) {
    const realUrl = req.url;
    const { current, pageSize } = req.query;
    const params = parse(realUrl, true).query as unknown as API.PageParams &
      API.ContainerVolume & {
        sorter: any;
        filter: any;
      };

    // Since we don't have a dedicated ContainerImageRepository, we'll use the ContainerRepository
    // to get images from containers
    const images = await this.containerImageRepository.findAll();


    // Apply sorting, filtering, and pagination
    let dataSource = sortByFields(images, params);
    dataSource = filterByFields(dataSource, params);
    dataSource = filterByQueryParams(
      dataSource.map((e) => ({ ...e, deviceUuid: e.device?.uuid })),
      params,
      ['id', 'parentId', 'deviceUuid'],
    );

    const totalBeforePaginate = dataSource?.length || 0;
    if (current && pageSize) {
      dataSource = paginate(dataSource, current as number, pageSize as number);
    }

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Got Images',
      data: dataSource,
      meta: {
        total: totalBeforePaginate,
        success: true,
        pageSize,
        current: parseInt(`${params.current}`, 10) || 1,
      },
    });
  }
}

import { parse } from 'url';
import { Controller, Get, Inject, Logger, Req, UseGuards } from '@nestjs/common';
import { PaginatedResponseDto } from '@modules/containers/presentation/dtos/paginated-response.dto';
import { JwtAuthGuard } from '../../../auth/strategies/jwt-auth.guard';
import {
  CONTAINER_IMAGES_SERVICE,
  IContainerImagesService,
} from '../../application/interfaces/container-images-service.interface';
import { filterByFields, filterByQueryParams } from '@infrastructure/common/query/filter.util';
import { paginate } from '@infrastructure/common/query/pagination.util';
import { sortByFields } from '@infrastructure/common/query/sorter.util';

@Controller('container-images')
@UseGuards(JwtAuthGuard)
export class ContainerImagesController {
  private readonly logger = new Logger(ContainerImagesController.name);

  constructor(
    @Inject(CONTAINER_IMAGES_SERVICE)
    private readonly imagesService: IContainerImagesService,
  ) {}

  /**
   * Get all container images with pagination, sorting, and filtering
   */
  @Get()
  async getImages(@Req() req) {
    const realUrl = req.url;
    const { current, pageSize } = req.query;
    const params = parse(realUrl, true).query as any;

    // Get images
    const images = await this.imagesService.getAllImages();
    this.logger.log(`Found ${images.length} images`);
    // Apply sorting, filtering, and pagination
    let dataSource = sortByFields(images, params);
    dataSource = filterByFields(dataSource, params);
    dataSource = filterByQueryParams(
      dataSource.map((e) => ({ ...e, deviceUuid: e.deviceUuid })),
      params,
      ['id', 'parentId', 'deviceUuid'],
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
}

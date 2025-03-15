import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { parse } from 'url';
import { JwtAuthGuard } from '../../../auth/strategies/jwt-auth.guard';
import { ContainerImagesServiceInterface, CONTAINER_IMAGES_SERVICE } from '../../application/interfaces/container-images-service.interface';
import { filterByFields, filterByQueryParams } from '../../../../helpers/query/FilterHelper';
import { paginate } from '../../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../../helpers/query/SorterHelper';

@Controller('images')
@UseGuards(JwtAuthGuard)
export class ContainerImagesController {
  constructor(
    @Inject(CONTAINER_IMAGES_SERVICE)
    private readonly imagesService: ContainerImagesServiceInterface,
  ) {}

  /**
   * Get all container images with pagination, sorting, and filtering
   */
  @Get()
  async getImages(@Req() req, @Res() res) {
    const realUrl = req.url;
    const { current, pageSize } = req.query;
    const params = parse(realUrl, true).query as any;

    // Get images
    const images = await this.imagesService.getAllImages();

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
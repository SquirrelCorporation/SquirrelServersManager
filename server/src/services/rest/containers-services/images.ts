import { parse } from 'url';
import { ContainerImage } from 'ssm-shared-lib/distribution/types/api';
import { API } from 'ssm-shared-lib';
import ContainerImageRepo from '../../../data/database/repository/ContainerImageRepo';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import asyncHandler from '../../../middlewares/AsyncHandler';

export const getImages = asyncHandler(async (req, res) => {
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.ContainerVolume & {
      sorter: any;
      filter: any;
    };
  const networks = (await ContainerImageRepo.findAll()) as unknown as API.ContainerImage[];
  // Use the separated services
  let dataSource = sortByFields(networks, params);
  dataSource = filterByFields(dataSource, params);
  dataSource = filterByQueryParams(
    dataSource.map((e) => ({ ...e, deviceUuid: e.device?.uuid })),
    params,
    ['id', 'parentId', 'deviceUuid'],
  );
  const totalBeforePaginate = dataSource?.length || 0;
  dataSource = paginate(dataSource, current as number, pageSize as number);

  new SuccessResponse('Got Images', dataSource, {
    total: totalBeforePaginate,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
});

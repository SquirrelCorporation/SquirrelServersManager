import { parse } from 'url';
import { API } from 'ssm-shared-lib';
import PlaybookRepo from '../../data/database/repository/PlaybookRepo';
import DockerComposeHelper from '../../helpers/docker/DockerComposeHelper';
import { filterByFields, filterByQueryParams } from '../../helpers/query/FilterHelper';
import { paginate } from '../../helpers/query/PaginationHelper';
import { sortByFields } from '../../helpers/query/SorterHelper';
import { InternalError, NotFoundError } from '../../middlewares/api/ApiError';
import { SuccessResponse } from '../../middlewares/api/ApiResponse';
import asyncHandler from '../../middlewares/AsyncHandler';
import templatesRaw from '../../data/static/templates.json';
import PlaybookUseCases from '../../use-cases/PlaybookUseCases';

export const getTemplates = asyncHandler(async (req, res) => {
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.Template & {
      sorter: any;
      filter: any;
    };
  const templates = templatesRaw.templates;

  // Use the separated services
  let dataSource = sortByFields(templates, params);
  dataSource = filterByFields(dataSource, params);
  dataSource = filterByQueryParams(dataSource, params, ['description', 'title', 'categories']);
  const totalBeforePaginate = dataSource?.length || 0;
  // Add pagination
  dataSource = paginate(dataSource, current as number, pageSize as number);
  dataSource = dataSource.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  new SuccessResponse('Get Templates', dataSource, {
    total: totalBeforePaginate,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
});

export const deploy = asyncHandler(async (req, res) => {
  const { template }: { template: API.Template & API.Targets } = req.body;
  const templateToYaml = DockerComposeHelper.fromJsonTemplateToYml(template);
  const playbook = await PlaybookRepo.findOneByUniqueQuickReference('deploy');
  if (!playbook) {
    throw new NotFoundError(`Playbook 'deploy' not found`);
  }
  if (!req.user) {
    throw new NotFoundError('No user');
  }
  try {
    const execId = await PlaybookUseCases.executePlaybook(playbook, req.user, template.targets, [
      { extraVar: 'definition', value: templateToYaml },
      { extraVar: 'project', value: template.name },
    ] as API.ExtraVars);
    new SuccessResponse('Execution succeeded', { execId: execId } as API.ExecId).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

import { parse } from 'url';
import { API } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import ContainerCustomStackRepo from '../../../data/database/repository/ContainerCustomStackRepo';
import PlaybookRepo from '../../../data/database/repository/PlaybookRepo';
import { transformToDockerCompose } from '../../../helpers/docker/DockerComposeJSONTransformer';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import logger from '../../../logger';
import { BadRequestError, InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import asyncHandler from '../../../middlewares/AsyncHandler';
import DockerComposeCommandManager from '../../../modules/shell/managers/DockerComposeCommandManager';
import FileSystemManager from '../../../modules/shell/managers/FileSystemManager';
import PlaybookUseCases from '../../../services/PlaybookUseCases';

export const getCustomStacks = asyncHandler(async (req, res) => {
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.ContainerCustomStack & {
      sorter: any;
      filter: any;
    };
  const customStacks =
    (await ContainerCustomStackRepo.findAll()) as unknown as API.ContainerCustomStack[];
  // Use the separated services
  let dataSource = sortByFields(customStacks, params);
  dataSource = filterByFields(dataSource, params);
  dataSource = filterByQueryParams(dataSource, params, ['uuid', 'name']);
  const totalBeforePaginate = dataSource?.length || 0;
  dataSource = paginate(dataSource, current as number, pageSize as number);

  new SuccessResponse('Got Custom Stacks', dataSource, {
    total: totalBeforePaginate,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
});

export const postTransformCustomStack = asyncHandler(async (req, res) => {
  const { content } = req.body;
  try {
    const json = JSON.parse(content);
    const yaml = transformToDockerCompose(json);
    new SuccessResponse('Post Transform Custom Stack', { yaml: yaml }).send(res);
  } catch (error) {
    logger.error(error);
    throw new BadRequestError('Invalid JSON');
  }
});

export const postCustomStack = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { json, rawStackValue, yaml, lockJson, icon, iconColor, iconBackgroundColor } = req.body;
  const customStack = await ContainerCustomStackRepo.findByName(name);
  if (customStack) {
    throw new BadRequestError(`Custom Stack with name ${name} already exists`);
  }

  if (json) {
    const transformedYaml = transformToDockerCompose(json);

    const stack = await ContainerCustomStackRepo.updateOrCreate({
      uuid: uuidv4(),
      name,
      json,
      yaml: transformedYaml,
      rawStackValue,
      lockJson,
      icon,
      iconColor,
      iconBackgroundColor,
    });
    new SuccessResponse('Post Custom Stack', stack).send(res);
  } else {
    const stack = await ContainerCustomStackRepo.updateOrCreate({
      uuid: uuidv4(),
      name,
      yaml,
      lockJson,
      icon,
      iconColor,
      iconBackgroundColor,
    });
    new SuccessResponse('Post Custom Stack', stack).send(res);
  }
});

export const patchCustomStack = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const { json, yaml, rawStackValue, lockJson, icon, iconColor, iconBackgroundColor } = req.body;
  const customStack = await ContainerCustomStackRepo.findByUuid(uuid);
  if (!customStack) {
    throw new NotFoundError(`Custom Stack with uuid ${uuid} not found`);
  }

  if (json) {
    const transformedYaml = transformToDockerCompose(json);
    const stack = await ContainerCustomStackRepo.updateOrCreate({
      ...customStack,
      json,
      yaml: transformedYaml,
      rawStackValue,
      lockJson,
      icon,
      iconColor,
      iconBackgroundColor,
    });
    return new SuccessResponse('Put Custom Stack', stack).send(res);
  } else {
    const stack = await ContainerCustomStackRepo.updateOrCreate({
      ...customStack,
      json,
      yaml,
      rawStackValue,
      lockJson,
      icon,
      iconColor,
      iconBackgroundColor,
    });
    new SuccessResponse('Put Custom Stack', stack).send(res);
  }
});

export const deleteCustomStack = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const customStack = await ContainerCustomStackRepo.findByUuid(uuid);
  if (!customStack) {
    throw new NotFoundError(`Custom Stack with uuid ${uuid} not found`);
  }

  await ContainerCustomStackRepo.deleteOne(customStack.uuid as string);
  new SuccessResponse('Deleted Custom Stack').send(res);
});

export const postCustomStackDryRun = asyncHandler(async (req, res) => {
  const { json, yaml } = req.body;
  const path = `/tmp/${uuidv4()}`;
  const fullFilePath = `${path}/docker-compose.yml`;
  FileSystemManager.createDirectory(path);

  if (json) {
    const transformedYaml = transformToDockerCompose(json);
    FileSystemManager.writeFile(transformedYaml, fullFilePath);
  } else {
    FileSystemManager.writeFile(yaml, fullFilePath);
  }
  const result = DockerComposeCommandManager.dockerComposeDryRun(
    `docker-compose -f ${fullFilePath} config`,
  );
  if (result.code !== 0) {
    new SuccessResponse('Post Dry Run Stack', { validating: false, message: result.stderr }).send(
      res,
    );
  } else {
    new SuccessResponse('Post Dry Run Stack', { validating: true }).send(res);
  }
});

export const postDeployCustomStack = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const { target } = req.body;

  const playbook = await PlaybookRepo.findOneByUniqueQuickReference('deploy');
  if (!playbook) {
    throw new NotFoundError(`Playbook 'deploy' not found`);
  }
  if (!req.user) {
    throw new NotFoundError('No user');
  }
  const customStack = await ContainerCustomStackRepo.findByUuid(uuid);
  if (!customStack) {
    throw new NotFoundError(`Stack not found`);
  }
  try {
    const execId = await PlaybookUseCases.executePlaybook(playbook, req.user, [target], [
      { extraVar: 'definition', value: customStack.yaml },
      { extraVar: 'project', value: customStack.name },
    ] as API.ExtraVars);
    new SuccessResponse('Execution in progress', { execId: execId } as API.ExecId).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

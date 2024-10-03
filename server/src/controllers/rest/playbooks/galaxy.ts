import { parse } from 'url';
import axios from 'axios';
import { API } from 'ssm-shared-lib';
import { InternalError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import Shell from '../../../modules/shell';

export const getAnsibleGalaxyCollections = async (req, res) => {
  const realUrl = req.url;
  const { current = 1, pageSize = 9 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams & {
    sorter: any;
    filter: any;
  } & {
    content?: string;
    namespace?: string;
  };
  const offset = ((current as number) - 1) * (pageSize as number);
  const response = await axios.get(
    `https://galaxy.ansible.com/api/v3/plugin/ansible/search/collection-versions/?${params.namespace ? 'namespace=' + encodeURIComponent(params.namespace) + '&' : ''}${params.content ? 'keywords=' + encodeURIComponent(params.content) + '&' : ''}is_deprecated=false&repository_label=!hide_from_search&is_highest=true&offset=${offset}&limit=${pageSize}&order_by=name`,
  );
  new SuccessResponse('Get Ansible Galaxy Collections successful', response.data?.data || [], {
    total: response.data?.meta?.count,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
};

export const getAnsibleGalaxyCollection = async (req, res) => {
  const realUrl = req.url;
  const params = parse(realUrl, true).query as unknown as API.PageParams & {
    sorter: any;
    filter: any;
  } & {
    name: string;
    namespace: string;
    version: string;
  };
  const response = await axios.get(
    `https://galaxy.ansible.com/api/pulp/api/v3/content/ansible/collection_versions/?namespace=${encodeURIComponent(params.namespace)}&name=${encodeURIComponent(params.name)}&version=${encodeURIComponent(params.version)}&offset=0&limit=10`,
  );
  new SuccessResponse(
    'Get Ansible Galaxy Collection successful',
    response.data?.results ? response.data.results[0] : undefined,
  ).send(res);
};

export const postInstallAnsibleGalaxyCollection = async (req, res) => {
  const { name, namespace } = req.body;
  try {
    await Shell.AnsibleShellCommandsManager.installAnsibleGalaxyCollection(name, namespace);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
  new SuccessResponse('Install Ansible Galaxy Collection successful').send(res);
};

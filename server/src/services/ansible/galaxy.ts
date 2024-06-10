import axios from 'axios';
import { SuccessResponse } from '../../core/api/ApiResponse';
import asyncHandler from '../../helpers/AsyncHandler';

export const getAnsibleGalaxyCollections = asyncHandler(async (req, res) => {
  const { offset, limit } = req.query;
  const response = await axios.get(
    `https://galaxy.ansible.com/api/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&offset=${offset}&limit=${limit}&order_by=name`,
  );
  new SuccessResponse('Get Ansible Galaxy Collections sucessfull', response.data).send(res);
});

export const getAnsibleGalaxyCollection = asyncHandler(async (req, res) => {});

import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import {
  deleteAnsibleConfiguration,
  readAnsibleConfiguration,
  updateAnsibleConfiguration,
  writeAnsibleConfiguration,
} from '../../../services/AnsibleConfigurationUseCases';

export const getConf = async (req, res) => {
  new SuccessResponse('Got Ansible Configuration', readAnsibleConfiguration()).send(res);
};

export const postConf = async (req, res) => {
  const { section, key, value, description, deactivated } = req.body;
  writeAnsibleConfiguration(section, key, value, deactivated, description);
  new SuccessResponse('Wrote Ansible Configuration').send(res);
};

export const deleteConf = async (req, res) => {
  const { section, key } = req.body;
  deleteAnsibleConfiguration(section, key);
  new SuccessResponse('Deleted Ansible Configuration').send(res);
};

export const putConf = async (req, res) => {
  const { section, key, value, deactivated, description } = req.body;
  updateAnsibleConfiguration(section, key, value, deactivated, description);
  new SuccessResponse('Updated Ansible Configuration').send(res);
};

import { readConfig, writeConfig } from '../helpers/ansible/ConfigurationHelper';
import PinoLogger from '../logger';
import { InternalError, NotFoundError } from '../middlewares/api/ApiError';

const logger = PinoLogger.child(
  { module: 'AnsibleConfigurationUseCases' },
  { msgPrefix: '[ANSIBLE_CONFIGURATION] - ' },
);

export const readAnsibleConfiguration = () => {
  return readConfig();
};

export const writeAnsibleConfiguration = (
  section: string,
  key: string,
  value: string,
  deactivated: boolean,
  description: string,
) => {
  try {
    const config = readConfig();

    if (!config[section]) {
      config[section] = {};
    }
    config[section][key] = { value, deactivated, description };
    writeConfig(config);
  } catch (error: any) {
    logger.error(error);
    throw new InternalError('Error updating the configuration file');
  }
};

export const deleteAnsibleConfiguration = (section: string, key: string) => {
  const config = readConfig();

  if (config[section] && config[section][key] !== undefined) {
    try {
      delete config[section][key];

      // Remove the section if it's empty
      if (Object.keys(config[section]).length === 0) {
        delete config[section];
      }

      writeConfig(config);
    } catch (error) {
      logger.error(error);
      throw new InternalError('Error deleting from the configuration file');
    }
  } else {
    throw new NotFoundError('Section or key not found');
  }
};

export const updateAnsibleConfiguration = (
  section: string,
  key: string,
  value: string,
  deactivated: boolean,
  description: string,
) => {
  const config = readConfig();

  try {
    // Ensure section exists even if it's empty
    if (!config[section]) {
      config[section] = {};
    }

    config[section][key] = { value, deactivated, description };

    // Assign an empty object to the section if it has no keys left
    if (Object.keys(config[section]).length === 0) {
      config[section] = {};
    }

    writeConfig(config);
  } catch (error: any) {
    logger.error(error);
    throw new InternalError('Error updating from the configuration file');
  }
};

import yaml from 'js-yaml';
import logger from '../../logger';

export function extractTopLevelName(content: string): string | undefined {
  try {
    const parsedYaml = yaml.load(content);
    if (typeof parsedYaml === 'object' && parsedYaml !== null) {
      return (parsedYaml as { [key: string]: any }).name;
    }
  } catch (err: any) {
    logger.error('Error parsing YAML:' + err.message);
  }
  return undefined;
}

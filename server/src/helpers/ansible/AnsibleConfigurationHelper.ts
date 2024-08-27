import fs from 'fs';
import FileSystemManager from '../../modules/shell/managers/FileSystemManager';

export const ANSIBLE_CONFIG_FILE = '/ansible-config/ansible.cfg';

interface ConfigEntry {
  value: string;
  deactivated: boolean;
  description?: string;
}

interface Config {
  [section: string]: {
    [key: string]: ConfigEntry;
  };
}

export const copyAnsibleCfgFileIfDoesntExist = () => {
  if (!FileSystemManager.test('-f', ANSIBLE_CONFIG_FILE)) {
    FileSystemManager.copyFile('/server/src/ansible/default-ansible.cfg', ANSIBLE_CONFIG_FILE);
  }
};

// Utility function to read the configuration file
export const readConfig = (): Config => {
  const configContent = fs.readFileSync(ANSIBLE_CONFIG_FILE, 'utf-8');
  const lines = configContent.split('\n');
  const config: Config = {};
  let currentSection: string | null = null;
  let currentDescription: string[] = [];

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
      currentSection = trimmedLine.slice(1, -1);
      config[currentSection] = config[currentSection] || {};
      currentDescription = [];
    } else if (currentSection) {
      if (trimmedLine.startsWith('# ')) {
        currentDescription.push(trimmedLine.slice(2).trim());
      } else if (trimmedLine.startsWith(';')) {
        const [keyPart, ...valueParts] = trimmedLine.slice(1).split('=');
        const key = keyPart.trim();
        const value = valueParts.join('=').trim();
        config[currentSection][key] = {
          value,
          deactivated: true,
          description: currentDescription.join('\n'),
        };
        currentDescription = [];
      } else if (trimmedLine && trimmedLine.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const fullKey = key.trim();
        const fullValue = valueParts.join('=').trim();
        config[currentSection][fullKey] = {
          value: fullValue,
          deactivated: false,
          description: currentDescription.join('\n'),
        };
        currentDescription = [];
      }
    }
  });

  return config;
};

// Utility function to write the complete configuration object back to the file
export const writeConfig = (config: Config) => {
  const newLines: string[] = [];
  Object.entries(config).forEach(([section, keys]) => {
    newLines.push(`[${section}]`);
    Object.entries(keys).forEach(([key, entry]) => {
      if (entry.description) {
        newLines.push(...entry.description.split('\n').map((desc) => `# ${desc}`));
      }
      newLines.push(`${entry.deactivated ? ';' : ''}${key}=${entry.value}`);
    });
    newLines.push(''); // Add a blank line after each section for readability
  });

  fs.writeFileSync(ANSIBLE_CONFIG_FILE, newLines.join('\n'), 'utf-8');
};

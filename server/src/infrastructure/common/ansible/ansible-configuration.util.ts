import fs from 'fs';

const CONFIG_FILE = '/data/config/ansible.cfg';

interface ConfigItem {
  value: string;
  deactivated: boolean;
  description: string;
}

interface ConfigSection {
  [key: string]: ConfigItem;
}

interface Config {
  [section: string]: ConfigSection;
}

export function readConfig(): Config {
  try {
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return parseConfig(content);
  } catch (error) {
    return {};
  }
}

export function writeConfig(config: Config): void {
  const content = generateConfigContent(config);
  try {
    fs.writeFileSync(CONFIG_FILE, content, 'utf-8');
  } catch (error) {
    // During tests, the directory might not exist
    // In production, this would be handled differently
    console.warn(`Could not write to ${CONFIG_FILE}:`, error);
  }
}

function parseConfig(content: string): Config {
  if (!content.trim()) {
    return {};
  }

  const config: Config = {};
  let currentSection = '';
  let currentDescription = '';

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      continue;
    }

    // Check if it's a section header
    const sectionMatch = trimmedLine.match(/^\[(.*?)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      if (!config[currentSection]) {
        config[currentSection] = {};
      }
      continue;
    }

    // Check if it's a comment that might be a description
    if (trimmedLine.startsWith('#')) {
      currentDescription = trimmedLine.substring(1).trim();
      continue;
    }

    // Check if it's a key-value pair
    let keyValueMatch;
    let deactivated = false;

    if (trimmedLine.startsWith(';')) {
      // Deactivated key
      keyValueMatch = trimmedLine.substring(1).match(/^(.*?)=(.*?)$/);
      deactivated = true;
    } else {
      keyValueMatch = trimmedLine.match(/^(.*?)=(.*?)$/);
    }

    if (keyValueMatch && currentSection) {
      const key = keyValueMatch[1].trim();
      const value = keyValueMatch[2].trim();

      config[currentSection][key] = {
        value,
        deactivated,
        description: currentDescription,
      };

      // Reset description after using it
      currentDescription = '';
    }
  }

  return config;
}

function generateConfigContent(config: Config): string {
  if (Object.keys(config).length === 0) {
    return '';
  }

  let content = '';

  for (const section of Object.keys(config)) {
    content += `[${section}]\n`;

    for (const key of Object.keys(config[section])) {
      const { value, deactivated, description } = config[section][key];

      if (description) {
        content += `# ${description}\n`;
      }

      if (deactivated) {
        content += `;${key}=${value}\n`;
      } else {
        content += `${key}=${value}\n`;
      }
    }

    content += '\n';
  }

  return content;
}

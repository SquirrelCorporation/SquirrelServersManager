import * as fs from 'fs';
import * as path from 'path';

type SearchPattern = string | RegExp;

export type FileInfo = {
  fullPath: string;
  name: string;
};

export function getMatchingFiles(dir: string, patterns: SearchPattern[]): FileInfo[] {
  const results: FileInfo[] = [];

  function searchDirectory(directory: string) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isFile()) {
        if (
          patterns.some(
            (pattern) =>
              (typeof pattern === 'string' && entry.name.includes(pattern)) ||
              (pattern instanceof RegExp && pattern.test(entry.name)),
          )
        ) {
          results.push({
            fullPath,
            name: entry.name,
          });
        }
      } else if (entry.isDirectory()) {
        searchDirectory(fullPath);
      }
    }
  }

  searchDirectory(dir);
  return results;
}

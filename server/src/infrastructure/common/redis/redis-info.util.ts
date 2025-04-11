// Helper to parse Redis INFO output into an object
export function parseRedisInfo(info: string) {
  return info
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .reduce(
      (acc, line) => {
        const [key, value] = line.split(':');
        if (key && value) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      },
      {} as Record<string, string>,
    );
}

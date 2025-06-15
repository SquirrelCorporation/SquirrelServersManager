import logger from '../../../logger';

export function sortByFields<T>(data: T[], params: any) {
  let sorter: Record<keyof T, string> | null = null;
  try {
    sorter = params.sorter ? JSON.parse(params.sorter) : null;
  } catch (error) {
    logger.error('Could not parse sorter parameter');
    return data;
  }

  if (sorter) {
    return data.sort((prev, next) => {
      let sortNumber = 0;
      (Object.keys(sorter) as Array<keyof T>).forEach((key) => {
        if (typeof prev[key] === 'string' && typeof next[key] === 'string') {
          const nextSort = next[key] as string;
          const preSort = prev[key] as string;
          if (sorter[key] === 'descend') {
            if (preSort.localeCompare(nextSort) > 0) {
              sortNumber += -1;
            } else {
              sortNumber += 1;
            }
            return;
          }
          if (preSort.localeCompare(nextSort) > 0) {
            sortNumber += 1;
          } else {
            sortNumber += -1;
          }
        }
      });
      return sortNumber;
    });
  }
  return data;
}

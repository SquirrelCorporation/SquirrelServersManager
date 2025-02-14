// Filtering logic
import logger from '../../logger';

export function filterByFields<T>(data: T[], params: any): T[] {
  if (params.filter) {
    const filter = JSON.parse(params.filter as any) as {
      [key: string]: string[];
    };
    if (Object.keys(filter).length > 0) {
      return data.filter((item) => {
        return (Object.keys(filter) as Array<keyof T>).some((key) => {
          if (!filter[key as string]) {
            return true;
          }
          return filter[key as string].includes(`${item[key]}`);
        });
      });
    }
  }
  return data;
}

export function filterByQueryParams<T>(
  data: T[],
  params: any,
  authorizedQueryParams: string[],
): T[] {
  if (!data?.length) {
    return data;
  }

  const queryParams = Object.keys(params)
    .filter((key) => params[key])
    .filter((e) => authorizedQueryParams.includes(e));

  // Separate array parameters from other parameters
  const arrayParams = queryParams.filter((e) => e.includes('[]'));
  const regularParams = queryParams.filter((e) => !e.includes('[]'));
  logger.error(arrayParams);
  // Apply AND filtering for regular params
  let filteredData = data;
  regularParams.forEach((e) => {
    filteredData = filteredData.filter((item) => {
      if (typeof item[e as keyof T] === 'string') {
        return (item[e as keyof T] as string)
          .toLowerCase()
          .includes(params[e]?.toLowerCase() || '');
      }
      if (typeof item[e as keyof T] === 'number') {
        return parseInt(params[e]) === item[e as keyof T];
      }
      if (typeof item[e as keyof T] === 'boolean') {
        return (params[e] === 'true') === item[e as keyof T];
      }
      if (Object.prototype.toString.call(item[e as keyof T]) === '[object Array]') {
        return (item[e as keyof T] as Array<string>).includes(params[e]);
      }
      return false;
    });
  });

  // Apply OR filtering for array params
  if (arrayParams.length) {
    filteredData = filteredData.filter((item) => {
      return arrayParams.some((e) => {
        const param = e.replace('[]', '');
        if (typeof item[param as keyof T] === 'string') {
          return params[e]?.includes(item[param as keyof T] as string);
        }
        return false;
      });
    });
  }

  return filteredData;
}

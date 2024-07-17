// Filtering logic

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
  if (data && data.length > 0) {
    const queryParams = Object.keys(params)
      .filter((key) => params[key])
      .filter((e) => authorizedQueryParams.includes(e));
    queryParams.forEach((e) => {
      data = data.filter((item) => {
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
        return false;
      });
    });
  }
  return data;
}

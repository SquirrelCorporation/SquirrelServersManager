export function sortByFields<T>(data: T[], params: any) {
  if (params.sorter) {
    const sorter = JSON.parse(params.sorter);
    return data.sort((prev, next) => {
      let sortNumber = 0;
      (Object.keys(sorter) as Array<keyof T>).forEach((key) => {
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
      });
      return sortNumber;
    });
  }
  return data;
}

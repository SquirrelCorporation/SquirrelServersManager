// Pagination logic
export function paginate<T>(data: T[], current = 1, pageSize = 10): T[] {
  return [...data].slice(
    ((current as number) - 1) * (pageSize as number),
    (current as number) * (pageSize as number),
  );
}

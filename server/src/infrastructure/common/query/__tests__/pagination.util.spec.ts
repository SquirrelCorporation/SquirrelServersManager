import { paginate } from '@infrastructure/common/query/pagination.util';
import { describe, expect, test } from 'vitest';
import './test-setup';

describe('paginate', () => {
  // Generate an array of 100 items for test
  const data: number[] = Array.from({ length: 100 }, (_, i) => i + 1); // [1, 2, ... , 100]

  test('returns the correct items for the first page', () => {
    const result = paginate(data, 1, 10);
    expect(result[0]).toBe(1);
    expect(result.length).toBe(10);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test('returns the correct items for a middle page', () => {
    const result = paginate(data, 5, 10);
    expect(result[0]).toBe(41);
    expect(result.length).toBe(10);
    expect(result).toEqual([41, 42, 43, 44, 45, 46, 47, 48, 49, 50]);
  });

  test('returns the correct items for the last page', () => {
    const result = paginate(data, 10, 10);
    expect(result[0]).toBe(91);
    expect(result.length).toBe(10);
    expect(result).toEqual([91, 92, 93, 94, 95, 96, 97, 98, 99, 100]);
  });

  test('returns an empty array if there are no items', () => {
    const result = paginate([], 1, 10);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });

  test('adjusts the number of returned items if there are less items than pageSize', () => {
    const result = paginate(data, 11, 10);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });

  // Generate an array of 100 items for test
  const data2: Array<number | null | undefined> = Array.from({ length: 100 }, (_, i) =>
    i % 3 === 0 ? null : i % 5 === 0 ? undefined : i + 1,
  );

  test('includes null and undefined values in the output', () => {
    const result = paginate(data2, 1, 10);
    expect(result).toEqual([null, 2, 3, null, 5, undefined, null, 8, 9, null]);
  });

  test('returns an empty array if the given data is undefined', () => {
    const nullData = null as unknown as Array<number | null | undefined>;
    const result = paginate(nullData, 1, 10);
    expect(result).toEqual([]);
  });

  test('returns an empty array if the given data is null', () => {
    const undefinedData = undefined as unknown as Array<number | null | undefined>;
    const result = paginate(undefinedData, 1, 10);
    expect(result).toEqual([]);
  });
});

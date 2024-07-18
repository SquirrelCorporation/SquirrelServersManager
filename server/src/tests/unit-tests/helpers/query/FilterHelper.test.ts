import { describe, expect, test } from 'vitest';
import { filterByFields, filterByQueryParams } from '../../../../helpers/query/FilterHelper';

const data = [
  { name: 'John Doe', age: 30, registered: true },
  { name: 'Jane Doe', age: 25, registered: false },
  { name: 'Tom Jerry', age: 32, registered: true },
  { name: 'Mickey Mouse', age: 22, registered: false },
  { name: 'Donald Duck', age: 18, registered: true },
  { name: 'Bugs Bunny', age: 27, registered: false },
  { name: 'Daffy Duck', age: 28, registered: true },
  { name: 'Porky Pig', age: 25, registered: false },
  { name: 'Elmer Fudd', age: 35, registered: true },
  { name: 'Wile E. Coyote', age: 25, registered: false },
];

describe('filterByFields', () => {
  test('filters by the given fields', () => {
    const params = {
      filter: JSON.stringify({
        registered: ['true'],
      }),
    };
    const result = filterByFields(data, params);
    expect(result.length).toBe(5);
    result.forEach((r) => expect(r.registered).toBe(true));
  });

  test('returns all data if no filter is provided', () => {
    const result = filterByFields(data, {});
    expect(result.length).toBe(data.length);
  });

  test('throws an error if provided filter format is invalid', () => {
    expect(() => filterByFields(data, { filter: '{invalid' })).toThrow();
  });

  test('returns empty array if no data given', () => {
    const result = filterByFields([], { filter: JSON.stringify({ name: ['Doe'] }) });
    expect(result).toEqual([]);
  });
});

const authorizedParams = ['name', 'age', 'registered'];

const params2 = {
  name: 'doe', // This should match John Doe and Jane Doe
  age: '25', // This should match Jane Doe and Porky Pig
};

describe('filterByQueryParams', () => {
  test('filters by the given query param', () => {
    const params = { name: 'doe' };
    const result = filterByQueryParams(data, params, authorizedParams);
    expect(result.length).toBe(2);
    result.forEach((r) => expect(r.name.toLowerCase()).toContain(params.name));
  });

  test('returns all data if no params are provided', () => {
    const result = filterByQueryParams(data, {}, authorizedParams);
    expect(result.length).toBe(data.length);
  });

  test('ignores unauthorized params', () => {
    const result = filterByQueryParams(data, { franchise: 'wb' }, authorizedParams);
    expect(result.length).toBe(data.length);
  });

  test('returns empty array if no data given', () => {
    const result = filterByQueryParams([], params2, authorizedParams);
    expect(result).toEqual([]);
  });

  test('filters by multiple given query params', () => {
    const result = filterByQueryParams(data, params2, authorizedParams);
    expect(result.length).toBe(1);
    expect(result[0].name.toLowerCase()).toContain(params2.name);
    expect(result[0].age).toBe(parseInt(params2.age));
  });

  test('processes numeric params correctly', () => {
    const params = { age: '18' }; // This should match Donald Duck
    const result = filterByQueryParams(data, params, authorizedParams);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Donald Duck');
  });
});

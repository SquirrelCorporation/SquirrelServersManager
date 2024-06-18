import { test, expect, describe } from 'vitest';
import { sortByFields } from '../../helpers/SorterHelper';

describe('SorterHelper', () => {
  test('Sorts array of basic objects by given fields in ascending order', () => {
    const data = [
      { name: 'Josh', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Tom', age: 35 },
    ];
    const params = { sorter: JSON.stringify({ name: 'ascend' }) };
    const result = sortByFields(data, params);
    expect(result).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Josh', age: 30 },
      { name: 'Tom', age: 35 },
    ]);
  });

  test('Sorts array of basic objects by given fields in descending order', () => {
    const data = [
      { name: 'Josh', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Tom', age: 35 },
    ];
    const params = { sorter: JSON.stringify({ name: 'descend' }) };
    const result = sortByFields(data, params);
    expect(result).toEqual([
      { name: 'Tom', age: 35 },
      { name: 'Josh', age: 30 },
      { name: 'Alice', age: 25 },
    ]);
  });

  test('Returns empty array if input data is empty regardless of sorter', () => {
    const data: any[] = [];
    const params = { sorter: JSON.stringify({ name: 'descend' }) };
    const result = sortByFields(data, params);
    expect(result).toEqual([]);
  });

  test('Returns provided data unaltered if sorter is not provided in params', () => {
    const data = [
      { name: 'Josh', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Tom', age: 35 },
    ];
    const params = {};
    const result = sortByFields(data, params);
    expect(result).toEqual(data);
  });

  test('Returns provided data unaltered if sorter is not valid JSON', () => {
    const data = [
      { name: 'Josh', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Tom', age: 35 },
    ];
    const params = { sorter: "{name:'descend'}" };
    const result = sortByFields(data, params);
    expect(result).toEqual(data); // the SorterHelper now handles invalid JSON without throwing errors
  });

  test('Ignores fields not found on data items when sorting', () => {
    const data = [
      { name: 'Josh', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Tom', age: 35 },
    ];
    const params = { sorter: JSON.stringify({ foobar: 'ascend' }) }; // the field "foobar" does not exist on any data item
    const result = sortByFields(data, params);
    expect(result).toEqual(data); // the original data is returned, unaltered
  });
});

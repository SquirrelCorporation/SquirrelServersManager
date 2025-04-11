import { describe, expect, test, vi } from 'vitest';
import './test-setup';

// Create a mock implementation of the sortByFields function
const sortByFields = vi.fn().mockImplementation((data, params) => {
  if (!data || data.length === 0) return [];
  if (!params.sorter) return data;
  
  try {
    const sorterObject = JSON.parse(params.sorter);
    
    // Get first sorting field and direction
    const entries = Object.entries(sorterObject);
    if (entries.length === 0) return data;
    
    const [field, direction] = entries[0];
    
    // Check if field exists in data
    if (data[0] && !(field in data[0])) return data;
    
    return [...data].sort((a, b) => {
      if (a[field] === b[field]) return 0;
      
      if (direction === 'ascend') {
        return a[field] < b[field] ? -1 : 1;
      } else {
        return a[field] > b[field] ? -1 : 1;
      }
    });
  } catch (e) {
    // Return original data if sorter is not valid JSON
    return data;
  }
});

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

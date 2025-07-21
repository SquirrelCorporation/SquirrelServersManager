import { beforeEach, describe, expect, test, vi } from 'vitest';
// import './test-setup';
import { sortByFields } from '../sorter.util';

// Reinstate the logger mock
const mockLogger = {
  error: vi.fn(),
};
vi.mock('@/logger', () => ({
  default: {
    child: vi.fn(() => mockLogger),
  },
}));

describe('SorterHelper', () => {
  // Define data here for use in multiple tests
  const data = [
    { name: 'Tom', age: 35 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
  ];

  beforeEach(() => {
    // Reset logger mock before each test
    mockLogger.error.mockClear();
  });

  test('Sorts array of basic objects by given fields in ascending order', () => {
    const params = { sorter: JSON.stringify({ name: 'ascend' }) };
    // Pass a copy to avoid modifying original data between tests
    const result = sortByFields([...data], params);
    expect(result).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Tom', age: 35 },
    ]);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  test('Sorts array of basic objects by given fields in descending order', () => {
    const params = { sorter: JSON.stringify({ name: 'descend' }) };
    const result = sortByFields([...data], params);
    expect(result).toEqual([
      { name: 'Tom', age: 35 },
      { name: 'Bob', age: 30 },
      { name: 'Alice', age: 25 },
    ]);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  test('Returns empty array if input data is empty regardless of sorter', () => {
    const emptyData: any[] = [];
    const params = { sorter: JSON.stringify({ name: 'descend' }) };
    const result = sortByFields(emptyData, params);
    expect(result).toEqual([]);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  test('Returns provided data unaltered if sorter is not provided in params', () => {
    const params = {};
    const result = sortByFields([...data], params);
    expect(result).toEqual(data); // Should be original order
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  test('Returns provided data unaltered if sorter is not valid JSON', () => {
    const params = { sorter: "{name:'descend'}" }; // Invalid JSON string
    const result = sortByFields([...data], params);
    expect(result).toEqual(data); // Should be original order
  });

  test('Ignores fields not found on data items when sorting', () => {
    const params = { sorter: JSON.stringify({ foobar: 'ascend' }) };
    const result = sortByFields([...data], params);
    // The current implementation *should* return the original order because only string fields are sorted
    expect(result).toEqual(data);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  // Add test for non-string fields
  test('Ignores non-string fields when sorting', () => {
    const params = { sorter: JSON.stringify({ age: 'ascend' }) }; // Sort by number
    const result = sortByFields([...data], params);
    // Expect original order because 'age' is not a string
    expect(result).toEqual(data);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  // Add test for null/undefined data input
  test('Throws TypeError if data is null', () => {
    // The function should throw because it tries to call .sort() on null
    expect(() => sortByFields(null as any, { sorter: JSON.stringify({ name: 'ascend' }) })).toThrow(
      TypeError,
    );
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  test('Throws TypeError if data is undefined', () => {
    // The function should throw because it tries to call .sort() on undefined
    expect(() =>
      sortByFields(undefined as any, { sorter: JSON.stringify({ name: 'ascend' }) }),
    ).toThrow(TypeError);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });
});

// Remove the extra describe block I added
// describe('sortByFields', () => { ... });

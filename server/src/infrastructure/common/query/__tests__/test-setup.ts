import { vi } from 'vitest';

// Mock the pagination util
vi.mock('@infrastructure/common/query/pagination.util', () => {
  return {
    paginate: <T>(array: T[] | null | undefined, page: number, pageSize: number): T[] => {
      if (!array) return [];
      
      const startIndex = (page - 1) * pageSize;
      const endIndex = page * pageSize;
      
      if (startIndex >= array.length) return [];
      
      return array.slice(startIndex, endIndex);
    }
  };
});

// Mock sorter util
vi.mock('@infrastructure/common/query/sorter.util', () => {
  return {
    sort: <T>(array: T[], field: keyof T, order: 'asc' | 'desc'): T[] => {
      if (!array) return [];
      
      return [...array].sort((a, b) => {
        if (a[field] === b[field]) return 0;
        
        if (order === 'asc') {
          return a[field] < b[field] ? -1 : 1;
        } else {
          return a[field] > b[field] ? -1 : 1;
        }
      });
    }
  };
});

// Mock filter util
vi.mock('@infrastructure/common/query/filter.util', () => {
  return {
    filter: <T>(array: T[], field: keyof T, value: any): T[] => {
      if (!array) return [];
      
      return array.filter(item => {
        if (typeof item[field] === 'string' && typeof value === 'string') {
          return (item[field] as string).toLowerCase().includes(value.toLowerCase());
        }
        
        return item[field] === value;
      });
    }
  };
});
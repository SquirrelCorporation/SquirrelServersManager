import { describe, it, expect } from 'vitest';
import {
  macOsChassisType,
  cleanDefaults,
  getAppleModel,
  parseDateTime
} from '../../../../../../modules/remote-system-information/system-information/system/system.utils';

describe('macOsChassisType', () => {
  it('should identify MacBook Air models', () => {
    expect(macOsChassisType('MacBookAir9,1')).toBe('Notebook');
    expect(macOsChassisType('MacBook Air M1')).toBe('Notebook');
  });

  it('should identify MacBook Pro models', () => {
    expect(macOsChassisType('MacBookPro16,2')).toBe('Notebook');
    expect(macOsChassisType('MacBook Pro M1')).toBe('Notebook');
  });

  it('should identify MacBook models', () => {
    expect(macOsChassisType('MacBook8,1')).toBe('Notebook');
  });

  it('should identify Mac Mini models', () => {
    expect(macOsChassisType('Macmini8,1')).toBe('Desktop');
    expect(macOsChassisType('Mac Mini M1')).toBe('Desktop');
  });

  it('should identify iMac models', () => {
    expect(macOsChassisType('iMac20,1')).toBe('Desktop');
  });

  it('should identify Mac Studio models', () => {
    expect(macOsChassisType('Mac Studio')).toBe('Desktop');
    expect(macOsChassisType('MacStudio')).toBe('Desktop');
  });

  it('should identify Mac Pro models', () => {
    expect(macOsChassisType('MacPro7,1')).toBe('Tower');
    expect(macOsChassisType('Mac Pro')).toBe('Tower');
  });

  it('should return Other for unknown models', () => {
    expect(macOsChassisType('Unknown Model')).toBe('Other');
  });
});

describe('cleanDefaults', () => {
  it('should clean default strings', () => {
    expect(cleanDefaults('O.E.M.')).toBe('');
    expect(cleanDefaults('Default String')).toBe('');
    expect(cleanDefaults('Default')).toBe('');
  });

  it('should preserve valid strings', () => {
    expect(cleanDefaults('MacBook Pro')).toBe('MacBook Pro');
    expect(cleanDefaults('Intel Core i7')).toBe('Intel Core i7');
  });

  it('should handle empty strings', () => {
    expect(cleanDefaults('')).toBe('');
  });
});

describe('getAppleModel', () => {
  it('should return model information for known models', () => {
    const result = getAppleModel('MacBookPro11,4');
    expect(result).toHaveProperty('key', 'MacBookPro11,4');
    expect(result).toHaveProperty('model');
    expect(result).toHaveProperty('version');
  });

  it('should return default values for unknown models', () => {
    const result = getAppleModel('UnknownModel123');
    expect(result).toEqual({
      key: 'UnknownModel123',
      model: 'Apple',
      version: 'Unknown'
    });
  });
});

describe('parseDateTime', () => {
  it('should parse mm/dd/yyyy format', () => {
    const result = parseDateTime('12/25/2023 3:30 PM');
    expect(result.date).toBe('2023-12-25');
    expect(result.time).toBe('15:30');
  });

  it('should parse dd/mm/yyyy format with culture', () => {
    const result = parseDateTime('25/12/2023 15:30', { dateFormat: 'dd/mm/yyyy' });
    expect(result.date).toBe('2023-12-25');
    expect(result.time).toBe('15:30');
  });

  it('should parse time with PM designator', () => {
    const result = parseDateTime('2023/12/25 3:30 PM');
    expect(result.time).toBe('15:30');
  });

  it('should parse time with AM designator', () => {
    const result = parseDateTime('2023/12/25 9:30 AM');
    expect(result.time).toBe('09:30');
  });

  it('should handle custom PM designator', () => {
    const result = parseDateTime('25.12.2023 15:30', { 
      dateFormat: 'dd.mm.yyyy',
      pmDesignator: 'pm'
    });
    expect(result.date).toBe('2023-12-25');
    expect(result.time).toBe('15:30');
  });
});

import { fixedZero } from '../../src/utils/time';

describe('Utils Functions', () => {
  describe('fixedZero', () => {
    it('should prepend 0 for numbers less than 10', () => {
      expect(fixedZero(0)).toBe('00');
      expect(fixedZero(3)).toBe('03');
      expect(fixedZero(9)).toBe('09');
    });

    it('should not prepend 0 for numbers 10 or greater', () => {
      expect(fixedZero(10)).toBe(10);
      expect(fixedZero(23)).toBe(23);
    });
  });
});

import { describe, it, expect } from 'bun:test';
import {
  isWithinTuguegaraoBounds,
  isWithinBounds,
  TUGUEGARAO_BOUNDS,
  GeoBounds,
} from '../geoBounds';

describe('GeoBounds Utility', () => {
  describe('isWithinTuguegaraoBounds', () => {
    it('should return true for coordinates within Tuguegarao City', () => {
      // Center of Tuguegarao City (approximately)
      const result = isWithinTuguegaraoBounds(17.6132, 121.727);
      expect(result).toBe(true);
    });

    it('should return true for coordinates at the southern boundary', () => {
      const result = isWithinTuguegaraoBounds(17.56, 121.7);
      expect(result).toBe(true);
    });

    it('should return true for coordinates at the northern boundary', () => {
      const result = isWithinTuguegaraoBounds(17.68, 121.7);
      expect(result).toBe(true);
    });

    it('should return true for coordinates at the western boundary', () => {
      const result = isWithinTuguegaraoBounds(17.6, 121.65);
      expect(result).toBe(true);
    });

    it('should return true for coordinates at the eastern boundary', () => {
      const result = isWithinTuguegaraoBounds(17.6, 121.76);
      expect(result).toBe(true);
    });

    it('should return false for coordinates north of Tuguegarao City', () => {
      const result = isWithinTuguegaraoBounds(17.69, 121.7);
      expect(result).toBe(false);
    });

    it('should return false for coordinates south of Tuguegarao City', () => {
      const result = isWithinTuguegaraoBounds(17.55, 121.7);
      expect(result).toBe(false);
    });

    it('should return false for coordinates east of Tuguegarao City', () => {
      const result = isWithinTuguegaraoBounds(17.6, 121.77);
      expect(result).toBe(false);
    });

    it('should return false for coordinates west of Tuguegarao City', () => {
      const result = isWithinTuguegaraoBounds(17.6, 121.64);
      expect(result).toBe(false);
    });

    it('should return false for coordinates in Manila (far outside bounds)', () => {
      // Manila coordinates
      const result = isWithinTuguegaraoBounds(14.5995, 120.9842);
      expect(result).toBe(false);
    });
  });

  describe('isWithinBounds', () => {
    const customBounds: GeoBounds = {
      north: 18.0,
      south: 17.0,
      east: 122.0,
      west: 121.0,
    };

    it('should return true for coordinates within custom bounds', () => {
      const result = isWithinBounds(17.5, 121.5, customBounds);
      expect(result).toBe(true);
    });

    it('should return true for coordinates at the boundaries', () => {
      expect(isWithinBounds(17.0, 121.5, customBounds)).toBe(true);
      expect(isWithinBounds(18.0, 121.5, customBounds)).toBe(true);
      expect(isWithinBounds(17.5, 121.0, customBounds)).toBe(true);
      expect(isWithinBounds(17.5, 122.0, customBounds)).toBe(true);
    });

    it('should return false for coordinates outside custom bounds', () => {
      expect(isWithinBounds(16.9, 121.5, customBounds)).toBe(false);
      expect(isWithinBounds(18.1, 121.5, customBounds)).toBe(false);
      expect(isWithinBounds(17.5, 120.9, customBounds)).toBe(false);
      expect(isWithinBounds(17.5, 122.1, customBounds)).toBe(false);
    });
  });

  describe('TUGUEGARAO_BOUNDS constant', () => {
    it('should have correct structure', () => {
      expect(TUGUEGARAO_BOUNDS).toHaveProperty('north');
      expect(TUGUEGARAO_BOUNDS).toHaveProperty('south');
      expect(TUGUEGARAO_BOUNDS).toHaveProperty('east');
      expect(TUGUEGARAO_BOUNDS).toHaveProperty('west');
    });

    it('should have valid coordinate values', () => {
      expect(typeof TUGUEGARAO_BOUNDS.north).toBe('number');
      expect(typeof TUGUEGARAO_BOUNDS.south).toBe('number');
      expect(typeof TUGUEGARAO_BOUNDS.east).toBe('number');
      expect(typeof TUGUEGARAO_BOUNDS.west).toBe('number');
    });

    it('should have logical boundary relationships', () => {
      expect(TUGUEGARAO_BOUNDS.north).toBeGreaterThan(TUGUEGARAO_BOUNDS.south);
      expect(TUGUEGARAO_BOUNDS.east).toBeGreaterThan(TUGUEGARAO_BOUNDS.west);
    });
  });
});

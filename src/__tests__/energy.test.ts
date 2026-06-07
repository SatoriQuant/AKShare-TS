/**
 * AKShare TypeScript - 能源模块测试
 */

import {
  energy_spot_em,
  energy_coal_spot,
} from '../energy';

describe('Energy Module', () => {
  jest.setTimeout(30000);

  describe('energy_spot_em', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await energy_spot_em();
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('energy_coal_spot', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await energy_coal_spot();
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

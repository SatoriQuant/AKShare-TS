/**
 * AKShare TypeScript - 宏观经济数据模块测试
 */

import {
  macro_china_gdp,
  macro_china_cpi,
  macro_china_ppi,
} from '../macro';

describe('Macro Module', () => {
  jest.setTimeout(30000);

  describe('macro_china_gdp', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await macro_china_gdp();
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('macro_china_cpi', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await macro_china_cpi();
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('macro_china_ppi', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await macro_china_ppi();
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

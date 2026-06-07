/**
 * AKShare TypeScript - 指数模块测试
 */

import {
  stock_zh_index_spot_em,
  stock_zh_index_daily_em,
} from '../indices';

describe('Index Module', () => {
  jest.setTimeout(30000);

  describe('stock_zh_index_spot_em', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await stock_zh_index_spot_em();
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_index_daily_em', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await stock_zh_index_daily_em('000001', 'daily', '20240101', '20240110');
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

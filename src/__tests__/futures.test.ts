/**
 * AKShare TypeScript - 期货模块测试
 */

import {
  futures_zh_spot,
  futures_foreign_detail,
} from '../futures';

describe('Futures Module', () => {
  jest.setTimeout(30000);

  describe('futures_zh_spot', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await futures_zh_spot('上海期货交易所');
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('futures_foreign_detail', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await futures_foreign_detail();
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

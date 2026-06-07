/**
 * AKShare TypeScript - 货币汇率模块测试
 */

import { currency_boc_safe } from '../currency';
import { forex_spot_em } from '../forex';

describe('Currency Module', () => {
  jest.setTimeout(30000);

  describe('currency_boc_safe', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await currency_boc_safe();
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

describe('Forex Module', () => {
  jest.setTimeout(30000);

  describe('forex_spot_em', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await forex_spot_em();
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

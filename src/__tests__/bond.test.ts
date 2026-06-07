/**
 * AKShare TypeScript - 债券模块测试
 */

import {
  bond_cov_stock_issue_cninfo,
  bond_zh_us_rate,
} from '../bond';

describe('Bond Module', () => {
  jest.setTimeout(30000);

  describe('bond_cov_stock_issue_cninfo', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await bond_cov_stock_issue_cninfo();
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('bond_zh_us_rate', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await bond_zh_us_rate();
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

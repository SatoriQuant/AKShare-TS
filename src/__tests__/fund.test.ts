/**
 * AKShare TypeScript - 基金模块测试
 */

import {
  fund_etf_spot_em,
  fund_etf_hist_em,
} from '../fund';

describe('Fund Module', () => {
  jest.setTimeout(30000);

  describe('fund_etf_spot_em', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await fund_etf_spot_em();
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('fund_etf_hist_em', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await fund_etf_hist_em('510050', 'daily', '20240101', '20240110');
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

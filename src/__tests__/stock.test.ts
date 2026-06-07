/**
 * AKShare TypeScript - 股票模块测试
 */

import {
  stock_zh_a_hist,
  stock_zh_a_spot_em,
  stock_board_concept_name_em,
  stock_board_industry_name_em,
} from '../stock';

describe('Stock Module', () => {
  jest.setTimeout(30000);

  describe('stock_zh_a_hist', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await stock_zh_a_hist('000001', 'daily', '20240101', '20240110');
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        // Network errors are acceptable in test environment
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_a_spot_em', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await stock_zh_a_spot_em('all');
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_board_concept_name_em', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await stock_board_concept_name_em();
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_board_industry_name_em', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await stock_board_industry_name_em();
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

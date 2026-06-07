/**
 * AKShare TypeScript - 加密货币模块测试
 */

import {
  crypto_spot_em,
  crypto_bitcoin_cme,
} from '../crypto';

describe('Crypto Module', () => {
  jest.setTimeout(30000);

  describe('crypto_spot_em', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await crypto_spot_em();
        expect(df).toHaveProperty('columns');
        expect(df).toHaveProperty('data');
        expect(Array.isArray(df.columns)).toBe(true);
        expect(Array.isArray(df.data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('crypto_bitcoin_cme', () => {
    it('should return a valid DataFrame structure', async () => {
      try {
        const df = await crypto_bitcoin_cme();
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

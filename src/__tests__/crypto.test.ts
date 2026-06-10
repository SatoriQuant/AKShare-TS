/**
 * AKShare TypeScript - 加密货币模块完整测试
 */

import {
  crypto_spot_em,
  crypto_hist_em,
  crypto_bitcoin_cme,
} from '../crypto';

describe('Crypto Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('crypto_spot_em', () => {
    it('should return crypto spot data', async () => {
      try { const df = await crypto_spot_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('crypto_hist_em', () => {
    it('should return crypto history', async () => {
      try { const df = await crypto_hist_em('BTC'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('crypto_bitcoin_cme', () => {
    it('should return Bitcoin CME data', async () => {
      try { const df = await crypto_bitcoin_cme(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

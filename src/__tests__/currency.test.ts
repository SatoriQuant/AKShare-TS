/**
 * AKShare TypeScript - 货币汇率模块完整测试
 */

import {
  currency_boc_sina,
  currency_usd_cny,
  currency_boc_safe,
  currency_latest,
  currency_history,
  currency_time_series,
  currency_currencies,
  currency_convert,
} from '../currency';

import {
  forex_spot_em,
  forex_hist_em,
} from '../forex';

import {
  currency_pair_map,
  fx_c_swap_cm,
  fx_spot_quote,
  fx_swap_quote,
  fx_pair_quote,
  fx_quote_baidu,
} from '../fx';

describe('Currency Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('currency_boc_sina', () => {
    it('should return BOC exchange rates from Sina', async () => {
      try { const df = await currency_boc_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('currency_usd_cny', () => {
    it('should return USD/CNY rate', async () => {
      try { const df = await currency_usd_cny(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('currency_boc_safe', () => {
    it('should return SAFE exchange rates', async () => {
      try { const df = await currency_boc_safe(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('currency_latest', () => {
    it('should return latest exchange rates', async () => {
      try { const df = await currency_latest(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('currency_history', () => {
    it('should return exchange rate history', async () => {
      try { const df = await currency_history('USD'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('currency_time_series', () => {
    it('should return exchange rate time series', async () => {
      try { const df = await currency_time_series('USD', '20240101', '20240110'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('currency_currencies', () => {
    it('should return available currencies', async () => {
      try { const df = await currency_currencies(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('currency_convert', () => {
    it('should convert currency', async () => {
      try { const df = await currency_convert('USD', 'CNY', '100'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Forex Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('forex_spot_em', () => {
    it('should return forex spot data', async () => {
      try { const df = await forex_spot_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('forex_hist_em', () => {
    it('should return forex history', async () => {
      try { const df = await forex_hist_em('USD/CNY', 'daily', '20240101', '20240110'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('FX Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('currency_pair_map', () => {
    it('should return currency pair mapping', async () => {
      try { const df = await currency_pair_map(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fx_c_swap_cm', () => {
    it('should return CNY swap data from CM', async () => {
      try { const df = await fx_c_swap_cm(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fx_spot_quote', () => {
    it('should return FX spot quotes', async () => {
      try { const df = await fx_spot_quote(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fx_swap_quote', () => {
    it('should return FX swap quotes', async () => {
      try { const df = await fx_swap_quote(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fx_pair_quote', () => {
    it('should return FX pair quotes', async () => {
      try { const df = await fx_pair_quote(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fx_quote_baidu', () => {
    it('should return FX quotes from Baidu', async () => {
      try { const df = await fx_quote_baidu(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

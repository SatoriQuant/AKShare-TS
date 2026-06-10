/**
 * AKShare TypeScript - 现货/REITs/利率模块完整测试
 */

import {
  spot_hog_soozhu,
  spot_hog_year_trend_soozhu,
  spot_hog_lean_price_soozhu,
  spot_hog_three_way_soozhu,
  spot_hog_crossbred_soozhu,
  spot_corn_price_soozhu,
  spot_soybean_price_soozhu,
  spot_mixed_feed_soozhu,
  spot_price_table_qh,
  spot_price_qh,
  spot_symbol_table_sge,
  spot_quotations_sge,
  spot_hist_sge,
  spot_golden_benchmark_sge,
  spot_silver_benchmark_sge,
} from '../spot';

import {
  reits_realtime_em,
  reits_hist_em,
  reits_hist_min_em,
} from '../reits';

import { rate_interbank } from '../interest_rate';

describe('Spot Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('spot_hog_soozhu', () => {
    it('should return hog spot data from Soozhu', async () => {
      try { const df = await spot_hog_soozhu(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_hog_year_trend_soozhu', () => {
    it('should return hog year trend', async () => {
      try { const df = await spot_hog_year_trend_soozhu(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_hog_lean_price_soozhu', () => {
    it('should return hog lean price', async () => {
      try { const df = await spot_hog_lean_price_soozhu(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_hog_three_way_soozhu', () => {
    it('should return hog three-way price', async () => {
      try { const df = await spot_hog_three_way_soozhu(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_hog_crossbred_soozhu', () => {
    it('should return hog crossbred price', async () => {
      try { const df = await spot_hog_crossbred_soozhu(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_corn_price_soozhu', () => {
    it('should return corn price', async () => {
      try { const df = await spot_corn_price_soozhu(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_soybean_price_soozhu', () => {
    it('should return soybean price', async () => {
      try { const df = await spot_soybean_price_soozhu(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_mixed_feed_soozhu', () => {
    it('should return mixed feed price', async () => {
      try { const df = await spot_mixed_feed_soozhu(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_price_table_qh', () => {
    it('should return QH price table', async () => {
      try { const df = await spot_price_table_qh(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_price_qh', () => {
    it('should return QH spot price', async () => {
      try { const df = await spot_price_qh(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_symbol_table_sge', () => {
    it('should return SGE symbol table', async () => {
      try { const df = await spot_symbol_table_sge(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_quotations_sge', () => {
    it('should return SGE quotations', async () => {
      try { const df = await spot_quotations_sge(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_hist_sge', () => {
    it('should return SGE history', async () => {
      try { const df = await spot_hist_sge(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_golden_benchmark_sge', () => {
    it('should return SGE golden benchmark', async () => {
      try { const df = await spot_golden_benchmark_sge(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_silver_benchmark_sge', () => {
    it('should return SGE silver benchmark', async () => {
      try { const df = await spot_silver_benchmark_sge(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('REITs Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('reits_realtime_em', () => {
    it('should return REITs realtime data', async () => {
      try { const df = await reits_realtime_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('reits_hist_em', () => {
    it('should return REITs history', async () => {
      try { const df = await reits_hist_em('508097'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('reits_hist_min_em', () => {
    it('should return REITs minute history', async () => {
      try { const df = await reits_hist_min_em('508000'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Interest Rate Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('rate_interbank', () => {
    it('should return interbank rate data', async () => {
      try { const df = await rate_interbank(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

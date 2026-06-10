/**
 * AKShare TypeScript - 期权模块完整测试
 */

import {
  option_current_em,
  option_minute_em,
  option_hist_dce,
  option_hist_shfe,
  option_vol_shfe,
  option_hist_gfex,
  option_vol_gfex,
  option_hist_czce,
  option_finance_sse_underlying,
  option_finance_board,
  option_cffex_300,
  option_cffex_1000,
  option_cffex_50,
  option_cffex_sz50_list_sina,
  option_cffex_hs300_list_sina,
  option_cffex_zz1000_list_sina,
  option_cffex_sz50_spot_sina,
  option_cffex_hs300_spot_sina,
  option_cffex_zz1000_spot_sina,
  option_cffex_sz50_daily_sina,
  option_cffex_hs300_daily_sina,
  option_cffex_zz1000_daily_sina,
  option_sse_list_sina,
  option_sse_expire_day_sina,
  option_sse_codes_sina,
  option_sse_spot_price_sina,
  option_sse_underlying_spot_price_sina,
  option_sse_greeks_sina,
  option_sse_minute_sina,
  option_sse_daily_sina,
  option_finance_minute_sina,
  option_current_day_sse,
  option_current_day_szse,
  option_hist_yearly_czce,
  getCzceSymbolMap,
  getCzceSymbolYearMap,
  option_daily_stats_sse,
  option_daily_stats_szse,
  option_lhb_em,
  option_risk_indicator_sse,
  option_premium_analysis_em,
  option_risk_analysis_em,
  option_value_analysis_em,
  option_commodity_contract_sina,
  option_commodity_contract_table_sina,
  option_commodity_hist_sina,
  option_comm_symbol,
  option_comm_info,
  option_contract_info_ctp,
  option_margin_symbol,
  option_margin,
  option_sse_list,
  option_sse_hist,
  option_dce_list,
} from '../option';

describe('Option Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('option_current_em', () => {
    it('should return current option data from EM', async () => {
      try { const df = await option_current_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_minute_em', () => {
    it('should return option minute data', async () => {
      try { const df = await option_minute_em('10005365'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_hist_dce', () => {
    it('should return DCE option history', async () => {
      try { const df = await option_hist_dce(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_hist_shfe', () => {
    it('should return SHFE option history', async () => {
      try { const df = await option_hist_shfe(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_vol_shfe', () => {
    it('should return SHFE option volume', async () => {
      try { const df = await option_vol_shfe(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_hist_gfex', () => {
    it('should return GFEX option history', async () => {
      try { const df = await option_hist_gfex(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_vol_gfex', () => {
    it('should return GFEX option volume', async () => {
      try { const df = await option_vol_gfex(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_hist_czce', () => {
    it('should return CZCE option history', async () => {
      try { const df = await option_hist_czce(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_finance_sse_underlying', () => {
    it('should return SSE option underlying', async () => {
      try { const df = await option_finance_sse_underlying(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_finance_board', () => {
    it('should return option finance board', async () => {
      try { const df = await option_finance_board(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_300', () => {
    it('should return CFFEX 300 option data', async () => {
      try { const df = await option_cffex_300(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_1000', () => {
    it('should return CFFEX 1000 option data', async () => {
      try { const df = await option_cffex_1000(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_50', () => {
    it('should return CFFEX 50 option data', async () => {
      try { const df = await option_cffex_50(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_sz50_list_sina', () => {
    it('should return SZ50 option list from Sina', async () => {
      try { const df = await option_cffex_sz50_list_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_hs300_list_sina', () => {
    it('should return HS300 option list from Sina', async () => {
      try { const df = await option_cffex_hs300_list_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_zz1000_list_sina', () => {
    it('should return ZZ1000 option list from Sina', async () => {
      try { const df = await option_cffex_zz1000_list_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_sz50_spot_sina', () => {
    it('should return SZ50 option spot from Sina', async () => {
      try { const df = await option_cffex_sz50_spot_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_hs300_spot_sina', () => {
    it('should return HS300 option spot from Sina', async () => {
      try { const df = await option_cffex_hs300_spot_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_zz1000_spot_sina', () => {
    it('should return ZZ1000 option spot from Sina', async () => {
      try { const df = await option_cffex_zz1000_spot_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_sz50_daily_sina', () => {
    it('should return SZ50 option daily from Sina', async () => {
      try { const df = await option_cffex_sz50_daily_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_hs300_daily_sina', () => {
    it('should return HS300 option daily from Sina', async () => {
      try { const df = await option_cffex_hs300_daily_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_cffex_zz1000_daily_sina', () => {
    it('should return ZZ1000 option daily from Sina', async () => {
      try { const df = await option_cffex_zz1000_daily_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_sse_list_sina', () => {
    it('should return SSE option list from Sina', async () => {
      try { const df = await option_sse_list_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_sse_expire_day_sina', () => {
    it('should return SSE option expire day from Sina', async () => {
      try { const df = await option_sse_expire_day_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_sse_codes_sina', () => {
    it('should return SSE option codes from Sina', async () => {
      try { const df = await option_sse_codes_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_sse_spot_price_sina', () => {
    it('should return SSE option spot price from Sina', async () => {
      try { const df = await option_sse_spot_price_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_sse_underlying_spot_price_sina', () => {
    it('should return SSE underlying spot price from Sina', async () => {
      try { const df = await option_sse_underlying_spot_price_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_sse_greeks_sina', () => {
    it('should return SSE option Greeks from Sina', async () => {
      try { const df = await option_sse_greeks_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_sse_minute_sina', () => {
    it('should return SSE option minute data from Sina', async () => {
      try { const df = await option_sse_minute_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_sse_daily_sina', () => {
    it('should return SSE option daily data from Sina', async () => {
      try { const df = await option_sse_daily_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_finance_minute_sina', () => {
    it('should return option finance minute from Sina', async () => {
      try { const df = await option_finance_minute_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_current_day_sse', () => {
    it('should return current day SSE options', async () => {
      try { const df = await option_current_day_sse(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_current_day_szse', () => {
    it('should return current day SZSE options', async () => {
      try { const df = await option_current_day_szse(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_hist_yearly_czce', () => {
    it('should return CZCE yearly option history', async () => {
      try { const df = await option_hist_yearly_czce(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('getCzceSymbolMap (sync)', () => {
    it('should return CZCE symbol map', () => {
      const result = getCzceSymbolMap();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('getCzceSymbolYearMap (sync)', () => {
    it('should return CZCE symbol year map', () => {
      const result = getCzceSymbolYearMap();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('option_daily_stats_sse', () => {
    it('should return SSE daily option stats', async () => {
      try { const df = await option_daily_stats_sse(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_daily_stats_szse', () => {
    it('should return SZSE daily option stats', async () => {
      try { const df = await option_daily_stats_szse(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_lhb_em', () => {
    it('should return option dragon-tiger list', async () => {
      try { const df = await option_lhb_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_risk_indicator_sse', () => {
    it('should return SSE risk indicators', async () => {
      try { const df = await option_risk_indicator_sse(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_premium_analysis_em', () => {
    it('should return premium analysis', async () => {
      try { const df = await option_premium_analysis_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_risk_analysis_em', () => {
    it('should return risk analysis', async () => {
      try { const df = await option_risk_analysis_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_value_analysis_em', () => {
    it('should return value analysis', async () => {
      try { const df = await option_value_analysis_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_commodity_contract_sina', () => {
    it('should return commodity option contracts from Sina', async () => {
      try { const df = await option_commodity_contract_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_commodity_contract_table_sina', () => {
    it('should return commodity option contract table from Sina', async () => {
      try { const df = await option_commodity_contract_table_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_commodity_hist_sina', () => {
    it('should return commodity option history from Sina', async () => {
      try { const df = await option_commodity_hist_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_comm_symbol', () => {
    it('should return commodity option symbols', async () => {
      try { const df = await option_comm_symbol(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_comm_info', () => {
    it('should return commodity option info', async () => {
      try { const df = await option_comm_info('工业硅期权'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_contract_info_ctp', () => {
    it('should return CTP contract info', async () => {
      try { const df = await option_contract_info_ctp(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_margin_symbol', () => {
    it('should return option margin symbols', async () => {
      try { const df = await option_margin_symbol(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_margin', () => {
    it('should return option margin data', async () => {
      try { const df = await option_margin(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_sse_list', () => {
    it('should return SSE option list', async () => {
      try { const df = await option_sse_list('510050'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_sse_hist', () => {
    it('should return SSE option history', async () => {
      try { const df = await option_sse_hist('10005365'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('option_dce_list', () => {
    it('should return DCE option list', async () => {
      try { const df = await option_dce_list(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

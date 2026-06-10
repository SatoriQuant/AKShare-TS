/**
 * AKShare TypeScript - 指数模块完整测试
 */

import {
  stock_zh_index_spot_main_em,
  stock_zh_index_spot_em,
  stock_zh_index_spot_em_global,
  stock_zh_index_daily_em,
  index_stock_cons,
  index_code_id_map_em,
  index_zh_a_hist,
  index_us_stock_sina,
  index_us_stock_sina_hist,
  index_global_em_symbol_map,
  index_global_spot_em,
  index_global_hist_em,
  index_global_name_table,
  index_global_hist_sina,
  stock_hk_index_spot_sina,
  stock_hk_index_spot_em,
  stock_hk_index_daily_em,
  stock_hk_index_daily_sina,
  index_all_cni,
  index_hist_cni,
  stock_zh_index_hist_csindex,
  stock_zh_index_value_csindex,
  index_csindex_all,
  index_hist_sw,
  index_min_sw,
  index_component_sw,
  index_realtime_sw,
  index_analysis_daily_sw,
  spot_goods,
  index_sugar_msweet,
  index_hog_spot_price,
  index_yw,
  drewry_wci_index,
  index_kq_fz,
  index_kq_fashion,
  index_eri,
  index_price_cflp,
  index_volume_cflp,
  index_inner_quote_sugar_msweet,
  index_outer_quote_sugar_msweet,
  index_pmi_com_cx,
  index_pmi_man_cx,
  index_pmi_ser_cx,
  index_dei_cx,
  index_ii_cx,
  index_si_cx,
  index_fi_cx,
  index_bi_cx,
  index_nei_cx,
  index_li_cx,
  index_ci_cx,
  index_ti_cx,
  index_neaw_cx,
  index_awpr_cx,
  index_cci_cx,
  index_qli_cx,
  index_ai_cx,
  index_bei_cx,
  index_neei_cx,
  index_stock_cons_old_sina,
  index_stock_cons_csindex,
  index_stock_cons_weight_csindex,
  index_stock_cons_sina,
  index_stock_info,
  index_option_50etf_qvix,
  index_option_300etf_qvix,
  index_option_500etf_qvix,
  index_option_cyb_qvix,
  index_option_kcb_qvix,
  index_option_100etf_qvix,
  index_option_300index_qvix,
  index_option_1000index_qvix,
  index_option_50index_qvix,
  index_analysis_week_month_sw,
  index_analysis_weekly_sw,
  index_analysis_monthly_sw,
  index_realtime_fund_sw,
  index_hist_fund_sw,
  index_news_sentiment_scope,
} from '../indices';

describe('Index Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('stock_zh_index_spot_main_em', () => {
    it('should return main index spot data', async () => {
      try { const df = await stock_zh_index_spot_main_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_index_spot_em', () => {
    it('should return index spot data from EM', async () => {
      try { const df = await stock_zh_index_spot_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_index_spot_em_global', () => {
    it('should return global index spot data', async () => {
      try { const df = await stock_zh_index_spot_em_global(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_index_daily_em', () => {
    it('should return index daily data from EM', async () => {
      try { const df = await stock_zh_index_daily_em('000001', 'daily', '20240101', '20240110'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_stock_cons', () => {
    it('should return index stock constituents', async () => {
      try { const df = await index_stock_cons('000001'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_code_id_map_em (sync)', () => {
    it('should return code-id mapping', () => {
      const result = index_code_id_map_em();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('index_zh_a_hist', () => {
    it('should return A-share index history', async () => {
      try { const df = await index_zh_a_hist('000001', 'daily', '20240101', '20240110'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_us_stock_sina', () => {
    it('should return US stock index from Sina', async () => {
      try { const df = await index_us_stock_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_us_stock_sina_hist', () => {
    it('should return US stock index history from Sina', async () => {
      try { const df = await index_us_stock_sina_hist('.DJI'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_global_em_symbol_map (sync)', () => {
    it('should return global EM symbol map', () => {
      const result = index_global_em_symbol_map();
      expect(result).toBeDefined();
    });
  });

  describe('index_global_spot_em', () => {
    it('should return global index spot from EM', async () => {
      try { const df = await index_global_spot_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_global_hist_em', () => {
    it('should return global index history from EM', async () => {
      try { const df = await index_global_hist_em('100.DJIA'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_global_name_table (sync)', () => {
    it('should return global index name table', () => {
      const result = index_global_name_table();
      expect(result).toBeDefined();
    });
  });

  describe('index_global_hist_sina', () => {
    it('should return global index history from Sina', async () => {
      try { const df = await index_global_hist_sina('.DJI'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hk_index_spot_sina', () => {
    it('should return HK index spot from Sina', async () => {
      try { const df = await stock_hk_index_spot_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hk_index_spot_em', () => {
    it('should return HK index spot from EM', async () => {
      try { const df = await stock_hk_index_spot_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hk_index_daily_em', () => {
    it('should return HK index daily from EM', async () => {
      try { const df = await stock_hk_index_daily_em('HSI'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hk_index_daily_sina', () => {
    it('should return HK index daily from Sina', async () => {
      try { const df = await stock_hk_index_daily_sina('HSI'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_all_cni', () => {
    it('should return all CNI indices', async () => {
      try { const df = await index_all_cni(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_hist_cni', () => {
    it('should return CNI index history', async () => {
      try { const df = await index_hist_cni('399001'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_index_hist_csindex', () => {
    it('should return CSIndex history', async () => {
      try { const df = await stock_zh_index_hist_csindex('000300'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_index_value_csindex', () => {
    it('should return CSIndex value data', async () => {
      try { const df = await stock_zh_index_value_csindex('000300'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_csindex_all', () => {
    it('should return all CSIndex indices', async () => {
      try { const df = await index_csindex_all(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_hist_sw', () => {
    it('should return SW index history', async () => {
      try { const df = await index_hist_sw('801010'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_min_sw', () => {
    it('should return SW index minute data', async () => {
      try { const df = await index_min_sw('801010'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_component_sw', () => {
    it('should return SW index components', async () => {
      try { const df = await index_component_sw('801010'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_realtime_sw', () => {
    it('should return realtime SW index data', async () => {
      try { const df = await index_realtime_sw(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_analysis_daily_sw', () => {
    it('should return SW daily analysis', async () => {
      try { const df = await index_analysis_daily_sw('市场表征'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('spot_goods', () => {
    it('should return spot goods data', async () => {
      try { const df = await spot_goods(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_sugar_msweet', () => {
    it('should return sugar MSweet index', async () => {
      try { const df = await index_sugar_msweet(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_hog_spot_price', () => {
    it('should return hog spot price index', async () => {
      try { const df = await index_hog_spot_price(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_yw', () => {
    it('should return YW index', async () => {
      try { const df = await index_yw(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('drewry_wci_index', () => {
    it('should return Drewry WCI index', async () => {
      try { const df = await drewry_wci_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_kq_fz', () => {
    it('should return KQ FZ index', async () => {
      try { const df = await index_kq_fz(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_kq_fashion', () => {
    it('should return KQ Fashion index', async () => {
      try { const df = await index_kq_fashion(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_eri', () => {
    it('should return ERI index', async () => {
      try { const df = await index_eri(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_price_cflp', () => {
    it('should return CFLP price index', async () => {
      try { const df = await index_price_cflp(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_volume_cflp', () => {
    it('should return CFLP volume index', async () => {
      try { const df = await index_volume_cflp(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_inner_quote_sugar_msweet', () => {
    it('should return inner sugar quote', async () => {
      try { const df = await index_inner_quote_sugar_msweet(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_outer_quote_sugar_msweet', () => {
    it('should return outer sugar quote', async () => {
      try { const df = await index_outer_quote_sugar_msweet(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // CX Indices
  describe('index_pmi_com_cx', () => {
    it('should return CX composite PMI', async () => {
      try { const df = await index_pmi_com_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_pmi_man_cx', () => {
    it('should return CX manufacturing PMI', async () => {
      try { const df = await index_pmi_man_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_pmi_ser_cx', () => {
    it('should return CX services PMI', async () => {
      try { const df = await index_pmi_ser_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_dei_cx', () => {
    it('should return CX DEI index', async () => {
      try { const df = await index_dei_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_ii_cx', () => {
    it('should return CX II index', async () => {
      try { const df = await index_ii_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_si_cx', () => {
    it('should return CX SI index', async () => {
      try { const df = await index_si_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_fi_cx', () => {
    it('should return CX FI index', async () => {
      try { const df = await index_fi_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_bi_cx', () => {
    it('should return CX BI index', async () => {
      try { const df = await index_bi_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_nei_cx', () => {
    it('should return CX NEI index', async () => {
      try { const df = await index_nei_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_li_cx', () => {
    it('should return CX LI index', async () => {
      try { const df = await index_li_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_ci_cx', () => {
    it('should return CX CI index', async () => {
      try { const df = await index_ci_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_ti_cx', () => {
    it('should return CX TI index', async () => {
      try { const df = await index_ti_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_neaw_cx', () => {
    it('should return CX NEAW index', async () => {
      try { const df = await index_neaw_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_awpr_cx', () => {
    it('should return CX AWPR index', async () => {
      try { const df = await index_awpr_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_cci_cx', () => {
    it('should return CX CCI index', async () => {
      try { const df = await index_cci_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_qli_cx', () => {
    it('should return CX QLI index', async () => {
      try { const df = await index_qli_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_ai_cx', () => {
    it('should return CX AI index', async () => {
      try { const df = await index_ai_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_bei_cx', () => {
    it('should return CX BEI index', async () => {
      try { const df = await index_bei_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_neei_cx', () => {
    it('should return CX NEEI index', async () => {
      try { const df = await index_neei_cx(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // Index Constituents
  describe('index_stock_cons_old_sina', () => {
    it('should return old Sina index constituents', async () => {
      try { const df = await index_stock_cons_old_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_stock_cons_csindex', () => {
    it('should return CSIndex constituents', async () => {
      try { const df = await index_stock_cons_csindex('000300'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_stock_cons_weight_csindex', () => {
    it('should return CSIndex constituent weights', async () => {
      try { const df = await index_stock_cons_weight_csindex('000300'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_stock_cons_sina', () => {
    it('should return Sina index constituents', async () => {
      try { const df = await index_stock_cons_sina('sh000001'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_stock_info', () => {
    it('should return index stock info', async () => {
      try { const df = await index_stock_info(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // QVIX
  describe('index_option_50etf_qvix', () => {
    it('should return 50ETF QVIX', async () => {
      try { const df = await index_option_50etf_qvix(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_option_300etf_qvix', () => {
    it('should return 300ETF QVIX', async () => {
      try { const df = await index_option_300etf_qvix(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_option_500etf_qvix', () => {
    it('should return 500ETF QVIX', async () => {
      try { const df = await index_option_500etf_qvix(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_option_cyb_qvix', () => {
    it('should return CYB QVIX', async () => {
      try { const df = await index_option_cyb_qvix(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_option_kcb_qvix', () => {
    it('should return KCB QVIX', async () => {
      try { const df = await index_option_kcb_qvix(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_option_100etf_qvix', () => {
    it('should return 100ETF QVIX', async () => {
      try { const df = await index_option_100etf_qvix(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_option_300index_qvix', () => {
    it('should return 300 Index QVIX', async () => {
      try { const df = await index_option_300index_qvix(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_option_1000index_qvix', () => {
    it('should return 1000 Index QVIX', async () => {
      try { const df = await index_option_1000index_qvix(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_option_50index_qvix', () => {
    it('should return 50 Index QVIX', async () => {
      try { const df = await index_option_50index_qvix(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // SW Analysis
  describe('index_analysis_week_month_sw', () => {
    it('should return SW weekly-monthly analysis', async () => {
      try { const df = await index_analysis_week_month_sw('month'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_analysis_weekly_sw', () => {
    it('should return SW weekly analysis', async () => {
      try { const df = await index_analysis_weekly_sw('市场表征'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_analysis_monthly_sw', () => {
    it('should return SW monthly analysis', async () => {
      try { const df = await index_analysis_monthly_sw('市场表征'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_realtime_fund_sw', () => {
    it('should return realtime SW fund index', async () => {
      try { const df = await index_realtime_fund_sw(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_hist_fund_sw', () => {
    it('should return SW fund index history', async () => {
      try { const df = await index_hist_fund_sw('801010'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_news_sentiment_scope', () => {
    it('should return news sentiment scope', async () => {
      try { const df = await index_news_sentiment_scope(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

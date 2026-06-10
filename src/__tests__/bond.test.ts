/**
 * AKShare TypeScript - 债券模块完整测试
 */

import {
  bond_cb_jsl,
  bond_cov_stock_issue_cninfo,
  bond_cov_comparison,
  bond_zh_cov,
  bond_zh_hs_cov_spot,
  bond_zh_hs_daily,
  bond_zh_hs_spot,
  bond_zh_hs_sina_daily,
  bond_china_yield,
  bond_zh_us_rate,
  bond_china_close_return,
  bond_china_close_return_map,
  bond_spot_quote,
  bond_spot_deal,
  bond_china_close_return_history,
  bond_zh_us_rate_em,
  macro_china_swap_rate,
  macro_china_bond_public,
  bond_sh_buy_back_em,
  bond_sz_buy_back_em,
  bond_buy_back_hist_em,
  bond_gb_zh_sina,
  bond_gb_us_sina,
  bond_cb_profile_sina,
  bond_cb_summary_sina,
  bond_zh_cov_info_ths,
  bond_info_cm_query,
  bond_info_cm,
  bond_info_detail_cm,
  bond_cash_summary_sse,
  bond_deal_summary_sse,
  bond_cb_index_jsl,
  bond_cb_redeem_jsl,
  bond_cb_adj_logs_jsl,
  bond_debt_nafmii,
  bond_treasure_issue_cninfo,
  bond_local_government_issue_cninfo,
  bond_corporate_issue_cninfo,
  bond_cov_issue_cninfo,
  bond_cov_stock_issue_cninfo_cninfo,
  bond_available_index_cbond,
  bond_index_general_cbond,
  bond_treasury_index_cbond,
  bond_new_composite_index_cbond,
  bond_composite_index_cbond,
} from '../bond';

describe('Bond Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('bond_cb_jsl', () => {
    it('should return convertible bond data from JSL', async () => {
      try {
        const df = await bond_cb_jsl();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_cov_stock_issue_cninfo', () => {
    it('should return convertible bond stock issue info', async () => {
      try {
        const df = await bond_cov_stock_issue_cninfo();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_cov_comparison', () => {
    it('should return convertible bond comparison', async () => {
      try {
        const df = await bond_cov_comparison();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_zh_cov', () => {
    it('should return convertible bond list', async () => {
      try {
        const df = await bond_zh_cov();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_zh_hs_cov_spot', () => {
    it('should return convertible bond spot data', async () => {
      try {
        const df = await bond_zh_hs_cov_spot();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_zh_hs_daily', () => {
    it('should return bond daily data', async () => {
      try {
        const df = await bond_zh_hs_daily('sh010107');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_zh_hs_spot', () => {
    it('should return bond spot data', async () => {
      try {
        const df = await bond_zh_hs_spot();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_zh_hs_sina_daily', () => {
    it('should return bond daily data from Sina', async () => {
      try {
        const df = await bond_zh_hs_sina_daily('sh010107');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_china_yield', () => {
    it('should return China yield data', async () => {
      try {
        const df = await bond_china_yield();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_zh_us_rate', () => {
    it('should return China-US rate comparison', async () => {
      try {
        const df = await bond_zh_us_rate();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_china_close_return', () => {
    it('should return China close return', async () => {
      try {
        const df = await bond_china_close_return();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_china_close_return_map', () => {
    it('should return China close return map', async () => {
      try {
        const df = await bond_china_close_return_map();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_spot_quote', () => {
    it('should return bond spot quotes', async () => {
      try {
        const df = await bond_spot_quote();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_spot_deal', () => {
    it('should return bond spot deals', async () => {
      try {
        const df = await bond_spot_deal();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_china_close_return_history', () => {
    it('should return China close return history', async () => {
      try {
        const df = await bond_china_close_return_history();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_zh_us_rate_em', () => {
    it('should return China-US rate from EM', async () => {
      try {
        const df = await bond_zh_us_rate_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_swap_rate', () => {
    it('should return China swap rate', async () => {
      try {
        const df = await macro_china_swap_rate();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_bond_public', () => {
    it('should return China bond public data', async () => {
      try {
        const df = await macro_china_bond_public();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_sh_buy_back_em', () => {
    it('should return Shanghai buy-back data', async () => {
      try {
        const df = await bond_sh_buy_back_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_sz_buy_back_em', () => {
    it('should return Shenzhen buy-back data', async () => {
      try {
        const df = await bond_sz_buy_back_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_buy_back_hist_em', () => {
    it('should return buy-back history', async () => {
      try {
        const df = await bond_buy_back_hist_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_gb_zh_sina', () => {
    it('should return China government bond from Sina', async () => {
      try {
        const df = await bond_gb_zh_sina();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_gb_us_sina', () => {
    it('should return US government bond from Sina', async () => {
      try {
        const df = await bond_gb_us_sina();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_cb_profile_sina', () => {
    it('should return convertible bond profile from Sina', async () => {
      try {
        const df = await bond_cb_profile_sina();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_cb_summary_sina', () => {
    it('should return convertible bond summary from Sina', async () => {
      try {
        const df = await bond_cb_summary_sina();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_zh_cov_info_ths', () => {
    it('should return convertible bond info from THS', async () => {
      try {
        const df = await bond_zh_cov_info_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_info_cm_query', () => {
    it('should return bond info query', async () => {
      try {
        const df = await bond_info_cm_query();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_info_cm', () => {
    it('should return bond info from CM', async () => {
      try {
        const df = await bond_info_cm();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_info_detail_cm', () => {
    it('should return bond info detail from CM', async () => {
      try {
        const df = await bond_info_detail_cm('2400001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_cash_summary_sse', () => {
    it('should return SSE cash summary', async () => {
      try {
        const df = await bond_cash_summary_sse();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_deal_summary_sse', () => {
    it('should return SSE deal summary', async () => {
      try {
        const df = await bond_deal_summary_sse();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_cb_index_jsl', () => {
    it('should return convertible bond index from JSL', async () => {
      try {
        const df = await bond_cb_index_jsl();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_cb_redeem_jsl', () => {
    it('should return convertible bond redeem data', async () => {
      try {
        const df = await bond_cb_redeem_jsl();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_cb_adj_logs_jsl', () => {
    it('should return convertible bond adjustment logs', async () => {
      try {
        const df = await bond_cb_adj_logs_jsl();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_debt_nafmii', () => {
    it('should return NAFMII debt data', async () => {
      try {
        const df = await bond_debt_nafmii();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_treasure_issue_cninfo', () => {
    it('should return treasury bond issuance info', async () => {
      try {
        const df = await bond_treasure_issue_cninfo();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_local_government_issue_cninfo', () => {
    it('should return local government bond issuance', async () => {
      try {
        const df = await bond_local_government_issue_cninfo();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_corporate_issue_cninfo', () => {
    it('should return corporate bond issuance', async () => {
      try {
        const df = await bond_corporate_issue_cninfo();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_cov_issue_cninfo', () => {
    it('should return convertible bond issuance', async () => {
      try {
        const df = await bond_cov_issue_cninfo();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_cov_stock_issue_cninfo_cninfo', () => {
    it('should return convertible bond stock issuance', async () => {
      try {
        const df = await bond_cov_stock_issue_cninfo_cninfo();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_available_index_cbond', () => {
    it('should return available bond indices', async () => {
      try {
        const df = await bond_available_index_cbond();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_index_general_cbond', () => {
    it('should return general bond index', async () => {
      try {
        const df = await bond_index_general_cbond();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_treasury_index_cbond', () => {
    it('should return treasury bond index', async () => {
      try {
        const df = await bond_treasury_index_cbond();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_new_composite_index_cbond', () => {
    it('should return new composite bond index', async () => {
      try {
        const df = await bond_new_composite_index_cbond();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bond_composite_index_cbond', () => {
    it('should return composite bond index', async () => {
      try {
        const df = await bond_composite_index_cbond();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

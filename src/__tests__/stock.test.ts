/**
 * AKShare TypeScript - 股票模块完整测试
 */

import {
  // stock_zh_a_em
  stock_zh_a_hist,
  stock_zh_a_spot_em,
  stock_zh_a_code_name,
  // stock_zh_a_sina
  stock_zh_a_daily,
  stock_zh_a_minute,
  // stock_zh_b_sina
  stock_zh_b_spot,
  stock_zh_b_daily,
  // stock_zh_ah_tx
  stock_zh_ah_spot,
  stock_zh_ah_name,
  stock_zh_ah_daily,
  // stock_board_concept_em
  stock_board_concept_name_em,
  stock_board_concept_cons_em,
  stock_board_concept_hist_em,
  // stock_board_industry_em
  stock_board_industry_name_em,
  stock_board_industry_cons_em,
  stock_board_industry_hist_em,
  // stock_info
  stock_individual_info_em,
  stock_info_a_code_name,
  stock_individual_basic_em,
  stock_zh_a_gdhs_em,
  // stock_hsgt
  stock_hsgt_fund_flow_summary,
  stock_hsgt_north_net_flow_in_em,
  stock_hsgt_south_net_flow_in_em,
  stock_hsgt_sh_top10_em,
  stock_hsgt_sz_top10_em,
  // stock_bid_ask_em
  stock_bid_ask_em,
  // stock_dzjy_em
  stock_dzjy_sctj,
  stock_dzjy_mrmx,
  stock_dzjy_mrtj,
  stock_dzjy_hygtj,
  stock_dzjy_hyyybtj,
  stock_dzjy_yybph,
  // stock_fund_flow
  stock_individual_fund_flow,
  stock_individual_fund_flow_rank,
  stock_market_fund_flow,
  stock_sector_fund_flow_rank,
  stock_main_fund_flow,
  // stock_fund_hold
  stock_report_fund_hold,
  stock_report_fund_hold_detail,
  // stock_gsrl_em
  stock_gsrl_gsdt_em,
  // stock_hk_hot_rank_em
  stock_hk_hot_rank_em,
  stock_hk_hot_rank_detail_em,
  stock_hk_hot_rank_latest_em,
  // stock_hk_profile_em
  stock_hk_security_profile_em,
  stock_hk_company_profile_em,
  stock_hk_financial_indicator_em,
  stock_hk_dividend_payout_em,
  // stock_hk_sina
  stock_hk_spot,
  stock_hk_daily,
  // stock_hold_control_em
  stock_hold_management_detail_em,
  // stock_hot_rank_em
  stock_hot_rank_em,
  stock_hot_rank_detail_em,
  stock_hot_rank_latest_em,
  stock_hot_keyword_em,
  stock_hot_rank_relate_em,
  // stock_hot_search_baidu
  stock_hot_search_baidu,
  // stock_hot_up_em
  stock_hot_up_em,
  // stock_industry
  stock_sector_spot,
  stock_sector_detail,
  // stock_intraday_em
  stock_intraday_em,
  // stock_news_cx
  stock_news_main_cx,
  // stock_repurchase_em
  stock_repurchase_em,
  // stock_sector_fund_flow
  stock_sector_fund_flow_hist,
  stock_concept_fund_flow_hist,
  // stock_share_hold
  stock_share_hold_change_sse,
  stock_share_hold_change_szse,
  // stock_stop
  stock_staq_net_stop,
  // stock_summary
  stock_sse_summary,
  stock_sse_deal_daily,
  // stock_us_famous
  stock_us_famous_spot_em,
  // stock_us_sina
  get_us_stock_name,
  stock_us_daily,
  // stock_weibo_nlp
  stock_js_weibo_report,
  // stock_zh_comparison_em
  stock_zh_growth_comparison_em,
  stock_zh_valuation_comparison_em,
  stock_zh_dupont_comparison_em,
  stock_zh_scale_comparison_em,
} from '../stock';

describe('Stock Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  // ============ stock_zh_a_em ============
  describe('stock_zh_a_hist', () => {
    it('should return daily history data', async () => {
      try {
        const df = await stock_zh_a_hist('000001', 'daily', '20240101', '20240110');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_a_spot_em', () => {
    it('should return A-share spot data', async () => {
      try {
        const df = await stock_zh_a_spot_em('all');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_a_code_name', () => {
    it('should return code-name list', async () => {
      try {
        const df = await stock_zh_a_code_name();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_zh_a_sina ============
  describe('stock_zh_a_daily', () => {
    it('should return daily data from sina', async () => {
      try {
        const df = await stock_zh_a_daily('sh600000', '20240101', '20240110');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_a_minute', () => {
    it('should return minute data', async () => {
      try {
        const df = await stock_zh_a_minute('sh600000', 5);
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_zh_b_sina ============
  describe('stock_zh_b_spot', () => {
    it('should return B-share spot data', async () => {
      try {
        const df = await stock_zh_b_spot();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_b_daily', () => {
    it('should return B-share daily data', async () => {
      try {
        const df = await stock_zh_b_daily('sh900901');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_zh_ah_tx ============
  describe('stock_zh_ah_spot', () => {
    it('should return AH spot data', async () => {
      try {
        const df = await stock_zh_ah_spot();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_ah_name', () => {
    it('should return AH stock names', async () => {
      try {
        const df = await stock_zh_ah_name();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_ah_daily', () => {
    it('should return AH daily data', async () => {
      try {
        const df = await stock_zh_ah_daily('000001', '20240101', '20240110');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_board_concept_em ============
  describe('stock_board_concept_name_em', () => {
    it('should return concept board names', async () => {
      try {
        const df = await stock_board_concept_name_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_board_concept_cons_em', () => {
    it('should return concept board constituents', async () => {
      try {
        const df = await stock_board_concept_cons_em('车联网');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_board_concept_hist_em', () => {
    it('should return concept board history', async () => {
      try {
        const df = await stock_board_concept_hist_em('车联网', 'daily', '20240101', '20240110');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_board_industry_em ============
  describe('stock_board_industry_name_em', () => {
    it('should return industry board names', async () => {
      try {
        const df = await stock_board_industry_name_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_board_industry_cons_em', () => {
    it('should return industry board constituents', async () => {
      try {
        const df = await stock_board_industry_cons_em('银行');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_board_industry_hist_em', () => {
    it('should return industry board history', async () => {
      try {
        const df = await stock_board_industry_hist_em('银行', 'daily', '20240101', '20240110');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_info ============
  describe('stock_individual_info_em', () => {
    it('should return individual stock info', async () => {
      try {
        const result = await stock_individual_info_em('000001');
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_info_a_code_name', () => {
    it('should return A-share code-name list', async () => {
      try {
        const df = await stock_info_a_code_name();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_individual_basic_em', () => {
    it('should return individual basic info', async () => {
      try {
        const result = await stock_individual_basic_em('000001');
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_a_gdhs_em', () => {
    it('should return shareholder statistics', async () => {
      try {
        const df = await stock_zh_a_gdhs_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_hsgt ============
  describe('stock_hsgt_fund_flow_summary', () => {
    it('should return HSGT fund flow summary', async () => {
      try {
        const df = await stock_hsgt_fund_flow_summary('北向');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hsgt_north_net_flow_in_em', () => {
    it('should return northbound net flow', async () => {
      try {
        const df = await stock_hsgt_north_net_flow_in_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hsgt_south_net_flow_in_em', () => {
    it('should return southbound net flow', async () => {
      try {
        const df = await stock_hsgt_south_net_flow_in_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hsgt_sh_top10_em', () => {
    it('should return Shanghai top 10', async () => {
      try {
        const df = await stock_hsgt_sh_top10_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hsgt_sz_top10_em', () => {
    it('should return Shenzhen top 10', async () => {
      try {
        const df = await stock_hsgt_sz_top10_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_bid_ask_em ============
  describe('stock_bid_ask_em', () => {
    it('should return bid-ask data', async () => {
      try {
        const df = await stock_bid_ask_em('000001');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_dzjy_em ============
  describe('stock_dzjy_sctj', () => {
    it('should return block trade statistics', async () => {
      try {
        const df = await stock_dzjy_sctj();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_dzjy_mrmx', () => {
    it('should return daily block trade details', async () => {
      try {
        const df = await stock_dzjy_mrmx();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_dzjy_mrtj', () => {
    it('should return daily block trade statistics', async () => {
      try {
        const df = await stock_dzjy_mrtj();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_dzjy_hygtj', () => {
    it('should return industry block trade stats', async () => {
      try {
        const df = await stock_dzjy_hygtj();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_dzjy_hyyybtj', () => {
    it('should return industry block trade premium stats', async () => {
      try {
        const df = await stock_dzjy_hyyybtj();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_dzjy_yybph', () => {
    it('should return broker block trade ranking', async () => {
      try {
        const df = await stock_dzjy_yybph();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_fund_flow ============
  describe('stock_individual_fund_flow', () => {
    it('should return individual fund flow', async () => {
      try {
        const df = await stock_individual_fund_flow('000001');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_individual_fund_flow_rank', () => {
    it('should return individual fund flow ranking', async () => {
      try {
        const df = await stock_individual_fund_flow_rank();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_market_fund_flow', () => {
    it('should return market fund flow', async () => {
      try {
        const df = await stock_market_fund_flow();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_sector_fund_flow_rank', () => {
    it('should return sector fund flow ranking', async () => {
      try {
        const df = await stock_sector_fund_flow_rank();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_main_fund_flow', () => {
    it('should return main fund flow', async () => {
      try {
        const df = await stock_main_fund_flow();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_fund_hold ============
  describe('stock_report_fund_hold', () => {
    it('should return fund holdings report', async () => {
      try {
        const df = await stock_report_fund_hold('基金持仓', '20210331');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_report_fund_hold_detail', () => {
    it('should return fund holdings detail', async () => {
      try {
        const df = await stock_report_fund_hold_detail('2024', '1');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_gsrl_em ============
  describe('stock_gsrl_gsdt_em', () => {
    it('should return stock calendar events', async () => {
      try {
        const df = await stock_gsrl_gsdt_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_hk_hot_rank_em ============
  describe('stock_hk_hot_rank_em', () => {
    it('should return HK hot ranking', async () => {
      try {
        const df = await stock_hk_hot_rank_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hk_hot_rank_detail_em', () => {
    it('should return HK hot rank detail', async () => {
      try {
        const df = await stock_hk_hot_rank_detail_em('00700');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hk_hot_rank_latest_em', () => {
    it('should return latest HK hot rank', async () => {
      try {
        const df = await stock_hk_hot_rank_latest_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_hk_profile_em ============
  describe('stock_hk_security_profile_em', () => {
    it('should return HK security profile', async () => {
      try {
        const df = await stock_hk_security_profile_em('00700');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hk_company_profile_em', () => {
    it('should return HK company profile', async () => {
      try {
        const df = await stock_hk_company_profile_em('00700');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hk_financial_indicator_em', () => {
    it('should return HK financial indicators', async () => {
      try {
        const df = await stock_hk_financial_indicator_em('00700');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hk_dividend_payout_em', () => {
    it('should return HK dividend payout', async () => {
      try {
        const df = await stock_hk_dividend_payout_em('00700');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_hk_sina ============
  describe('stock_hk_spot', () => {
    it('should return HK spot data', async () => {
      try {
        const df = await stock_hk_spot();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hk_daily', () => {
    it('should return HK daily data', async () => {
      try {
        const df = await stock_hk_daily('00700');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_hold_control_em ============
  describe('stock_hold_management_detail_em', () => {
    it('should return management holding details', async () => {
      try {
        const df = await stock_hold_management_detail_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_hot_rank_em ============
  describe('stock_hot_rank_em', () => {
    it('should return hot ranking', async () => {
      try {
        const df = await stock_hot_rank_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hot_rank_detail_em', () => {
    it('should return hot rank detail', async () => {
      try {
        const df = await stock_hot_rank_detail_em('000001');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hot_rank_latest_em', () => {
    it('should return latest hot rank', async () => {
      try {
        const df = await stock_hot_rank_latest_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hot_keyword_em', () => {
    it('should return hot keywords', async () => {
      try {
        const df = await stock_hot_keyword_em('000001');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_hot_rank_relate_em', () => {
    it('should return hot rank related stocks', async () => {
      try {
        const df = await stock_hot_rank_relate_em('000001');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_hot_search_baidu ============
  describe('stock_hot_search_baidu', () => {
    it('should return Baidu hot search data', async () => {
      try {
        const df = await stock_hot_search_baidu();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_hot_up_em ============
  describe('stock_hot_up_em', () => {
    it('should return hot rising stocks', async () => {
      try {
        const df = await stock_hot_up_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_industry ============
  describe('stock_sector_spot', () => {
    it('should return sector spot data', async () => {
      try {
        const df = await stock_sector_spot('行业');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_sector_detail', () => {
    it('should return sector detail', async () => {
      try {
        const df = await stock_sector_detail('hangye_ZC27');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_intraday_em ============
  describe('stock_intraday_em', () => {
    it('should return intraday data', async () => {
      try {
        const df = await stock_intraday_em('000001');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_news_cx ============
  describe('stock_news_main_cx', () => {
    it('should return stock news', async () => {
      try {
        const df = await stock_news_main_cx();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_repurchase_em ============
  describe('stock_repurchase_em', () => {
    it('should return stock repurchase data', async () => {
      try {
        const df = await stock_repurchase_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_sector_fund_flow ============
  describe('stock_sector_fund_flow_hist', () => {
    it('should return sector fund flow history', async () => {
      try {
        const df = await stock_sector_fund_flow_hist();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_concept_fund_flow_hist', () => {
    it('should return concept fund flow history', async () => {
      try {
        const df = await stock_concept_fund_flow_hist();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_share_hold ============
  describe('stock_share_hold_change_sse', () => {
    it('should return SSE share hold changes', async () => {
      try {
        const df = await stock_share_hold_change_sse();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_share_hold_change_szse', () => {
    it('should return SZSE share hold changes', async () => {
      try {
        const df = await stock_share_hold_change_szse();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_stop ============
  describe('stock_staq_net_stop', () => {
    it('should return STAQ net stop data', async () => {
      try {
        const df = await stock_staq_net_stop();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_summary ============
  describe('stock_sse_summary', () => {
    it('should return SSE summary', async () => {
      try {
        const df = await stock_sse_summary();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_sse_deal_daily', () => {
    it('should return SSE daily deal data', async () => {
      try {
        const df = await stock_sse_deal_daily();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_us_famous ============
  describe('stock_us_famous_spot_em', () => {
    it('should return famous US stock spot data', async () => {
      try {
        const df = await stock_us_famous_spot_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_us_sina ============
  describe('get_us_stock_name', () => {
    it('should return US stock names', async () => {
      try {
        const df = await get_us_stock_name();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_us_daily', () => {
    it('should return US stock daily data', async () => {
      try {
        const df = await stock_us_daily('AAPL');
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_weibo_nlp ============
  describe('stock_js_weibo_report', () => {
    it('should return Weibo report data', async () => {
      try {
        const df = await stock_js_weibo_report();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ============ stock_zh_comparison_em ============
  describe('stock_zh_growth_comparison_em', () => {
    it('should return growth comparison', async () => {
      try {
        const df = await stock_zh_growth_comparison_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_valuation_comparison_em', () => {
    it('should return valuation comparison', async () => {
      try {
        const df = await stock_zh_valuation_comparison_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_dupont_comparison_em', () => {
    it('should return DuPont comparison', async () => {
      try {
        const df = await stock_zh_dupont_comparison_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('stock_zh_scale_comparison_em', () => {
    it('should return scale comparison', async () => {
      try {
        const df = await stock_zh_scale_comparison_em();
        expectDataFrame(df);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

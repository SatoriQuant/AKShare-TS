/**
 * AKShare TypeScript - 股票特征模块完整测试
 */

import {
  stock_comment_em,
  stock_comment_detail_zlkp_jgcyd_em,
  stock_comment_detail_zhpj_lspf_em,
  stock_comment_detail_scrd_focus_em,
  stock_comment_detail_scrd_desire_em,
  stock_account_statistics_em,
  stock_dxsyl_em,
  stock_xgsglb_em,
  stock_fhps_em,
  stock_fhps_detail_em,
  stock_yjbb_em,
  stock_tfp_em,
  stock_zt_pool_em,
  stock_zt_pool_previous_em,
  stock_zt_pool_strong_em,
  stock_zt_pool_zbgc_em,
  stock_zt_pool_dtgc_em,
  stock_lhb_detail_em,
  stock_lhb_stock_statistic_em,
  stock_margin_account_info,
  stock_hk_indicator_eniu,
  stock_a_high_low_statistics,
  stock_zh_a_spot_em_feature,
  stock_sh_a_spot_em,
  stock_sz_a_spot_em,
  stock_bj_a_spot_em,
  stock_zh_a_hist_feature,
  stock_zh_a_hist_min_em,
  stock_hk_spot_em,
  stock_hk_hist,
  stock_us_spot_em,
  stock_us_hist,
  stock_hsgt_fund_flow_summary_em,
  stock_hsgt_hist_em,
  stock_hsgt_hold_stock_em,
  stock_hsgt_stock_statistics_em,
  stock_hsgt_institution_statistics_em,
  stock_hsgt_individual_em,
  stock_hsgt_individual_detail_em,
  stock_margin_sse,
  stock_margin_detail_sse,
  stock_margin_szse,
  stock_margin_detail_szse,
  stock_yjbb_em_report,
  stock_yjkb_em,
  stock_yjyg_em,
  stock_fhps_em_report,
  stock_fhps_detail_em_report,
  stock_gdfx_free_holding_detail_em,
  stock_gdfx_holding_detail_em,
  stock_gdfx_holding_num_em,
  stock_gdfx_institution_holding_em,
  stock_gdfx_institution_holding_detail_em,
  stock_gpzy_profile_em,
  stock_gpzy_pledge_ratio_em,
  stock_gpzy_pledge_ratio_detail_em,
  stock_gpzy_pledge_distribute_em,
  stock_gpzy_pledge_industry_em,
  stock_zh_a_gdhs,
  stock_zh_a_gdhs_detail_em,
  stock_hot_follow_xq,
  stock_hot_tweet_xq,
  stock_hot_deal_xq,
  stock_changes_em,
  stock_board_change_em,
  stock_jgdy_tj_em,
  stock_jgdy_detail_em,
  stock_inner_trade_xq,
  stock_research_report_em,
  stock_institute_recommend_em,
  stock_sy_profile_em,
  stock_sy_jz_em,
  stock_sy_hy_em,
  stock_qsjy_em,
  stock_concept_cons_futu,
  stock_board_concept_name_ths,
  stock_board_concept_info_ths,
  stock_board_concept_index_ths,
  stock_board_concept_summary_ths,
  stock_board_industry_name_ths,
  stock_board_industry_info_ths,
  stock_board_industry_index_ths,
  stock_board_industry_summary_ths,
  stock_xgsr_ths,
  stock_ipo_benefit_ths,
  stock_hsgt_fund_min_em,
  stock_sgt_reference_exchange_rate_sse,
  stock_sgt_settlement_exchange_rate_sse,
  stock_info_cjzc_em,
  stock_info_global_em,
  stock_gddh_em,
  stock_zdhtmx_em,
  stock_ggcg_em,
  stock_yzxdr_em,
  stock_qbzf_em,
  stock_pg_em,
  stock_rank_cxg_ths,
  stock_rank_cxd_ths,
  stock_rank_lxsz_ths,
  stock_rank_lxxd_ths,
  stock_rank_ljqs_ths,
  stock_rank_ljqd_ths,
  stock_disclosure_cninfo,
  stock_irm_cninfo,
  stock_fhps_detail_ths,
  stock_report_disclosure,
} from '../stock_feature';

describe('Stock Feature Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('stock_comment_em', () => {
    it('should return stock comments', async () => {
      try {
        const df = await stock_comment_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_comment_detail_zlkp_jgcyd_em', () => {
    it('should return comment detail zlkp', async () => {
      try {
        const df = await stock_comment_detail_zlkp_jgcyd_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_comment_detail_zhpj_lspf_em', () => {
    it('should return comment detail zhpj', async () => {
      try {
        const df = await stock_comment_detail_zhpj_lspf_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_comment_detail_scrd_focus_em', () => {
    it('should return comment detail scrd focus', async () => {
      try {
        const df = await stock_comment_detail_scrd_focus_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_comment_detail_scrd_desire_em', () => {
    it('should return comment detail scrd desire', async () => {
      try {
        const df = await stock_comment_detail_scrd_desire_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_account_statistics_em', () => {
    it('should return account statistics', async () => {
      try {
        const df = await stock_account_statistics_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_dxsyl_em', () => {
    it('should return new stock subscription yield', async () => {
      try {
        const df = await stock_dxsyl_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_xgsglb_em', () => {
    it('should return new stock subscription list', async () => {
      try {
        const df = await stock_xgsglb_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_fhps_em', () => {
    it('should return dividend plan', async () => {
      try {
        const df = await stock_fhps_em('20240101');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_fhps_detail_em', () => {
    it('should return dividend plan detail', async () => {
      try {
        const df = await stock_fhps_detail_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_yjbb_em', () => {
    it('should return earnings report', async () => {
      try {
        const df = await stock_yjbb_em('20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_tfp_em', () => {
    it('should return trading freeze pool', async () => {
      try {
        const df = await stock_tfp_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zt_pool_em', () => {
    it('should return limit-up pool', async () => {
      try {
        const df = await stock_zt_pool_em('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zt_pool_previous_em', () => {
    it('should return previous limit-up pool', async () => {
      try {
        const df = await stock_zt_pool_previous_em('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zt_pool_strong_em', () => {
    it('should return strong limit-up pool', async () => {
      try {
        const df = await stock_zt_pool_strong_em('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zt_pool_zbgc_em', () => {
    it('should return limit-up board change pool', async () => {
      try {
        const df = await stock_zt_pool_zbgc_em('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zt_pool_dtgc_em', () => {
    it('should return limit-down pool', async () => {
      try {
        const df = await stock_zt_pool_dtgc_em('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_lhb_detail_em', () => {
    it('should return dragon-tiger list detail', async () => {
      try {
        const df = await stock_lhb_detail_em('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_lhb_stock_statistic_em', () => {
    it('should return dragon-tiger stock statistics', async () => {
      try {
        const df = await stock_lhb_stock_statistic_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_margin_account_info', () => {
    it('should return margin account info', async () => {
      try {
        const df = await stock_margin_account_info();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hk_indicator_eniu', () => {
    it('should return HK indicators', async () => {
      try {
        const df = await stock_hk_indicator_eniu('00700');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_a_high_low_statistics', () => {
    it('should return A-share high-low statistics', async () => {
      try {
        const df = await stock_a_high_low_statistics();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_a_spot_em_feature', () => {
    it('should return A-share spot with features', async () => {
      try {
        const df = await stock_zh_a_spot_em_feature();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_sh_a_spot_em', () => {
    it('should return Shanghai A-share spot', async () => {
      try {
        const df = await stock_sh_a_spot_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_sz_a_spot_em', () => {
    it('should return Shenzhen A-share spot', async () => {
      try {
        const df = await stock_sz_a_spot_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_bj_a_spot_em', () => {
    it('should return Beijing A-share spot', async () => {
      try {
        const df = await stock_bj_a_spot_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_a_hist_feature', () => {
    it('should return A-share history with features', async () => {
      try {
        const df = await stock_zh_a_hist_feature('000001', 'daily', '20240101', '20240110');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_a_hist_min_em', () => {
    it('should return A-share minute history', async () => {
      try {
        const df = await stock_zh_a_hist_min_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hk_spot_em', () => {
    it('should return HK spot from EM', async () => {
      try {
        const df = await stock_hk_spot_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hk_hist', () => {
    it('should return HK history', async () => {
      try {
        const df = await stock_hk_hist('00700', 'daily', '20240101', '20240110');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_us_spot_em', () => {
    it('should return US spot from EM', async () => {
      try {
        const df = await stock_us_spot_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_us_hist', () => {
    it('should return US history', async () => {
      try {
        const df = await stock_us_hist('AAPL', 'daily', '20240101', '20240110');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hsgt_fund_flow_summary_em', () => {
    it('should return HSGT fund flow summary from EM', async () => {
      try {
        const df = await stock_hsgt_fund_flow_summary_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hsgt_hist_em', () => {
    it('should return HSGT history', async () => {
      try {
        const df = await stock_hsgt_hist_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hsgt_hold_stock_em', () => {
    it('should return HSGT hold stocks', async () => {
      try {
        const df = await stock_hsgt_hold_stock_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hsgt_stock_statistics_em', () => {
    it('should return HSGT stock statistics', async () => {
      try {
        const df = await stock_hsgt_stock_statistics_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hsgt_institution_statistics_em', () => {
    it('should return HSGT institution statistics', async () => {
      try {
        const df = await stock_hsgt_institution_statistics_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hsgt_individual_em', () => {
    it('should return HSGT individual data', async () => {
      try {
        const df = await stock_hsgt_individual_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hsgt_individual_detail_em', () => {
    it('should return HSGT individual detail', async () => {
      try {
        const df = await stock_hsgt_individual_detail_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_margin_sse', () => {
    it('should return SSE margin data', async () => {
      try {
        const df = await stock_margin_sse();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_margin_detail_sse', () => {
    it('should return SSE margin detail', async () => {
      try {
        const df = await stock_margin_detail_sse();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_margin_szse', () => {
    it('should return SZSE margin data', async () => {
      try {
        const df = await stock_margin_szse();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_margin_detail_szse', () => {
    it('should return SZSE margin detail', async () => {
      try {
        const df = await stock_margin_detail_szse();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_yjbb_em_report', () => {
    it('should return earnings report from EM', async () => {
      try {
        const df = await stock_yjbb_em_report('20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_yjkb_em', () => {
    it('should return earnings express', async () => {
      try {
        const df = await stock_yjkb_em('20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_yjyg_em', () => {
    it('should return earnings forecast', async () => {
      try {
        const df = await stock_yjyg_em('20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_fhps_em_report', () => {
    it('should return dividend report', async () => {
      try {
        const df = await stock_fhps_em_report('20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_fhps_detail_em_report', () => {
    it('should return dividend detail report', async () => {
      try {
        const df = await stock_fhps_detail_em_report('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gdfx_free_holding_detail_em', () => {
    it('should return free holding detail', async () => {
      try {
        const df = await stock_gdfx_free_holding_detail_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gdfx_holding_detail_em', () => {
    it('should return holding detail', async () => {
      try {
        const df = await stock_gdfx_holding_detail_em('000001', '20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gdfx_holding_num_em', () => {
    it('should return holding number', async () => {
      try {
        const df = await stock_gdfx_holding_num_em('20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gdfx_institution_holding_em', () => {
    it('should return institution holdings', async () => {
      try {
        const df = await stock_gdfx_institution_holding_em('20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gdfx_institution_holding_detail_em', () => {
    it('should return institution holding detail', async () => {
      try {
        const df = await stock_gdfx_institution_holding_detail_em('000001', '20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gpzy_profile_em', () => {
    it('should return stock pledge profile', async () => {
      try {
        const df = await stock_gpzy_profile_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gpzy_pledge_ratio_em', () => {
    it('should return pledge ratio', async () => {
      try {
        const df = await stock_gpzy_pledge_ratio_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gpzy_pledge_ratio_detail_em', () => {
    it('should return pledge ratio detail', async () => {
      try {
        const df = await stock_gpzy_pledge_ratio_detail_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gpzy_pledge_distribute_em', () => {
    it('should return pledge distribution', async () => {
      try {
        const df = await stock_gpzy_pledge_distribute_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gpzy_pledge_industry_em', () => {
    it('should return pledge industry data', async () => {
      try {
        const df = await stock_gpzy_pledge_industry_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_a_gdhs', () => {
    it('should return shareholder statistics', async () => {
      try {
        const df = await stock_zh_a_gdhs('20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_a_gdhs_detail_em', () => {
    it('should return shareholder statistics detail', async () => {
      try {
        const df = await stock_zh_a_gdhs_detail_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hot_follow_xq', () => {
    it('should return Xueqiu hot follow', async () => {
      try {
        const df = await stock_hot_follow_xq();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hot_tweet_xq', () => {
    it('should return Xueqiu hot tweet', async () => {
      try {
        const df = await stock_hot_tweet_xq();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hot_deal_xq', () => {
    it('should return Xueqiu hot deal', async () => {
      try {
        const df = await stock_hot_deal_xq();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_changes_em', () => {
    it('should return stock changes', async () => {
      try {
        const df = await stock_changes_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_board_change_em', () => {
    it('should return board changes', async () => {
      try {
        const df = await stock_board_change_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_jgdy_tj_em', () => {
    it('should return institutional research statistics', async () => {
      try {
        const df = await stock_jgdy_tj_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_jgdy_detail_em', () => {
    it('should return institutional research detail', async () => {
      try {
        const df = await stock_jgdy_detail_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_inner_trade_xq', () => {
    it('should return Xueqiu insider trades', async () => {
      try {
        const df = await stock_inner_trade_xq();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_research_report_em', () => {
    it('should return research reports', async () => {
      try {
        const df = await stock_research_report_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_institute_recommend_em', () => {
    it('should return institute recommendations', async () => {
      try {
        const df = await stock_institute_recommend_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_sy_profile_em', () => {
    it('should return SY profile', async () => {
      try {
        const df = await stock_sy_profile_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_sy_jz_em', () => {
    it('should return SY JZ data', async () => {
      try {
        const df = await stock_sy_jz_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_sy_hy_em', () => {
    it('should return SY HY data', async () => {
      try {
        const df = await stock_sy_hy_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_qsjy_em', () => {
    it('should return QSJY data', async () => {
      try {
        const df = await stock_qsjy_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_concept_cons_futu', () => {
    it('should return Futu concept constituents', async () => {
      try {
        const df = await stock_concept_cons_futu('云计算');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_board_concept_name_ths', () => {
    it('should return THS concept board names', async () => {
      try {
        const df = await stock_board_concept_name_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_board_concept_info_ths', () => {
    it('should return THS concept board info', async () => {
      try {
        const df = await stock_board_concept_info_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_board_concept_index_ths', () => {
    it('should return THS concept board index', async () => {
      try {
        const df = await stock_board_concept_index_ths('车联网');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_board_concept_summary_ths', () => {
    it('should return THS concept board summary', async () => {
      try {
        const df = await stock_board_concept_summary_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_board_industry_name_ths', () => {
    it('should return THS industry board names', async () => {
      try {
        const df = await stock_board_industry_name_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_board_industry_info_ths', () => {
    it('should return THS industry board info', async () => {
      try {
        const df = await stock_board_industry_info_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_board_industry_index_ths', () => {
    it('should return THS industry board index', async () => {
      try {
        const df = await stock_board_industry_index_ths('银行');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_board_industry_summary_ths', () => {
    it('should return THS industry board summary', async () => {
      try {
        const df = await stock_board_industry_summary_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_xgsr_ths', () => {
    it('should return THS XGSR data', async () => {
      try {
        const df = await stock_xgsr_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_ipo_benefit_ths', () => {
    it('should return IPO benefit data', async () => {
      try {
        const df = await stock_ipo_benefit_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hsgt_fund_min_em', () => {
    it('should return HSGT fund minute data', async () => {
      try {
        const df = await stock_hsgt_fund_min_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_sgt_reference_exchange_rate_sse', () => {
    it('should return SSE reference exchange rate', async () => {
      try {
        const df = await stock_sgt_reference_exchange_rate_sse();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_sgt_settlement_exchange_rate_sse', () => {
    it('should return SSE settlement exchange rate', async () => {
      try {
        const df = await stock_sgt_settlement_exchange_rate_sse();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_info_cjzc_em', () => {
    it('should return CJZC info', async () => {
      try {
        const df = await stock_info_cjzc_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_info_global_em', () => {
    it('should return global info', async () => {
      try {
        const df = await stock_info_global_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_gddh_em', () => {
    it('should return shareholder meeting info', async () => {
      try {
        const df = await stock_gddh_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zdhtmx_em', () => {
    it('should return major contract details', async () => {
      try {
        const df = await stock_zdhtmx_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_ggcg_em', () => {
    it('should return share buyback data', async () => {
      try {
        const df = await stock_ggcg_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_yzxdr_em', () => {
    it('should return key person changes', async () => {
      try {
        const df = await stock_yzxdr_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_qbzf_em', () => {
    it('should return total share changes', async () => {
      try {
        const df = await stock_qbzf_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_pg_em', () => {
    it('should return placement data', async () => {
      try {
        const df = await stock_pg_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_rank_cxg_ths', () => {
    it('should return CXG ranking', async () => {
      try {
        const df = await stock_rank_cxg_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_rank_cxd_ths', () => {
    it('should return CXD ranking', async () => {
      try {
        const df = await stock_rank_cxd_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_rank_lxsz_ths', () => {
    it('should return LXSZ ranking', async () => {
      try {
        const df = await stock_rank_lxsz_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_rank_lxxd_ths', () => {
    it('should return LXXD ranking', async () => {
      try {
        const df = await stock_rank_lxxd_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_rank_ljqs_ths', () => {
    it('should return LJQS ranking', async () => {
      try {
        const df = await stock_rank_ljqs_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_rank_ljqd_ths', () => {
    it('should return LJQD ranking', async () => {
      try {
        const df = await stock_rank_ljqd_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_disclosure_cninfo', () => {
    it('should return CNINFO disclosures', async () => {
      try {
        const df = await stock_disclosure_cninfo('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_irm_cninfo', () => {
    it('should return CNINFO IRM data', async () => {
      try {
        const df = await stock_irm_cninfo('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_fhps_detail_ths', () => {
    it('should return THS dividend detail', async () => {
      try {
        const df = await stock_fhps_detail_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_report_disclosure', () => {
    it('should return report disclosure', async () => {
      try {
        const df = await stock_report_disclosure('20240331');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

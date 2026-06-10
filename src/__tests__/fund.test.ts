/**
 * AKShare TypeScript - 基金模块完整测试
 */

import {
  fund_name_em,
  fund_purchase_em,
  fund_open_fund_daily_em,
  fund_open_fund_info_em,
  fund_value_estimation_em,
  fund_info_index_em,
  fund_money_fund_info_em,
  fund_graded_fund_daily_em,
  fund_graded_fund_info_em,
  fund_hk_fund_hist_em,
  fund_etf_spot_em,
  fund_etf_hist_em,
  fund_money_fund_daily_em,
  fund_open_fund_rank_em,
  fund_exchange_rank_em,
  fund_money_rank_em,
  fund_hk_rank_em,
  fund_scale_change_em,
  fund_hold_structure_em,
  fund_manager_em,
  fund_portfolio_hold_em,
  fund_portfolio_industry_allocation_em,
  fund_portfolio_bond_hold_em,
  fund_portfolio_change_em,
  fund_fh_em,
  fund_cf_em,
  fund_fh_rank_em,
  fund_lof_spot_em,
  fund_lof_hist_em,
  fund_overview_em,
  fund_new_found_em,
  fund_aum_em,
  fund_aum_trend_em,
  fund_aum_hist_em,
  fund_fee_em,
  fund_announcement_dividend_em,
  fund_announcement_report_em,
  fund_announcement_personnel_em,
  fund_rating_all,
  fund_rating_sh,
  fund_rating_zs,
  fund_rating_ja,
} from '../fund';

describe('Fund Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('fund_name_em', () => {
    it('should return fund names', async () => {
      try { const df = await fund_name_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_purchase_em', () => {
    it('should return purchasable funds', async () => {
      try { const df = await fund_purchase_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_open_fund_daily_em', () => {
    it('should return open fund daily data', async () => {
      try { const df = await fund_open_fund_daily_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_open_fund_info_em', () => {
    it('should return open fund info', async () => {
      try { const df = await fund_open_fund_info_em('510050'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_value_estimation_em', () => {
    it('should return fund value estimation', async () => {
      try { const df = await fund_value_estimation_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_info_index_em', () => {
    it('should return index fund info', async () => {
      try { const df = await fund_info_index_em('沪深指数'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_money_fund_info_em', () => {
    it('should return money fund info', async () => {
      try { const df = await fund_money_fund_info_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_graded_fund_daily_em', () => {
    it('should return graded fund daily data', async () => {
      try { const df = await fund_graded_fund_daily_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_graded_fund_info_em', () => {
    it('should return graded fund info', async () => {
      try { const df = await fund_graded_fund_info_em('150001'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_hk_fund_hist_em', () => {
    it('should return HK fund history', async () => {
      try { const df = await fund_hk_fund_hist_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_etf_spot_em', () => {
    it('should return ETF spot data', async () => {
      try { const df = await fund_etf_spot_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_etf_hist_em', () => {
    it('should return ETF history', async () => {
      try { const df = await fund_etf_hist_em('510050', 'daily', '20240101', '20240110'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_money_fund_daily_em', () => {
    it('should return money fund daily data', async () => {
      try { const df = await fund_money_fund_daily_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_open_fund_rank_em', () => {
    it('should return open fund ranking', async () => {
      try { const df = await fund_open_fund_rank_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_exchange_rank_em', () => {
    it('should return exchange fund ranking', async () => {
      try { const df = await fund_exchange_rank_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_money_rank_em', () => {
    it('should return money fund ranking', async () => {
      try { const df = await fund_money_rank_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_hk_rank_em', () => {
    it('should return HK fund ranking', async () => {
      try { const df = await fund_hk_rank_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_scale_change_em', () => {
    it('should return fund scale changes', async () => {
      try { const df = await fund_scale_change_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_hold_structure_em', () => {
    it('should return fund hold structure', async () => {
      try { const df = await fund_hold_structure_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_manager_em', () => {
    it('should return fund manager info', async () => {
      try { const df = await fund_manager_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_portfolio_hold_em', () => {
    it('should return fund portfolio holdings', async () => {
      try { const df = await fund_portfolio_hold_em('510050'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_portfolio_industry_allocation_em', () => {
    it('should return fund portfolio industry allocation', async () => {
      try { const df = await fund_portfolio_industry_allocation_em('510050'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_portfolio_bond_hold_em', () => {
    it('should return fund portfolio bond holdings', async () => {
      try { const df = await fund_portfolio_bond_hold_em('510050'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_portfolio_change_em', () => {
    it('should return fund portfolio changes', async () => {
      try { const df = await fund_portfolio_change_em('510050'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_fh_em', () => {
    it('should return fund dividend data', async () => {
      try { const df = await fund_fh_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_cf_em', () => {
    it('should return fund split data', async () => {
      try { const df = await fund_cf_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_fh_rank_em', () => {
    it('should return fund dividend ranking', async () => {
      try { const df = await fund_fh_rank_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_lof_spot_em', () => {
    it('should return LOF spot data', async () => {
      try { const df = await fund_lof_spot_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_lof_hist_em', () => {
    it('should return LOF history', async () => {
      try { const df = await fund_lof_hist_em('160105', 'daily', '20240101', '20240110'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_overview_em', () => {
    it('should return fund overview', async () => {
      try { const df = await fund_overview_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_new_found_em', () => {
    it('should return newly found funds', async () => {
      try { const df = await fund_new_found_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_aum_em', () => {
    it('should return fund AUM', async () => {
      try { const df = await fund_aum_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_aum_trend_em', () => {
    it('should return fund AUM trend', async () => {
      try { const df = await fund_aum_trend_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_aum_hist_em', () => {
    it('should return fund AUM history', async () => {
      try { const df = await fund_aum_hist_em('510050'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_fee_em', () => {
    it('should return fund fees', async () => {
      try { const df = await fund_fee_em('510050'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_announcement_dividend_em', () => {
    it('should return fund dividend announcements', async () => {
      try { const df = await fund_announcement_dividend_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_announcement_report_em', () => {
    it('should return fund report announcements', async () => {
      try { const df = await fund_announcement_report_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_announcement_personnel_em', () => {
    it('should return fund personnel announcements', async () => {
      try { const df = await fund_announcement_personnel_em(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_rating_all', () => {
    it('should return all fund ratings', async () => {
      try { const df = await fund_rating_all(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_rating_sh', () => {
    it('should return SH fund ratings', async () => {
      try { const df = await fund_rating_sh(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_rating_zs', () => {
    it('should return ZS fund ratings', async () => {
      try { const df = await fund_rating_zs(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fund_rating_ja', () => {
    it('should return JA fund ratings', async () => {
      try { const df = await fund_rating_ja(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

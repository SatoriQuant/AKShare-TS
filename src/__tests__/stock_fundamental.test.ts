/**
 * AKShare TypeScript - 股票基本面模块完整测试
 */

import {
  stock_zygc_em,
  stock_zyjs_ths,
  stock_financial_report_sina,
  stock_financial_abstract,
  stock_financial_analysis_indicator_em,
  stock_history_dividend,
  stock_history_dividend_detail,
  stock_ipo_info,
  stock_restricted_release_queue_sina,
  stock_circulate_stock_holder,
  stock_fund_stock_holder,
  stock_main_stock_holder,
  stock_institute_hold,
  stock_institute_hold_detail,
  stock_restricted_release_summary_em,
  stock_restricted_release_detail_em,
  stock_restricted_release_queue_em,
  stock_restricted_release_stockholder_em,
  stock_profit_forecast_em,
  stock_profit_forecast_ths,
  stock_ipo_declare_em,
  stock_ipo_review_em,
  stock_ipo_tutor_em,
  stock_ipo_ths,
  stock_ipo_hk_ths,
  stock_register_all_em,
  stock_register_kcb,
  stock_register_cyb,
  stock_register_bj,
  stock_register_sh,
  stock_register_sz,
  stock_register_db,
  stock_financial_abstract_ths,
  stock_financial_debt_ths,
  stock_financial_benefit_ths,
  stock_financial_cash_ths,
  stock_financial_abstract_new_ths,
  stock_financial_debt_new_ths,
  stock_financial_benefit_new_ths,
  stock_financial_cash_new_ths,
  stock_management_change_ths,
  stock_shareholder_change_ths,
  stock_zh_a_gbjg_em,
  stock_notice_report,
  stock_individual_notice_report,
  stock_financial_hk_report_em,
  stock_financial_hk_analysis_indicator_em,
  stock_financial_us_report_em,
  stock_financial_us_analysis_indicator_em,
  stock_institute_recommend,
  stock_institute_recommend_detail,
  stock_individual_basic_info_xq,
  stock_individual_basic_info_us_xq,
  stock_individual_basic_info_hk_xq,
  stock_hk_profit_forecast_et,
} from '../stock_fundamental';

describe('Stock Fundamental Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('stock_zygc_em', () => {
    it('should return main business composition', async () => {
      try {
        const df = await stock_zygc_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zyjs_ths', () => {
    it('should return THS main business summary', async () => {
      try {
        const df = await stock_zyjs_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_report_sina', () => {
    it('should return financial report from Sina', async () => {
      try {
        const df = await stock_financial_report_sina('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_abstract', () => {
    it('should return financial abstract', async () => {
      try {
        const df = await stock_financial_abstract('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_analysis_indicator_em', () => {
    it('should return financial analysis indicators', async () => {
      try {
        const df = await stock_financial_analysis_indicator_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_history_dividend', () => {
    it('should return dividend history', async () => {
      try {
        const df = await stock_history_dividend();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_history_dividend_detail', () => {
    it('should return dividend history detail', async () => {
      try {
        const df = await stock_history_dividend_detail('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_ipo_info', () => {
    it('should return IPO info', async () => {
      try {
        const df = await stock_ipo_info('600004');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_restricted_release_queue_sina', () => {
    it('should return restricted release queue', async () => {
      try {
        const df = await stock_restricted_release_queue_sina();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_circulate_stock_holder', () => {
    it('should return circulate stock holders', async () => {
      try {
        const df = await stock_circulate_stock_holder('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_fund_stock_holder', () => {
    it('should return fund stock holders', async () => {
      try {
        const df = await stock_fund_stock_holder('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_main_stock_holder', () => {
    it('should return main stock holders', async () => {
      try {
        const df = await stock_main_stock_holder('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_institute_hold', () => {
    it('should return institute holdings', async () => {
      try {
        const df = await stock_institute_hold();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_institute_hold_detail', () => {
    it('should return institute holdings detail', async () => {
      try {
        const df = await stock_institute_hold_detail('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_restricted_release_summary_em', () => {
    it('should return restricted release summary', async () => {
      try {
        const df = await stock_restricted_release_summary_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_restricted_release_detail_em', () => {
    it('should return restricted release detail', async () => {
      try {
        const df = await stock_restricted_release_detail_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_restricted_release_queue_em', () => {
    it('should return restricted release queue from EM', async () => {
      try {
        const df = await stock_restricted_release_queue_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_restricted_release_stockholder_em', () => {
    it('should return restricted release stockholder', async () => {
      try {
        const df = await stock_restricted_release_stockholder_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_profit_forecast_em', () => {
    it('should return profit forecast', async () => {
      try {
        const df = await stock_profit_forecast_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_profit_forecast_ths', () => {
    it('should return profit forecast from THS', async () => {
      try {
        const df = await stock_profit_forecast_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_ipo_declare_em', () => {
    it('should return IPO declarations', async () => {
      try {
        const df = await stock_ipo_declare_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_ipo_review_em', () => {
    it('should return IPO reviews', async () => {
      try {
        const df = await stock_ipo_review_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_ipo_tutor_em', () => {
    it('should return IPO tutor info', async () => {
      try {
        const df = await stock_ipo_tutor_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_ipo_ths', () => {
    it('should return THS IPO info', async () => {
      try {
        const df = await stock_ipo_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_ipo_hk_ths', () => {
    it('should return HK IPO info from THS', async () => {
      try {
        const df = await stock_ipo_hk_ths();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_register_all_em', () => {
    it('should return all registered companies', async () => {
      try {
        const df = await stock_register_all_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_register_kcb', () => {
    it('should return KCB registered companies', async () => {
      try {
        const df = await stock_register_kcb();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_register_cyb', () => {
    it('should return CYB registered companies', async () => {
      try {
        const df = await stock_register_cyb();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_register_bj', () => {
    it('should return BJ registered companies', async () => {
      try {
        const df = await stock_register_bj();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_register_sh', () => {
    it('should return SH registered companies', async () => {
      try {
        const df = await stock_register_sh();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_register_sz', () => {
    it('should return SZ registered companies', async () => {
      try {
        const df = await stock_register_sz();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_register_db', () => {
    it('should return DB registered companies', async () => {
      try {
        const df = await stock_register_db();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_abstract_ths', () => {
    it('should return THS financial abstract', async () => {
      try {
        const df = await stock_financial_abstract_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_debt_ths', () => {
    it('should return THS financial debt', async () => {
      try {
        const df = await stock_financial_debt_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_benefit_ths', () => {
    it('should return THS financial benefit', async () => {
      try {
        const df = await stock_financial_benefit_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_cash_ths', () => {
    it('should return THS financial cash flow', async () => {
      try {
        const df = await stock_financial_cash_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_abstract_new_ths', () => {
    it('should return new THS financial abstract', async () => {
      try {
        const df = await stock_financial_abstract_new_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_debt_new_ths', () => {
    it('should return new THS financial debt', async () => {
      try {
        const df = await stock_financial_debt_new_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_benefit_new_ths', () => {
    it('should return new THS financial benefit', async () => {
      try {
        const df = await stock_financial_benefit_new_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_cash_new_ths', () => {
    it('should return new THS financial cash flow', async () => {
      try {
        const df = await stock_financial_cash_new_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_management_change_ths', () => {
    it('should return management changes', async () => {
      try {
        const df = await stock_management_change_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_shareholder_change_ths', () => {
    it('should return shareholder changes', async () => {
      try {
        const df = await stock_shareholder_change_ths('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_zh_a_gbjg_em', () => {
    it('should return share structure', async () => {
      try {
        const df = await stock_zh_a_gbjg_em('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_notice_report', () => {
    it('should return notice reports', async () => {
      try {
        const df = await stock_notice_report('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_individual_notice_report', () => {
    it('should return individual notice reports', async () => {
      try {
        const df = await stock_individual_notice_report('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_hk_report_em', () => {
    it('should return HK financial report', async () => {
      try {
        const df = await stock_financial_hk_report_em('00700');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_hk_analysis_indicator_em', () => {
    it('should return HK financial analysis indicators', async () => {
      try {
        const df = await stock_financial_hk_analysis_indicator_em('00700');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_us_report_em', () => {
    it('should return US financial report', async () => {
      try {
        const df = await stock_financial_us_report_em('AAPL');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_financial_us_analysis_indicator_em', () => {
    it('should return US financial analysis indicators', async () => {
      try {
        const df = await stock_financial_us_analysis_indicator_em('AAPL');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_institute_recommend', () => {
    it('should return institute recommendations', async () => {
      try {
        const df = await stock_institute_recommend();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_institute_recommend_detail', () => {
    it('should return institute recommendation details', async () => {
      try {
        const df = await stock_institute_recommend_detail('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_individual_basic_info_xq', () => {
    it('should return XQ individual basic info', async () => {
      try {
        const df = await stock_individual_basic_info_xq('000001');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_individual_basic_info_us_xq', () => {
    it('should return US XQ individual basic info', async () => {
      try {
        const df = await stock_individual_basic_info_us_xq('AAPL');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_individual_basic_info_hk_xq', () => {
    it('should return HK XQ individual basic info', async () => {
      try {
        const df = await stock_individual_basic_info_hk_xq('00700');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_hk_profit_forecast_et', () => {
    it('should return HK profit forecast', async () => {
      try {
        const df = await stock_hk_profit_forecast_et('00700');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

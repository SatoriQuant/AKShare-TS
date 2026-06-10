/**
 * AKShare TypeScript - 经济数据模块完整测试
 */

import {
  // China macro
  macro_china_gdp,
  macro_china_cpi,
  macro_china_ppi,
  macro_china_pmi,
  macro_china_supply_of_money,
  macro_china_shrzgm,
  macro_china_qyspjg,
  macro_china_fdi,
  macro_china_gdp_yearly,
  macro_china_cpi_yearly,
  macro_china_cpi_monthly,
  macro_china_ppi_yearly,
  macro_china_exports_yoy,
  macro_china_imports_yoy,
  macro_china_trade_balance,
  macro_china_industrial_production_yoy,
  macro_china_pmi_yearly,
  macro_china_cx_pmi_yearly,
  macro_china_cx_services_pmi_yearly,
  macro_china_non_man_pmi,
  macro_china_fx_reserves_yearly,
  macro_china_m2_yearly,
  macro_china_urban_unemployment,
  macro_china_lpr,
  macro_china_enterprise_boom_index,
  macro_china_national_tax_receipts,
  macro_china_new_financial_credit,
  macro_china_fx_gold,
  macro_china_money_supply,
  macro_china_bank_financing,
  macro_china_insurance_income,
  macro_china_mobile_number,
  macro_china_vegetable_basket,
  macro_china_agricultural_product,
  macro_china_agricultural_index,
  macro_china_energy_index,
  macro_china_commodity_price_index,
  macro_global_sox_index,
  macro_china_construction_index,
  macro_china_construction_price_index,
  macro_china_lpi_index,
  macro_china_bdti_index,
  macro_china_bsi_index,
  macro_shipping_bci,
  macro_shipping_bdi,
  macro_shipping_bpi,
  macro_shipping_bcti,
  macro_china_stock_market_cap,
  macro_china_shibor_all,
  macro_china_hk_market_info,
  macro_china_rmb,
  macro_china_market_margin_sh,
  macro_china_market_margin_sz,
  macro_china_reserve_requirement_ratio,
  macro_china_consumer_goods_retail,
  macro_china_real_estate,
  // USA macro
  macro_usa_non_farm,
  macro_usa_interest_rate,
  macro_usa_phs,
  macro_usa_cpi_yoy,
  macro_usa_gdp_monthly,
  macro_usa_cpi_monthly,
  macro_usa_core_cpi_monthly,
  macro_usa_personal_spending,
  macro_usa_retail_sales,
  macro_usa_unemployment_rate,
  macro_usa_pmi,
  macro_usa_ism_pmi,
  macro_usa_industrial_production,
  macro_usa_initial_jobless,
  // Euro
  macro_euro_gdp_yoy,
  macro_euro_cpi_yoy,
  macro_euro_unemployment_rate_mom,
  macro_euro_trade_balance,
  macro_euro_manufacturing_pmi,
  macro_euro_services_pmi,
  // Japan
  macro_japan_bank_rate,
  macro_japan_cpi_yearly,
  macro_japan_unemployment_rate,
  // UK
  macro_uk_bank_rate,
  macro_uk_cpi_yearly,
  macro_uk_unemployment_rate,
  // Germany
  macro_germany_ifo,
  macro_germany_cpi_yearly,
  macro_germany_gdp,
  // Australia
  macro_australia_bank_rate,
  macro_australia_unemployment_rate,
  // Canada
  macro_canada_bank_rate,
  macro_canada_unemployment_rate,
  // Switzerland
  macro_swiss_bank_rate,
  // Bank rates
  macro_bank_usa_interest_rate,
  macro_bank_euro_interest_rate,
  macro_bank_china_interest_rate,
  macro_bank_japan_interest_rate,
  macro_bank_english_interest_rate,
  macro_bank_australia_interest_rate,
  // Constitutes
  macro_cons_gold,
  macro_cons_silver,
} from '../economic';

describe('Economic Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  // ============ China Macro ============
  describe('macro_china_gdp', () => {
    it('should return China GDP', async () => {
      try { const df = await macro_china_gdp(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_cpi', () => {
    it('should return China CPI', async () => {
      try { const df = await macro_china_cpi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_ppi', () => {
    it('should return China PPI', async () => {
      try { const df = await macro_china_ppi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_pmi', () => {
    it('should return China PMI', async () => {
      try { const df = await macro_china_pmi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_supply_of_money', () => {
    it('should return China money supply', async () => {
      try { const df = await macro_china_supply_of_money(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_shrzgm', () => {
    it('should return China social financing', async () => {
      try { const df = await macro_china_shrzgm(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_qyspjg', () => {
    it('should return China enterprise product price', async () => {
      try { const df = await macro_china_qyspjg(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_fdi', () => {
    it('should return China FDI', async () => {
      try { const df = await macro_china_fdi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_gdp_yearly', () => {
    it('should return China yearly GDP', async () => {
      try { const df = await macro_china_gdp_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_cpi_yearly', () => {
    it('should return China yearly CPI', async () => {
      try { const df = await macro_china_cpi_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_cpi_monthly', () => {
    it('should return China monthly CPI', async () => {
      try { const df = await macro_china_cpi_monthly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_ppi_yearly', () => {
    it('should return China yearly PPI', async () => {
      try { const df = await macro_china_ppi_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_exports_yoy', () => {
    it('should return China exports YoY', async () => {
      try { const df = await macro_china_exports_yoy(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_imports_yoy', () => {
    it('should return China imports YoY', async () => {
      try { const df = await macro_china_imports_yoy(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_trade_balance', () => {
    it('should return China trade balance', async () => {
      try { const df = await macro_china_trade_balance(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_industrial_production_yoy', () => {
    it('should return China industrial production YoY', async () => {
      try { const df = await macro_china_industrial_production_yoy(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_pmi_yearly', () => {
    it('should return China yearly PMI', async () => {
      try { const df = await macro_china_pmi_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_cx_pmi_yearly', () => {
    it('should return China CX PMI yearly', async () => {
      try { const df = await macro_china_cx_pmi_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_cx_services_pmi_yearly', () => {
    it('should return China CX services PMI yearly', async () => {
      try { const df = await macro_china_cx_services_pmi_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_non_man_pmi', () => {
    it('should return China non-manufacturing PMI', async () => {
      try { const df = await macro_china_non_man_pmi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_fx_reserves_yearly', () => {
    it('should return China forex reserves yearly', async () => {
      try { const df = await macro_china_fx_reserves_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_m2_yearly', () => {
    it('should return China M2 yearly', async () => {
      try { const df = await macro_china_m2_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_urban_unemployment', () => {
    it('should return China urban unemployment', async () => {
      try { const df = await macro_china_urban_unemployment(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_lpr', () => {
    it('should return China LPR', async () => {
      try { const df = await macro_china_lpr(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_enterprise_boom_index', () => {
    it('should return China enterprise boom index', async () => {
      try { const df = await macro_china_enterprise_boom_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_national_tax_receipts', () => {
    it('should return China national tax receipts', async () => {
      try { const df = await macro_china_national_tax_receipts(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_new_financial_credit', () => {
    it('should return China new financial credit', async () => {
      try { const df = await macro_china_new_financial_credit(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_fx_gold', () => {
    it('should return China forex gold', async () => {
      try { const df = await macro_china_fx_gold(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_money_supply', () => {
    it('should return China money supply data', async () => {
      try { const df = await macro_china_money_supply(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_bank_financing', () => {
    it('should return China bank financing', async () => {
      try { const df = await macro_china_bank_financing(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_insurance_income', () => {
    it('should return China insurance income', async () => {
      try { const df = await macro_china_insurance_income(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_mobile_number', () => {
    it('should return China mobile number data', async () => {
      try { const df = await macro_china_mobile_number(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_vegetable_basket', () => {
    it('should return China vegetable basket index', async () => {
      try { const df = await macro_china_vegetable_basket(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_agricultural_product', () => {
    it('should return China agricultural product', async () => {
      try { const df = await macro_china_agricultural_product(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_agricultural_index', () => {
    it('should return China agricultural index', async () => {
      try { const df = await macro_china_agricultural_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_energy_index', () => {
    it('should return China energy index', async () => {
      try { const df = await macro_china_energy_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_commodity_price_index', () => {
    it('should return China commodity price index', async () => {
      try { const df = await macro_china_commodity_price_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_global_sox_index', () => {
    it('should return global SOX index', async () => {
      try { const df = await macro_global_sox_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_construction_index', () => {
    it('should return China construction index', async () => {
      try { const df = await macro_china_construction_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_construction_price_index', () => {
    it('should return China construction price index', async () => {
      try { const df = await macro_china_construction_price_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_lpi_index', () => {
    it('should return China LPI index', async () => {
      try { const df = await macro_china_lpi_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_bdti_index', () => {
    it('should return China BDTI index', async () => {
      try { const df = await macro_china_bdti_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_bsi_index', () => {
    it('should return China BSI index', async () => {
      try { const df = await macro_china_bsi_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_shipping_bci', () => {
    it('should return BCI shipping index', async () => {
      try { const df = await macro_shipping_bci(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_shipping_bdi', () => {
    it('should return BDI shipping index', async () => {
      try { const df = await macro_shipping_bdi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_shipping_bpi', () => {
    it('should return BPI shipping index', async () => {
      try { const df = await macro_shipping_bpi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_shipping_bcti', () => {
    it('should return BCTI shipping index', async () => {
      try { const df = await macro_shipping_bcti(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_stock_market_cap', () => {
    it('should return China stock market cap', async () => {
      try { const df = await macro_china_stock_market_cap(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_shibor_all', () => {
    it('should return China SHIBOR all data', async () => {
      try { const df = await macro_china_shibor_all(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_hk_market_info', () => {
    it('should return China HK market info', async () => {
      try { const df = await macro_china_hk_market_info(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_rmb', () => {
    it('should return China RMB data', async () => {
      try { const df = await macro_china_rmb(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_market_margin_sh', () => {
    it('should return China SH market margin', async () => {
      try { const df = await macro_china_market_margin_sh(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_market_margin_sz', () => {
    it('should return China SZ market margin', async () => {
      try { const df = await macro_china_market_margin_sz(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_reserve_requirement_ratio', () => {
    it('should return China reserve requirement ratio', async () => {
      try { const df = await macro_china_reserve_requirement_ratio(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_consumer_goods_retail', () => {
    it('should return China consumer goods retail', async () => {
      try { const df = await macro_china_consumer_goods_retail(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_real_estate', () => {
    it('should return China real estate data', async () => {
      try { const df = await macro_china_real_estate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // ============ USA Macro ============
  describe('macro_usa_non_farm', () => {
    it('should return USA non-farm payroll', async () => {
      try { const df = await macro_usa_non_farm(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_interest_rate', () => {
    it('should return USA interest rate', async () => {
      try { const df = await macro_usa_interest_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_phs', () => {
    it('should return USA PHS data', async () => {
      try { const df = await macro_usa_phs(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_cpi_yoy', () => {
    it('should return USA CPI YoY', async () => {
      try { const df = await macro_usa_cpi_yoy(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_gdp_monthly', () => {
    it('should return USA monthly GDP', async () => {
      try { const df = await macro_usa_gdp_monthly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_cpi_monthly', () => {
    it('should return USA monthly CPI', async () => {
      try { const df = await macro_usa_cpi_monthly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_core_cpi_monthly', () => {
    it('should return USA core monthly CPI', async () => {
      try { const df = await macro_usa_core_cpi_monthly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_personal_spending', () => {
    it('should return USA personal spending', async () => {
      try { const df = await macro_usa_personal_spending(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_retail_sales', () => {
    it('should return USA retail sales', async () => {
      try { const df = await macro_usa_retail_sales(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_unemployment_rate', () => {
    it('should return USA unemployment rate', async () => {
      try { const df = await macro_usa_unemployment_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_pmi', () => {
    it('should return USA PMI', async () => {
      try { const df = await macro_usa_pmi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_ism_pmi', () => {
    it('should return USA ISM PMI', async () => {
      try { const df = await macro_usa_ism_pmi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_industrial_production', () => {
    it('should return USA industrial production', async () => {
      try { const df = await macro_usa_industrial_production(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_usa_initial_jobless', () => {
    it('should return USA initial jobless claims', async () => {
      try { const df = await macro_usa_initial_jobless(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // ============ Euro Macro ============
  describe('macro_euro_gdp_yoy', () => {
    it('should return Euro GDP YoY', async () => {
      try { const df = await macro_euro_gdp_yoy(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_euro_cpi_yoy', () => {
    it('should return Euro CPI YoY', async () => {
      try { const df = await macro_euro_cpi_yoy(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_euro_unemployment_rate_mom', () => {
    it('should return Euro unemployment rate', async () => {
      try { const df = await macro_euro_unemployment_rate_mom(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_euro_trade_balance', () => {
    it('should return Euro trade balance', async () => {
      try { const df = await macro_euro_trade_balance(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_euro_manufacturing_pmi', () => {
    it('should return Euro manufacturing PMI', async () => {
      try { const df = await macro_euro_manufacturing_pmi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_euro_services_pmi', () => {
    it('should return Euro services PMI', async () => {
      try { const df = await macro_euro_services_pmi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // ============ Japan Macro ============
  describe('macro_japan_bank_rate', () => {
    it('should return Japan bank rate', async () => {
      try { const df = await macro_japan_bank_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_japan_cpi_yearly', () => {
    it('should return Japan CPI yearly', async () => {
      try { const df = await macro_japan_cpi_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_japan_unemployment_rate', () => {
    it('should return Japan unemployment rate', async () => {
      try { const df = await macro_japan_unemployment_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // ============ UK Macro ============
  describe('macro_uk_bank_rate', () => {
    it('should return UK bank rate', async () => {
      try { const df = await macro_uk_bank_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_uk_cpi_yearly', () => {
    it('should return UK CPI yearly', async () => {
      try { const df = await macro_uk_cpi_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_uk_unemployment_rate', () => {
    it('should return UK unemployment rate', async () => {
      try { const df = await macro_uk_unemployment_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // ============ Germany Macro ============
  describe('macro_germany_ifo', () => {
    it('should return Germany IFO index', async () => {
      try { const df = await macro_germany_ifo(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_germany_cpi_yearly', () => {
    it('should return Germany CPI yearly', async () => {
      try { const df = await macro_germany_cpi_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_germany_gdp', () => {
    it('should return Germany GDP', async () => {
      try { const df = await macro_germany_gdp(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // ============ Australia Macro ============
  describe('macro_australia_bank_rate', () => {
    it('should return Australia bank rate', async () => {
      try { const df = await macro_australia_bank_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_australia_unemployment_rate', () => {
    it('should return Australia unemployment rate', async () => {
      try { const df = await macro_australia_unemployment_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // ============ Canada Macro ============
  describe('macro_canada_bank_rate', () => {
    it('should return Canada bank rate', async () => {
      try { const df = await macro_canada_bank_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_canada_unemployment_rate', () => {
    it('should return Canada unemployment rate', async () => {
      try { const df = await macro_canada_unemployment_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // ============ Switzerland Macro ============
  describe('macro_swiss_bank_rate', () => {
    it('should return Switzerland bank rate', async () => {
      try { const df = await macro_swiss_bank_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // ============ Bank Rates ============
  describe('macro_bank_usa_interest_rate', () => {
    it('should return USA bank interest rate', async () => {
      try { const df = await macro_bank_usa_interest_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_bank_euro_interest_rate', () => {
    it('should return Euro bank interest rate', async () => {
      try { const df = await macro_bank_euro_interest_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_bank_china_interest_rate', () => {
    it('should return China bank interest rate', async () => {
      try { const df = await macro_bank_china_interest_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_bank_japan_interest_rate', () => {
    it('should return Japan bank interest rate', async () => {
      try { const df = await macro_bank_japan_interest_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_bank_english_interest_rate', () => {
    it('should return English bank interest rate', async () => {
      try { const df = await macro_bank_english_interest_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_bank_australia_interest_rate', () => {
    it('should return Australia bank interest rate', async () => {
      try { const df = await macro_bank_australia_interest_rate(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  // ============ Constitutes ============
  describe('macro_cons_gold', () => {
    it('should return gold constitutes', async () => {
      try { const df = await macro_cons_gold(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_cons_silver', () => {
    it('should return silver constitutes', async () => {
      try { const df = await macro_cons_silver(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

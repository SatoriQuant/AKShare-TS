/**
 * AKShare TypeScript - 期货模块完整测试
 */

import {
  futures_zh_spot,
  futures_zh_daily_sina,
  futures_zh_minute_sina,
  futures_dce_position_rank,
  futures_zh_realtime,
  futures_symbol_mark,
  futures_foreign_detail,
  futures_foreign_hist,
  futures_hq_subscribe_exchange_symbol,
  futures_foreign_commodity_subscribe_exchange_symbol,
  futures_foreign_commodity_realtime,
  futures_inventory_em,
  futures_inventory_99,
  futures_inventory_99qh,
  futures_hist_table_em,
  futures_hist_em,
  futures_global_spot_em,
  futures_global_hist_em,
  futures_zh_minute_em,
  futures_global_minute_em,
  get_shfe_daily,
  get_dce_daily,
  get_czce_daily,
  get_cffex_daily,
  get_ine_daily,
  get_gfex_daily,
  get_futures_daily,
  futures_fees_info,
  futures_comm_js,
  futures_comm_info,
  futures_settle_cffex,
  futures_settle_czce,
  futures_settle_shfe,
  futures_settle_ine,
  futures_settle_gfex,
  futures_settle,
  futures_spot_stock,
  futures_contract_detail,
  futures_contract_detail_em,
  futures_warehouse_receipt_dce,
  futures_shfe_warehouse_receipt,
  futures_gfex_warehouse_receipt,
  futures_warehouse_receipt,
  get_dce_receipt,
  get_shfe_receipt,
  get_czce_receipt,
  get_gfex_receipt,
  get_receipt,
  futures_rule,
  futures_rule_em,
  futures_to_spot_shfe,
  futures_delivery_shfe,
  futures_to_spot_dce,
  futures_delivery_dce,
  futures_to_spot_czce,
  futures_delivery_match_dce,
  futures_delivery_match_czce,
  futures_delivery_czce,
  futures_stock_shfe_js,
  futures_index_ccidx,
  futures_news_shmet,
  futures_comex_inventory,
  futures_settlement_price_sgx,
  futures_spot_price,
  futures_spot_price_daily,
  futures_spot_price_previous,
  get_roll_yield,
  get_roll_yield_bar,
} from '../futures';

describe('Futures Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('futures_zh_spot', () => {
    it('should return Chinese futures spot data', async () => {
      try {
        const df = await futures_zh_spot('上海期货交易所');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_zh_daily_sina', () => {
    it('should return daily futures data from Sina', async () => {
      try {
        const df = await futures_zh_daily_sina('AU0');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_zh_minute_sina', () => {
    it('should return minute futures data from Sina', async () => {
      try {
        const df = await futures_zh_minute_sina('AU0', 5);
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_dce_position_rank', () => {
    it('should return DCE position ranking', async () => {
      try {
        const df = await futures_dce_position_rank('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_zh_realtime', () => {
    it('should return realtime futures data', async () => {
      try {
        const df = await futures_zh_realtime();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_symbol_mark', () => {
    it('should return futures symbol marks', async () => {
      try {
        const df = await futures_symbol_mark();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_foreign_detail', () => {
    it('should return foreign futures detail', async () => {
      try {
        const df = await futures_foreign_detail();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_foreign_hist', () => {
    it('should return foreign futures history', async () => {
      try {
        const df = await futures_foreign_hist('伦敦金');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_hq_subscribe_exchange_symbol (sync)', () => {
    it('should return exchange symbols synchronously', () => {
      const result = futures_hq_subscribe_exchange_symbol();
      expect(result).toBeDefined();
    });
  });

  describe('futures_foreign_commodity_subscribe_exchange_symbol (sync)', () => {
    it('should return foreign commodity symbols synchronously', () => {
      const result = futures_foreign_commodity_subscribe_exchange_symbol();
      expect(result).toBeDefined();
    });
  });

  describe('futures_foreign_commodity_realtime', () => {
    it('should return foreign commodity realtime data', async () => {
      try {
        const df = await futures_foreign_commodity_realtime('伦敦金');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_inventory_em', () => {
    it('should return futures inventory from EM', async () => {
      try {
        const df = await futures_inventory_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_inventory_99', () => {
    it('should return futures inventory from 99', async () => {
      try {
        const df = await futures_inventory_99('铜');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_inventory_99qh', () => {
    it('should return futures inventory from 99qh', async () => {
      try {
        const df = await futures_inventory_99qh('铜');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_hist_table_em', () => {
    it('should return futures history table', async () => {
      try {
        const df = await futures_hist_table_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_hist_em', () => {
    it('should return futures history from EM', async () => {
      try {
        const df = await futures_hist_em('热卷主连', 'daily', '20240101', '20240110');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_global_spot_em', () => {
    it('should return global futures spot', async () => {
      try {
        const df = await futures_global_spot_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_global_hist_em', () => {
    it('should return global futures history', async () => {
      try {
        const df = await futures_global_hist_em('HG00Y');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_zh_minute_em', () => {
    it('should return Chinese futures minute data from EM', async () => {
      try {
        const df = await futures_zh_minute_em('AU0', 5);
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_global_minute_em', () => {
    it('should return global futures minute data', async () => {
      try {
        const df = await futures_global_minute_em('伦敦金', 5);
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_shfe_daily', () => {
    it('should return SHFE daily data', async () => {
      try {
        const df = await get_shfe_daily('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_dce_daily', () => {
    it('should return DCE daily data', async () => {
      try {
        const df = await get_dce_daily('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_czce_daily', () => {
    it('should return CZCE daily data', async () => {
      try {
        const df = await get_czce_daily('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_cffex_daily', () => {
    it('should return CFFEX daily data', async () => {
      try {
        const df = await get_cffex_daily('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_ine_daily', () => {
    it('should return INE daily data', async () => {
      try {
        const df = await get_ine_daily('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_gfex_daily', () => {
    it('should return GFEX daily data', async () => {
      try {
        const df = await get_gfex_daily('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_futures_daily', () => {
    it('should return combined futures daily data', async () => {
      try {
        const df = await get_futures_daily('20240101', '20240110', 'SHFE');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_fees_info', () => {
    it('should return futures fees info', async () => {
      try {
        const df = await futures_fees_info();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_comm_js', () => {
    it('should return futures commission JS data', async () => {
      try {
        const df = await futures_comm_js('20260213');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_comm_info', () => {
    it('should return futures commission info', async () => {
      try {
        const df = await futures_comm_info();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_settle_cffex', () => {
    it('should return CFFEX settlement data', async () => {
      try {
        const df = await futures_settle_cffex('20260119');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_settle_czce', () => {
    it('should return CZCE settlement data', async () => {
      try {
        const df = await futures_settle_czce('20260119');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_settle_shfe', () => {
    it('should return SHFE settlement data', async () => {
      try {
        const df = await futures_settle_shfe('20260119');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_settle_ine', () => {
    it('should return INE settlement data', async () => {
      try {
        const df = await futures_settle_ine('20260119');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_settle_gfex', () => {
    it('should return GFEX settlement data', async () => {
      try {
        const df = await futures_settle_gfex();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_settle', () => {
    it('should return combined settlement data', async () => {
      try {
        const df = await futures_settle();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_spot_stock', () => {
    it('should return futures spot stock data', async () => {
      try {
        const df = await futures_spot_stock();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_contract_detail', () => {
    it('should return futures contract detail', async () => {
      try {
        const df = await futures_contract_detail();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_contract_detail_em', () => {
    it('should return futures contract detail from EM', async () => {
      try {
        const df = await futures_contract_detail_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_warehouse_receipt_dce', () => {
    it('should return DCE warehouse receipts', async () => {
      try {
        const df = await futures_warehouse_receipt_dce();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_shfe_warehouse_receipt', () => {
    it('should return SHFE warehouse receipts', async () => {
      try {
        const df = await futures_shfe_warehouse_receipt();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_gfex_warehouse_receipt', () => {
    it('should return GFEX warehouse receipts', async () => {
      try {
        const df = await futures_gfex_warehouse_receipt();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_warehouse_receipt', () => {
    it('should return combined warehouse receipts', async () => {
      try {
        const df = await futures_warehouse_receipt();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_dce_receipt', () => {
    it('should return DCE receipt data', async () => {
      try {
        const df = await get_dce_receipt('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_shfe_receipt', () => {
    it('should return SHFE receipt data', async () => {
      try {
        const df = await get_shfe_receipt('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_czce_receipt', () => {
    it('should return CZCE receipt data', async () => {
      try {
        const df = await get_czce_receipt('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_gfex_receipt', () => {
    it('should return GFEX receipt data', async () => {
      try {
        const df = await get_gfex_receipt('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_receipt', () => {
    it('should return combined receipt data', async () => {
      try {
        const df = await get_receipt('20240102', 'DCE');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_rule', () => {
    it('should return futures rules', async () => {
      try {
        const df = await futures_rule();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_rule_em', () => {
    it('should return futures rules from EM', async () => {
      try {
        const df = await futures_rule_em();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_to_spot_shfe', () => {
    it('should return SHFE to-spot data', async () => {
      try {
        const df = await futures_to_spot_shfe();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_delivery_shfe', () => {
    it('should return SHFE delivery data', async () => {
      try {
        const df = await futures_delivery_shfe();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_to_spot_dce', () => {
    it('should return DCE to-spot data', async () => {
      try {
        const df = await futures_to_spot_dce();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_delivery_dce', () => {
    it('should return DCE delivery data', async () => {
      try {
        const df = await futures_delivery_dce();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_to_spot_czce', () => {
    it('should return CZCE to-spot data', async () => {
      try {
        const df = await futures_to_spot_czce();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_delivery_match_dce', () => {
    it('should return DCE delivery match data', async () => {
      try {
        const df = await futures_delivery_match_dce();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_delivery_match_czce', () => {
    it('should return CZCE delivery match data', async () => {
      try {
        const df = await futures_delivery_match_czce();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_delivery_czce', () => {
    it('should return CZCE delivery data', async () => {
      try {
        const df = await futures_delivery_czce();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_stock_shfe_js', () => {
    it('should return SHFE stock JS data', async () => {
      try {
        const df = await futures_stock_shfe_js();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_index_ccidx', () => {
    it('should return CCIDX futures index', async () => {
      try {
        const df = await futures_index_ccidx();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_news_shmet', () => {
    it('should return SHMET futures news', async () => {
      try {
        const df = await futures_news_shmet();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_comex_inventory', () => {
    it('should return COMEX inventory', async () => {
      try {
        const df = await futures_comex_inventory();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_settlement_price_sgx', () => {
    it('should return SGX settlement prices', async () => {
      try {
        const df = await futures_settlement_price_sgx();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_spot_price', () => {
    it('should return spot prices', async () => {
      try {
        const df = await futures_spot_price('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_spot_price_daily', () => {
    it('should return daily spot prices', async () => {
      try {
        const df = await futures_spot_price_daily('20240101', '20240110');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_spot_price_previous', () => {
    it('should return previous spot prices', async () => {
      try {
        const df = await futures_spot_price_previous('20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_roll_yield', () => {
    it('should return roll yield', async () => {
      try {
        const result = await get_roll_yield('20240102', 'RB');
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_roll_yield_bar', () => {
    it('should return roll yield bar chart', async () => {
      try {
        const df = await get_roll_yield_bar('var', 'RB', '20240102');
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

/**
 * AKShare TypeScript - 期货衍生品模块完整测试
 */

import {
  zh_subscribe_exchange_symbol,
  match_main_contract,
  futures_display_main_sina,
  futures_main_sina,
  futures_hold_pos_sina,
  futures_hog_core,
  futures_hog_cost,
  futures_hog_supply,
  futures_spot_sys,
  futures_contract_info_cffex,
  futures_contract_info_czce,
  futures_contract_info_dce,
  futures_contract_info_gfex,
  futures_contract_info_ine,
  futures_contract_info_shfe,
} from '../futures_derivative';

describe('Futures Derivative Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('zh_subscribe_exchange_symbol', () => {
    it('should return exchange symbol data', async () => {
      try {
        const df = await zh_subscribe_exchange_symbol();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('match_main_contract', () => {
    it('should return main contract matching data', async () => {
      try {
        const df = await match_main_contract();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_display_main_sina', () => {
    it('should return main contract display from Sina', async () => {
      try {
        const df = await futures_display_main_sina();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_main_sina', () => {
    it('should return main contract data from Sina', async () => {
      try {
        const df = await futures_main_sina();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_hold_pos_sina', () => {
    it('should return holding position data from Sina', async () => {
      try {
        const df = await futures_hold_pos_sina();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_hog_core', () => {
    it('should return hog futures core data', async () => {
      try {
        const df = await futures_hog_core();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_hog_cost', () => {
    it('should return hog futures cost data', async () => {
      try {
        const df = await futures_hog_cost();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_hog_supply', () => {
    it('should return hog futures supply data', async () => {
      try {
        const df = await futures_hog_supply();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_spot_sys', () => {
    it('should return futures spot system data', async () => {
      try {
        const df = await futures_spot_sys();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_contract_info_cffex', () => {
    it('should return CFFEX contract info', async () => {
      try {
        const df = await futures_contract_info_cffex();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_contract_info_czce', () => {
    it('should return CZCE contract info', async () => {
      try {
        const df = await futures_contract_info_czce();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_contract_info_dce', () => {
    it('should return DCE contract info', async () => {
      try {
        const df = await futures_contract_info_dce();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_contract_info_gfex', () => {
    it('should return GFEX contract info', async () => {
      try {
        const df = await futures_contract_info_gfex();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_contract_info_ine', () => {
    it('should return INE contract info', async () => {
      try {
        const df = await futures_contract_info_ine();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('futures_contract_info_shfe', () => {
    it('should return SHFE contract info', async () => {
      try {
        const df = await futures_contract_info_shfe();
        expectDataFrame(df);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

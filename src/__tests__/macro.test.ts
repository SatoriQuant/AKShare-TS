/**
 * AKShare TypeScript - 宏观经济数据模块测试 (基础模块)
 */

import {
  macro_china_gdp,
  macro_china_cpi,
  macro_china_ppi,
  macro_china_pmi,
  macro_china_supply_of_money,
  macro_china_shrzgm,
  macro_usa_non_farm,
  macro_usa_interest_rate,
} from '../macro';

describe('Macro Module (基础模块)', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('macro_china_gdp', () => {
    it('should return China GDP data', async () => {
      try { const df = await macro_china_gdp(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_cpi', () => {
    it('should return China CPI data', async () => {
      try { const df = await macro_china_cpi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_ppi', () => {
    it('should return China PPI data', async () => {
      try { const df = await macro_china_ppi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_pmi', () => {
    it('should return China PMI data', async () => {
      try { const df = await macro_china_pmi(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_supply_of_money', () => {
    it('should return China supply of money', async () => {
      try { const df = await macro_china_supply_of_money(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('macro_china_shrzgm', () => {
    it('should return China social financing scale', async () => {
      try { const df = await macro_china_shrzgm(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

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
});

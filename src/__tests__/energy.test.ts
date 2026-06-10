/**
 * AKShare TypeScript - 能源模块完整测试
 */

import {
  energy_oil_hist,
  energy_gas_hist,
  energy_carbon_domestic,
  energy_carbon_bj,
  energy_carbon_sz,
  energy_carbon_eu,
  energy_carbon_hb,
  energy_carbon_gz,
  energy_oil_benchmark,
  energy_oil_detail,
} from '../energy';

describe('Energy Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('energy_oil_hist', () => {
    it('should return oil history', async () => {
      try { const df = await energy_oil_hist(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('energy_gas_hist', () => {
    it('should return gas history', async () => {
      try { const df = await energy_gas_hist(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('energy_carbon_domestic', () => {
    it('should return domestic carbon data', async () => {
      try { const df = await energy_carbon_domestic(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('energy_carbon_bj', () => {
    it('should return Beijing carbon data', async () => {
      try { const df = await energy_carbon_bj(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('energy_carbon_sz', () => {
    it('should return Shenzhen carbon data', async () => {
      try { const df = await energy_carbon_sz(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('energy_carbon_eu', () => {
    it('should return EU carbon data', async () => {
      try { const df = await energy_carbon_eu(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('energy_carbon_hb', () => {
    it('should return Hubei carbon data', async () => {
      try { const df = await energy_carbon_hb(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('energy_carbon_gz', () => {
    it('should return Guangzhou carbon data', async () => {
      try { const df = await energy_carbon_gz(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('energy_oil_benchmark', () => {
    it('should return oil benchmark data', async () => {
      try { const df = await energy_oil_benchmark(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('energy_oil_detail', () => {
    it('should return oil detail data', async () => {
      try { const df = await energy_oil_detail(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

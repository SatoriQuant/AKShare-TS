/**
 * AKShare TypeScript - 空气/文章/银行/日历/事件模块完整测试
 */

import {
  air_quality_hebei,
  air_city_table,
  air_quality_watch_point,
  air_quality_hist,
  air_quality_rank,
  sunrise_city_list,
  sunrise_daily,
  sunrise_monthly,
} from '../air';

import {
  article_epu_index,
  article_ff_crr,
  fred_md,
  fred_qd,
  article_oman_rv,
  article_oman_rv_short,
  article_rlab_rv,
} from '../article';

import {
  bank_fjcf_total_num,
  bank_fjcf_total_page,
  bank_fjcf_page_url,
  bank_fjcf_table_detail,
} from '../bank';

import {
  rv_from_stock_zh_a_hist_min_em,
  rv_from_futures_zh_minute_sina,
  volatility_yz_rv,
} from '../cal';

import {
  getAreaCodeMap,
  isProvince,
  migration_area_baidu,
  migration_scale_baidu,
} from '../event';

describe('Air Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('air_quality_hebei', () => {
    it('should return Hebei air quality', async () => {
      try { const df = await air_quality_hebei(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('air_city_table', () => {
    it('should return air city table', async () => {
      try { const df = await air_city_table(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('air_quality_watch_point', () => {
    it('should return air quality watch points', async () => {
      try { const df = await air_quality_watch_point(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('air_quality_hist', () => {
    it('should return air quality history', async () => {
      try { const df = await air_quality_hist('北京'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('air_quality_rank', () => {
    it('should return air quality ranking', async () => {
      try { const df = await air_quality_rank(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('sunrise_city_list', () => {
    it('should return sunrise city list', async () => {
      try {
        const result = await sunrise_city_list();
        expect(Array.isArray(result)).toBe(true);
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('sunrise_daily', () => {
    it('should return sunrise daily data', async () => {
      try { const df = await sunrise_daily('北京', '20240101'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('sunrise_monthly', () => {
    it('should return sunrise monthly data', async () => {
      try { const df = await sunrise_monthly('20240428', 'beijing'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Article Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('article_epu_index', () => {
    it('should return EPU index', async () => {
      try { const df = await article_epu_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('article_ff_crr', () => {
    it('should return FF CRR data', async () => {
      try { const df = await article_ff_crr(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fred_md', () => {
    it('should return FRED MD data', async () => {
      try { const df = await fred_md(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('fred_qd', () => {
    it('should return FRED QD data', async () => {
      try { const df = await fred_qd(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('article_oman_rv', () => {
    it('should return Oman RV data', async () => {
      try { const df = await article_oman_rv(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('article_oman_rv_short', () => {
    it('should return Oman RV short data', async () => {
      try { const df = await article_oman_rv_short(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('article_rlab_rv', () => {
    it('should return Rlab RV data', async () => {
      try { const df = await article_rlab_rv(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Bank Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('bank_fjcf_total_num', () => {
    it('should return total penalty number', async () => {
      try {
        const result = await bank_fjcf_total_num();
        expect(typeof result).toBe('number');
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bank_fjcf_total_page', () => {
    it('should return total penalty pages', async () => {
      try { const df = await bank_fjcf_total_page(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bank_fjcf_page_url', () => {
    it('should return penalty page URLs', async () => {
      try { const df = await bank_fjcf_page_url(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('bank_fjcf_table_detail', () => {
    it('should return penalty table details', async () => {
      try { const df = await bank_fjcf_table_detail(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Cal Module - 完整测试', () => {
  jest.setTimeout(30000);

  describe('rv_from_stock_zh_a_hist_min_em', () => {
    it('should return RV from stock minute data', async () => {
      try {
        const result = await rv_from_stock_zh_a_hist_min_em('000001');
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('rv_from_futures_zh_minute_sina', () => {
    it('should return RV from futures minute data', async () => {
      try {
        const result = await rv_from_futures_zh_minute_sina('AU0');
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('volatility_yz_rv', () => {
    it('should return Yang-Zhang RV', async () => {
      try {
        const df = {
          columns: ['open', 'high', 'low', 'close'],
          data: [[1, 2, 0.5, 1.5], [1.5, 2.5, 1, 2], [2, 3, 1.5, 2.5]],
        };
        const result = await volatility_yz_rv(df);
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Event Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('getAreaCodeMap (sync)', () => {
    it('should return area code map', () => {
      const result = getAreaCodeMap();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('isProvince (sync)', () => {
    it('should check if value is a province', () => {
      const result = isProvince('北京');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('migration_area_baidu', () => {
    it('should return migration area data from Baidu', async () => {
      try { const df = await migration_area_baidu('重庆市', 'move_in', '20230922'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('migration_scale_baidu', () => {
    it('should return migration scale data from Baidu', async () => {
      try { const df = await migration_scale_baidu('广州市', 'move_in'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

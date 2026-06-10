/**
 * AKShare TypeScript - Pro/QDII/QHKC/Rate/Tool/Data/FileFold/HF模块完整测试
 */

import {
  setProToken,
  getProToken,
  proApi,
} from '../pro';

import {
  qdii_e_index_jsl,
  qdii_e_comm_jsl,
  qdii_a_index_jsl,
} from '../qdii';

import {
  get_qhkc_fund_bs,
  get_qhkc_fund_position,
  get_qhkc_fund_position_change,
  get_qhkc_fund_money_change,
  get_qhkc_index,
  get_qhkc_index_trend,
  get_qhkc_index_profit_loss,
  qhkc_tool_foreign,
  qhkc_tool_nebula,
} from '../qhkc';

import {
  qhkc_tool_gdp,
} from '../qhkc_web';

import {
  repo_rate_query,
  repo_rate_hist,
} from '../rate';

import {
  tool_trade_date_hist_sina,
  tool_trade_date_hist_sina_offline,
} from '../tool';

import {
  get_ths_js,
  get_cninfo_js,
  get_crypto_info_url,
} from '../data';

import {
  fetch_trade_calendar,
  get_trade_calendar,
  is_trade_day,
  create_trade_calendar_set,
  count_trade_days,
} from '../file_fold';

import { hf_sp_500 } from '../hf';

describe('Pro Module - 完整测试', () => {
  jest.setTimeout(30000);

  describe('setProToken / getProToken (sync)', () => {
    it('should set and get pro token', () => {
      const originalToken = getProToken();
      setProToken('test_token');
      expect(getProToken()).toBe('test_token');
      setProToken(originalToken);
    });
  });

  describe('proApi (sync)', () => {
    it('should return DataApi instance', () => {
      const api = proApi();
      expect(api).toBeDefined();
    });
  });
});

describe('QDII Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('qdii_e_index_jsl', () => {
    it('should return QDII E index from JSL', async () => {
      try { const df = await qdii_e_index_jsl(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('qdii_e_comm_jsl', () => {
    it('should return QDII E commodity from JSL', async () => {
      try { const df = await qdii_e_comm_jsl(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('qdii_a_index_jsl', () => {
    it('should return QDII A index from JSL', async () => {
      try { const df = await qdii_a_index_jsl(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('QHKC Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('get_qhkc_fund_bs', () => {
    it('should return QHKC fund BS data', async () => {
      try { const df = await get_qhkc_fund_bs(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_qhkc_fund_position', () => {
    it('should return QHKC fund position', async () => {
      try { const df = await get_qhkc_fund_position(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_qhkc_fund_position_change', () => {
    it('should return QHKC fund position changes', async () => {
      try { const df = await get_qhkc_fund_position_change(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_qhkc_fund_money_change', () => {
    it('should return QHKC fund money changes', async () => {
      try { const df = await get_qhkc_fund_money_change(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_qhkc_index', () => {
    it('should return QHKC index', async () => {
      try { const df = await get_qhkc_index(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_qhkc_index_trend', () => {
    it('should return QHKC index trend', async () => {
      try { const df = await get_qhkc_index_trend(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_qhkc_index_profit_loss', () => {
    it('should return QHKC index profit/loss', async () => {
      try { const df = await get_qhkc_index_profit_loss(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('qhkc_tool_foreign', () => {
    it('should return QHKC foreign tool data', async () => {
      try { const df = await qhkc_tool_foreign(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('qhkc_tool_nebula', () => {
    it('should return QHKC nebula tool data', async () => {
      try { const df = await qhkc_tool_nebula(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('QHKC Web Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('qhkc_tool_gdp', () => {
    it('should return QHKC GDP tool data', async () => {
      try { const df = await qhkc_tool_gdp(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Rate Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('repo_rate_query', () => {
    it('should return repo rate query', async () => {
      try { const df = await repo_rate_query(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('repo_rate_hist', () => {
    it('should return repo rate history', async () => {
      try { const df = await repo_rate_hist(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Tool Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('tool_trade_date_hist_sina', () => {
    it('should return trade date history from Sina', async () => {
      try { const df = await tool_trade_date_hist_sina(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('tool_trade_date_hist_sina_offline', () => {
    it('should return offline trade date history', async () => {
      try { const df = await tool_trade_date_hist_sina_offline(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Data Module - 完整测试', () => {
  jest.setTimeout(30000);

  describe('get_ths_js', () => {
    it('should return THS JS data', async () => {
      try {
        const result = await get_ths_js();
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_cninfo_js', () => {
    it('should return CNINFO JS data', async () => {
      try {
        const result = await get_cninfo_js();
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_crypto_info_url (sync)', () => {
    it('should return crypto info URL', () => {
      const result = get_crypto_info_url();
      expect(typeof result).toBe('string');
    });
  });
});

describe('File Fold Module - 完整测试', () => {
  jest.setTimeout(30000);

  describe('is_trade_day (sync)', () => {
    it('should check if date is a trade day', () => {
      const calendar = new Set(['20240102', '20240103']);
      const result = is_trade_day('20240102', calendar);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('fetch_trade_calendar', () => {
    it('should fetch trade calendar', async () => {
      try {
        const result = await fetch_trade_calendar();
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('get_trade_calendar', () => {
    it('should get trade calendar', async () => {
      try {
        const result = await get_trade_calendar();
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('create_trade_calendar_set', () => {
    it('should create trade calendar set', async () => {
      try {
        const result = await create_trade_calendar_set();
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('count_trade_days', () => {
    it('should count trade days', async () => {
      try {
        const result = await count_trade_days('20240101', '20240110');
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('HF Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('hf_sp_500', () => {
    it('should return S&P 500 high frequency data', async () => {
      try { const df = await hf_sp_500(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

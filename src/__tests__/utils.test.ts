/**
 * AKShare TypeScript - 工具模块完整测试
 */

import {
  createDataFrame,
  fromRecords,
  fromJson,
  fromCommaSeparatedStrings,
  toRecords,
  selectColumns,
  renameColumns,
  convertColumn,
  filterRows,
  sortBy,
  head,
  tail,
  rowCount,
  columnCount,
  isEmpty,
  getColumn,
  getRow,
  concat,
  toJson,
} from '../utils/dataframe';

import {
  AkShareError,
  APIError,
  DataParsingError,
  InvalidParameterError,
  NetworkError,
  RateLimitError,
  TimeoutError,
  DataSourceError,
} from '../utils/errors';

import {
  config,
  initConfig,
  getConfig,
} from '../utils/config';

import {
  logger,
  setLogLevel,
} from '../utils/logger';

import {
  cache,
  withCache,
} from '../utils/cache';

describe('DataFrame Utils - 完整测试', () => {
  const sampleDataFrame = {
    columns: ['name', 'age', 'city'],
    data: [
      ['Alice', 30, 'Beijing'],
      ['Bob', 25, 'Shanghai'],
      ['Charlie', 35, 'Guangzhou'],
    ],
  };

  describe('createDataFrame', () => {
    it('should create a DataFrame', () => {
      const df = createDataFrame(sampleDataFrame.columns, sampleDataFrame.data);
      expect(df.columns).toEqual(['name', 'age', 'city']);
      expect(df.data).toHaveLength(3);
    });
  });

  describe('fromRecords', () => {
    it('should create DataFrame from records', () => {
      const records = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const df = fromRecords(records);
      expect(df.columns).toContain('name');
      expect(df.columns).toContain('age');
      expect(df.data).toHaveLength(2);
    });
  });

  describe('fromJson', () => {
    it('should create DataFrame from JSON', () => {
      const json = [sampleDataFrame];
      const df = fromJson(json);
      expect(df).toBeDefined();
    });
  });

  describe('fromCommaSeparatedStrings', () => {
    it('should create DataFrame from comma-separated strings', () => {
      const data = ['Alice,30', 'Bob,25'];
      const columns = ['name', 'age'];
      const df = fromCommaSeparatedStrings(data, columns);
      expect(df.columns).toEqual(['name', 'age']);
      expect(df.data).toHaveLength(2);
    });
  });

  describe('toRecords', () => {
    it('should convert DataFrame to records', () => {
      const records = toRecords(sampleDataFrame);
      expect(records).toHaveLength(3);
      expect(records[0]).toHaveProperty('name', 'Alice');
    });
  });

  describe('selectColumns', () => {
    it('should select specific columns', () => {
      const df = selectColumns(sampleDataFrame, ['name', 'age']);
      expect(df.columns).toEqual(['name', 'age']);
      expect(df.data[0]).toHaveLength(2);
    });
  });

  describe('renameColumns', () => {
    it('should rename columns', () => {
      const df = renameColumns(sampleDataFrame, { name: '姓名', age: '年龄' });
      expect(df.columns).toContain('姓名');
      expect(df.columns).toContain('年龄');
    });
  });

  describe('convertColumn', () => {
    it('should convert column type', () => {
      const df = convertColumn(sampleDataFrame, 'age', 'string');
      expect(df).toBeDefined();
    });
  });

  describe('filterRows', () => {
    it('should filter rows', () => {
      const df = filterRows(sampleDataFrame, (row) => row[1] > 28);
      expect(df.data).toHaveLength(2);
    });
  });

  describe('sortBy', () => {
    it('should sort by column', () => {
      const df = sortBy(sampleDataFrame, 'age', true);
      expect(df.data[0][1]).toBe(25);
    });
  });

  describe('head', () => {
    it('should return first N rows', () => {
      const df = head(sampleDataFrame, 2);
      expect(df.data).toHaveLength(2);
    });
  });

  describe('tail', () => {
    it('should return last N rows', () => {
      const df = tail(sampleDataFrame, 2);
      expect(df.data).toHaveLength(2);
    });
  });

  describe('rowCount', () => {
    it('should return row count', () => {
      expect(rowCount(sampleDataFrame)).toBe(3);
    });
  });

  describe('columnCount', () => {
    it('should return column count', () => {
      expect(columnCount(sampleDataFrame)).toBe(3);
    });
  });

  describe('isEmpty', () => {
    it('should check if DataFrame is empty', () => {
      expect(isEmpty(sampleDataFrame)).toBe(false);
      expect(isEmpty({ columns: [], data: [] })).toBe(true);
    });
  });

  describe('getColumn', () => {
    it('should get a column by name', () => {
      const col = getColumn(sampleDataFrame, 'name');
      expect(col).toEqual(['Alice', 'Bob', 'Charlie']);
    });
  });

  describe('getRow', () => {
    it('should get a row by index', () => {
      const row = getRow(sampleDataFrame, 0);
      expect(row).toBeDefined();
    });
  });

  describe('concat', () => {
    it('should concatenate DataFrames', () => {
      const df2 = {
        columns: ['name', 'age', 'city'],
        data: [['David', 40, 'Shenzhen']],
      };
      const df = concat([sampleDataFrame, df2]);
      expect(df.data).toHaveLength(4);
    });
  });

  describe('toJson', () => {
    it('should convert DataFrame to JSON', () => {
      const json = toJson(sampleDataFrame);
      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed).toBeDefined();
    });
  });
});

describe('Error Classes - 完整测试', () => {
  describe('AkShareError', () => {
    it('should create base error', () => {
      const error = new AkShareError('test error');
      expect(error.message).toBe('test error');
      expect(error.name).toBe('AkShareError');
    });
  });

  describe('APIError', () => {
    it('should create API error', () => {
      const error = new APIError('API failed', 500);
      expect(error.message).toBe('API failed');
      expect(error.name).toBe('APIError');
    });
  });

  describe('DataParsingError', () => {
    it('should create data parsing error', () => {
      const error = new DataParsingError('parse failed');
      expect(error.message).toBe('parse failed');
    });
  });

  describe('InvalidParameterError', () => {
    it('should create invalid parameter error', () => {
      const error = new InvalidParameterError('invalid param');
      expect(error.message).toBe('invalid param');
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError('network failed');
      expect(error.message).toBe('network failed');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError('rate limited');
      expect(error.message).toBe('rate limited');
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError('timeout');
      expect(error.message).toBe('timeout');
    });
  });

  describe('DataSourceError', () => {
    it('should create data source error', () => {
      const error = new DataSourceError('source failed', 'test-source');
      expect(error.message).toBe('source failed');
      expect(error.source).toBe('test-source');
    });
  });
});

describe('Config Module - 完整测试', () => {
  describe('config singleton', () => {
    it('should be defined', () => {
      expect(config).toBeDefined();
    });
  });

  describe('initConfig', () => {
    it('should initialize config', () => {
      expect(() => initConfig({})).not.toThrow();
    });
  });

  describe('getConfig', () => {
    it('should get config', () => {
      const cfg = getConfig();
      expect(cfg).toBeDefined();
    });
  });
});

describe('Logger Module - 完整测试', () => {
  describe('logger singleton', () => {
    it('should be defined', () => {
      expect(logger).toBeDefined();
    });
  });

  describe('setLogLevel', () => {
    it('should set log level', () => {
      expect(() => setLogLevel('info')).not.toThrow();
    });
  });
});

describe('Cache Module - 完整测试', () => {
  describe('cache singleton', () => {
    it('should be defined', () => {
      expect(cache).toBeDefined();
    });
  });

  describe('withCache', () => {
    it('should cache function results', async () => {
      let callCount = 0;
      const fn = async () => { callCount++; return 'result'; };
      const result1 = await withCache('test-key', fn, 1000);
      const result2 = await withCache('test-key', fn, 1000);
      expect(result1).toBe('result');
      expect(result2).toBe('result');
    });
  });
});

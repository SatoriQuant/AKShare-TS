/**
 * AKShare TypeScript - DataFrame 工具
 */

import { DataFrame } from './types';
export { DataFrame };

/**
 * 创建 DataFrame
 */
export function createDataFrame(
  columns: string[],
  data: any[][],
  index?: (string | number)[]
): DataFrame {
  return { columns, data, index };
}

/**
 * 从对象数组创建 DataFrame
 */
export function fromRecords(records: Record<string, any>[]): DataFrame {
  if (records.length === 0) {
    return { columns: [], data: [] };
  }

  const columns = Object.keys(records[0]);
  const data = records.map(record => columns.map(col => record[col]));

  return { columns, data };
}

/**
 * 从 JSON 创建 DataFrame
 */
export function fromJson(json: any[], columnNames?: string[]): DataFrame {
  if (json.length === 0) {
    return { columns: columnNames || [], data: [] };
  }

  if (columnNames) {
    const data = json.map(item => columnNames.map(col => item[col]));
    return { columns: columnNames, data };
  }

  return fromRecords(json);
}

/**
 * 从逗号分隔的字符串列表创建 DataFrame
 * 用于东方财富 K 线数据格式
 */
export function fromCommaSeparatedStrings(
  strings: string[],
  columns: string[]
): DataFrame {
  const data = strings.map(str => str.split(','));
  return { columns, data };
}

/**
 * 将 DataFrame 转换为对象数组
 */
export function toRecords(df: DataFrame): Record<string, any>[] {
  return df.data.map(row => {
    const record: Record<string, any> = {};
    df.columns.forEach((col, index) => {
      record[col] = row[index];
    });
    return record;
  });
}

/**
 * 选择列
 */
export function selectColumns(df: DataFrame, columns: string[]): DataFrame {
  const indices = columns.map(col => df.columns.indexOf(col));
  const validIndices = indices.filter(i => i !== -1);
  const validColumns = columns.filter((_, i) => indices[i] !== -1);

  const data = df.data.map(row =>
    validIndices.map(i => row[i])
  );

  return { columns: validColumns, data };
}

/**
 * 重命名列
 */
export function renameColumns(
  df: DataFrame,
  mapping: Record<string, string>
): DataFrame {
  const columns = df.columns.map(col => mapping[col] || col);
  return { ...df, columns };
}

/**
 * 转换列类型
 */
export function convertColumn(
  df: DataFrame,
  column: string,
  type: 'number' | 'string' | 'date'
): DataFrame {
  const colIndex = df.columns.indexOf(column);
  if (colIndex === -1) return df;

  const data = df.data.map(row => {
    const newRow = [...row];
    const value = newRow[colIndex];

    switch (type) {
      case 'number':
        newRow[colIndex] = value === '' || value === null || value === undefined
          ? NaN
          : Number(value);
        break;
      case 'string':
        newRow[colIndex] = String(value ?? '');
        break;
      case 'date':
        newRow[colIndex] = value ? new Date(value) : null;
        break;
    }

    return newRow;
  });

  return { ...df, data };
}

/**
 * 过滤行
 */
export function filterRows(
  df: DataFrame,
  predicate: (row: any[], columns: string[]) => boolean
): DataFrame {
  const data = df.data.filter(row => predicate(row, df.columns));
  return { ...df, data };
}

/**
 * 排序
 */
export function sortBy(
  df: DataFrame,
  column: string,
  ascending: boolean = true
): DataFrame {
  const colIndex = df.columns.indexOf(column);
  if (colIndex === -1) return df;

  const data = [...df.data].sort((a, b) => {
    const valA = a[colIndex];
    const valB = b[colIndex];

    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    const comparison = valA < valB ? -1 : 1;
    return ascending ? comparison : -comparison;
  });

  return { ...df, data };
}

/**
 * 获取前 N 行
 */
export function head(df: DataFrame, n: number = 5): DataFrame {
  return { ...df, data: df.data.slice(0, n) };
}

/**
 * 获取后 N 行
 */
export function tail(df: DataFrame, n: number = 5): DataFrame {
  return { ...df, data: df.data.slice(-n) };
}

/**
 * 获取行数
 */
export function rowCount(df: DataFrame): number {
  return df.data.length;
}

/**
 * 获取列数
 */
export function columnCount(df: DataFrame): number {
  return df.columns.length;
}

/**
 * 检查是否为空
 */
export function isEmpty(df: DataFrame): boolean {
  return df.data.length === 0;
}

/**
 * 获取某列的值
 */
export function getColumn(df: DataFrame, column: string): any[] {
  const colIndex = df.columns.indexOf(column);
  if (colIndex === -1) return [];
  return df.data.map(row => row[colIndex]);
}

/**
 * 获取某行的值
 */
export function getRow(df: DataFrame, index: number): Record<string, any> | null {
  if (index < 0 || index >= df.data.length) return null;

  const record: Record<string, any> = {};
  df.columns.forEach((col, i) => {
    record[col] = df.data[index][i];
  });
  return record;
}

/**
 * 合并多个 DataFrame
 */
export function concat(dfs: DataFrame[]): DataFrame {
  if (dfs.length === 0) {
    return { columns: [], data: [] };
  }

  const columns = dfs[0].columns;
  const data = dfs.flatMap(df => df.data);

  return { columns, data };
}

/**
 * 转换为 JSON 字符串
 */
export function toJson(df: DataFrame): string {
  return JSON.stringify(toRecords(df));
}

/**
 * 打印 DataFrame（用于调试）
 */
export function print(df: DataFrame, maxRows: number = 10): void {
  console.log('Columns:', df.columns);
  console.log('Shape:', df.data.length, 'x', df.columns.length);
  console.log('Data:');

  const rowsToShow = df.data.slice(0, maxRows);
  rowsToShow.forEach((row, i) => {
    console.log(`  [${i}]:`, row);
  });

  if (df.data.length > maxRows) {
    console.log(`  ... (${df.data.length - maxRows} more rows)`);
  }
}

/**
 * AKShare TypeScript - 上海证券交易所债券概览数据接口
 * 上登债券信息网-债券成交概览
 * http://bond.sse.com.cn/data/statistics/overview/turnover/
 */

import * as XLSX from 'xlsx';
import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

function parseWorkbook(buffer: ArrayBuffer, columns: string[]): DataFrame {
  const workbook = XLSX.read(Buffer.from(buffer), { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return createDataFrame([], []);
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as any[][];
  if (rows.length <= 1) {
    return createDataFrame([], []);
  }

  const data = rows.slice(1).map((row) => {
    const normalized = columns.map((_, index) => row[index] ?? '');
    return normalized;
  });

  return createDataFrame(columns, data);
}

/**
 * 获取债券现券市场概览
 * http://bond.sse.com.cn/data/statistics/overview/bondow/
 *
 * @param date 指定日期，格式 "20210111"
 */
export async function bond_cash_summary_sse(date: string = '20210111'): Promise<DataFrame> {
  try {
    const params = new URLSearchParams({
      sqlId: 'COMMON_SSEBOND_SCSJ_SCTJ_SCGL_ZQXQSCGL_CX_L',
      TRADE_DATE: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
    });
    const buffer = await httpGet<ArrayBuffer>(`http://query.sse.com.cn/commonExcelDd.do?${params.toString()}`, {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        Referer: 'http://bond.sse.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      },
    });

    const df = parseWorkbook(buffer, ['债券现货', '托管只数', '托管市值', '托管面值', '数据日期']);
    if (df.data.length === 0) {
      return createDataFrame([], []);
    }

    df.data.forEach((row) => {
      for (let i = 1; i <= 3; i += 1) {
        const value = Number(String(row[i]).replace(/,/g, ''));
        row[i] = Number.isFinite(value) ? value : row[i];
      }
    });
    return df;
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取债券成交概览
 * http://bond.sse.com.cn/data/statistics/overview/turnover/
 *
 * @param date 指定日期，格式 "20210104"
 */
export async function bond_deal_summary_sse(date: string = '20210104'): Promise<DataFrame> {
  try {
    const params = new URLSearchParams({
      sqlId: 'COMMON_SSEBOND_SCSJ_SCTJ_SCGL_ZQCJGL_CX_L',
      TRADE_DATE: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
    });
    const buffer = await httpGet<ArrayBuffer>(`http://query.sse.com.cn/commonExcelDd.do?${params.toString()}`, {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        Referer: 'http://bond.sse.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      },
    });

    const df = parseWorkbook(buffer, ['债券类型', '当日成交笔数', '当日成交金额', '当年成交笔数', '当年成交金额', '数据日期']);
    if (df.data.length === 0) {
      return createDataFrame([], []);
    }

    df.data.forEach((row) => {
      for (let i = 1; i <= 4; i += 1) {
        const value = Number(String(row[i]).replace(/,/g, ''));
        row[i] = Number.isFinite(value) ? value : row[i];
      }
    });
    return df;
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * AKShare TypeScript - 深圳证券交易所-期权子网-行情数据-当日合约
 * https://www.sse.org.cn/option/quotation/contract/daycontract/index.html
 */

import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 深圳证券交易所-期权子网-行情数据-当日合约
 * https://www.sse.org.cn/option/quotation/contract/daycontract/index.html
 * @returns 深圳期权当日合约
 */
export async function option_current_day_szse(): Promise<DataFrame> {
  const url = 'https://www.sse.org.cn/api/report/ShowReport';
  const params = {
    SHOWTYPE: 'xlsx',
    CATALOGID: 'option_drhy',
    TABKEY: 'tab1',
  };

  try {
    const response = await axios.get(url, {
      params,
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const wb = XLSX.read(response.data, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

    if (!Array.isArray(jsonRows) || jsonRows.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '合约编码', '合约代码', '合约简称', '标的证券简称(代码)',
      '合约类型', '行权价', '合约单位', '最后交易日', '行权日', '到期日',
      '交收日', '新挂', '涨停价格', '跌停价格', '前结算价', '合约调整',
      '停牌', '合约总持仓', '挂牌原因', '原合约代码', '原合约简称',
      '原行权价格', '原合约单位', '合约到期剩余交易天数', '合约到期剩余自然天数',
      '下次合约调整剩余交易天数', '下次合约调整剩余自然天数', '交易日期',
    ];

    const toNum = (v: any): number | null => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const rows = jsonRows.map((item) => [
      toNum(item['序号']),
      item['合约编码'] ?? '',
      item['合约代码'] ?? '',
      item['合约简称'] ?? '',
      item['标的证券简称(代码)'] ?? '',
      item['合约类型'] ?? '',
      toNum(item['行权价']),
      toNum(item['合约单位']),
      item['最后交易日'] ?? '',
      item['行权日'] ?? '',
      item['到期日'] ?? '',
      item['交收日'] ?? '',
      item['新挂'] ?? '',
      toNum(item['涨停价格']),
      toNum(item['跌停价格']),
      toNum(item['前结算价']),
      item['合约调整'] ?? '',
      item['停牌'] ?? '',
      toNum(item['合约总持仓']),
      item['挂牌原因'] ?? '',
      item['原合约代码'] ?? '',
      item['原合约简称'] ?? '',
      toNum(item['原行权价格']),
      toNum(item['原合约单位']),
      toNum(item['合约到期剩余交易天数']),
      toNum(item['合约到期剩余自然天数']),
      toNum(item['下次合约调整剩余交易天数']),
      toNum(item['下次合约调整剩余自然天数']),
      item['交易日期'] ?? '',
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

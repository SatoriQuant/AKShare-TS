/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-一致行动人
 * https://data.eastmoney.com/yzxdr/
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-一致行动人
 * https://data.eastmoney.com/yzxdr/
 *
 * The API returns data wrapped in a JSONP callback. We need to parse it correctly.
 *
 * @param date 每年的季度末时间点，格式 "20240930"
 * @returns 一致行动人数据
 */
export async function stock_yzxdr_em(date: string = '20240930'): Promise<DataFrame> {
  try {
    const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;

    const url = 'https://datacenter.eastmoney.com/api/data/get';
    const params = {
      type: 'RPTA_WEB_YZXDRINDEX',
      sty: 'ALL',
      source: 'WEB',
      p: '1',
      ps: '500',
      st: 'noticedate',
      sr: '-1',
      var: 'mwUyirVm',
      filter: `(enddate='${dateFormatted}')`,
      rt: '53575609',
    };

    const text = await httpGetText(url, { params });

    // Parse JSONP response: callbackName({...})
    let dataJson: any;
    try {
      // Try direct JSON parse first
      dataJson = JSON.parse(text);
    } catch {
      // Try JSONP: find the JSON object
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        return createDataFrame([], []);
      }
      dataJson = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    }

    if (!dataJson?.result?.data) {
      return createDataFrame([], []);
    }

    const totalPage = dataJson.result.pages;
    let allData: any[] = [...dataJson.result.data];

    for (let page = 2; page <= totalPage; page++) {
      const pageParams = { ...params, p: String(page) };
      const pageText = await httpGetText(url, { params: pageParams });

      let pageJson: any;
      try {
        pageJson = JSON.parse(pageText);
      } catch {
        const jsonStart = pageText.indexOf('{');
        const jsonEnd = pageText.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) continue;
        pageJson = JSON.parse(pageText.substring(jsonStart, jsonEnd + 1));
      }

      if (pageJson?.result?.data) {
        allData = allData.concat(pageJson.result.data);
      }
    }

    const columns = [
      '序号', '股票代码', '股票简称', '一致行动人', '股东排名',
      '持股数量', '持股比例', '持股数量变动', '行业', '公告日期',
    ];

    const rows = allData.map((item: any, index: number) => [
      String(index + 1),
      item.SECURITY_CODE,
      item.SECURITY_NAME_ABBR,
      item.HOLDER_NAME,
      item.HOLDER_RANK != null ? String(item.HOLDER_RANK) : null,
      item.HOLD_NUM != null ? String(item.HOLD_NUM) : null,
      item.HOLD_RATIO != null ? String(item.HOLD_RATIO) : null,
      item.HOLD_NUM_CHANGE != null ? String(item.HOLD_NUM_CHANGE) : null,
      item.INDUSTRY,
      item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

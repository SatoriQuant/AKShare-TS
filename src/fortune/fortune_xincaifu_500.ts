/**
 * AKShare TypeScript - 新财富500人富豪榜
 * http://www.xcf.cn/zhuanti/ztzz/hdzt1/500frb/index.html
 */

import { httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 新财富500人富豪榜
 * http://www.xcf.cn/zhuanti/ztzz/hdzt1/500frb/index.html
 *
 * @param year 具体排名年份，数据从2003年至今
 * @returns 排行榜数据
 */
export async function xincaifu_rank(year: string = '2022'): Promise<DataFrame> {
  const url = 'http://service.ikuyu.cn/XinCaiFu2/pcremoting/bdListAction.do';
  const params = {
    method: 'getPage',
    callback: 'jsonpCallback',
    sortBy: '',
    order: '',
    type: '4',
    keyword: '',
    pageSize: '1000',
    year: year,
    pageNo: '1',
    from: 'jsonp',
  };

  const responseText = await httpGetText(url, { params });

  // 解析 JSONP 格式: jsonpCallback({...})
  const jsonStart = responseText.indexOf('{');
  const jsonEnd = responseText.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    return createDataFrame([], []);
  }

  const jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
  const dataJson = JSON.parse(jsonStr);

  if (!dataJson?.data?.rows) {
    return createDataFrame([], []);
  }

  const rows = dataJson.data.rows as Array<Record<string, any>>;

  // 列名映射
  const columnMapping: Record<string, string> = {
    assets: '财富',
    year: '年份',
    sex: '性别',
    name: '姓名',
    rank: '排名',
    company: '主要公司',
    industry: '相关行业',
    addr: '公司总部',
    age: '年龄',
  };

  // 选择并重命名列
  const selectColumns = ['排名', '财富', '姓名', '主要公司', '相关行业', '公司总部', '性别', '年龄', '年份'];
  const sourceKeys = Object.entries(columnMapping)
    .filter(([, cn]) => selectColumns.includes(cn))
    .map(([en]) => en);

  const columns = selectColumns;
  const data = rows.map(row =>
    selectColumns.map(cn => {
      const enKey = Object.entries(columnMapping).find(([, v]) => v === cn)?.[0];
      return enKey ? (row[enKey] ?? '') : '';
    })
  );

  return createDataFrame(columns, data);
}

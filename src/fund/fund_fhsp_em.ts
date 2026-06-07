/**
 * AKShare TypeScript - 基金分红送配数据接口
 * 天天基金网-基金数据-分红送配
 * https://fund.eastmoney.com/data/fundfenhong.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  concat,
} from '../utils/dataframe';

/**
 * 获取基金分红数据 - 东方财富
 * https://fund.eastmoney.com/data/fundfenhong.html
 *
 * @param year 查询年份
 * @param typ 基金类型，空串表示全部
 * @param rank 排序字段
 * @param sort 排序方向
 * @param page 查询页数，-1 表示全部
 */
export async function fund_fh_em(
  year: string = '2025',
  typ: string = '',
  rank: string = 'BZDM',
  sort: string = 'asc',
  page: number = -1
): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/Data/funddataIndex_Interface.aspx';

  try {
    const params = {
      dt: '8',
      page: page === -1 ? '1' : String(page),
      rank,
      sort,
      gs: '',
      ftype: typ,
      year,
    };

    const parseResponse = (text: string): any[][] => {
      const arrStart = text.indexOf('[[');
      const arrEnd = text.indexOf(';var jjfh_jjgs');
      if (arrStart === -1 || arrEnd === -1) return [];
      try {
        return JSON.parse(text.slice(arrStart, arrEnd));
      } catch {
        // 尝试用 Function 构造器解析（Python 的 eval 等价）
        try {
          const code = text.slice(arrStart, arrEnd);
          return new Function(`return ${code}`)();
        } catch {
          return [];
        }
      }
    };

    const getTotalPages = (text: string): number => {
      const eqIndex = text.indexOf('=');
      const semiIndex = text.indexOf(';');
      if (eqIndex === -1 || semiIndex === -1) return 1;
      try {
        const arr = new Function(`return ${text.slice(eqIndex + 1, semiIndex)}`)();
        return arr[0] || 1;
      } catch {
        return 1;
      }
    };

    const text = await httpGetText(url, { params });
    let allData: any[][] = parseResponse(text);

    if (page === -1) {
      const totalPages = getTotalPages(text);
      for (let p = 2; p <= totalPages; p++) {
        const pageParams = { ...params, page: String(p) };
        const pageText = await httpGetText(url, { params: pageParams });
        const pageData = parseResponse(pageText);
        allData = allData.concat(pageData);
      }
    }

    const columns = [
      '序号', '基金代码', '基金简称', '权益登记日', '除息日期', '分红', '分红发放日',
    ];

    const rows = allData.map((item: any[], index: number) => [
      index + 1,
      item[0] || '',
      item[1] || '',
      item[2] || '',
      item[3] || '',
      parseFloat(item[4]) || null,
      item[5] || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金拆分数据 - 东方财富
 * https://fund.eastmoney.com/data/fundchaifen.html
 *
 * @param year 查询年份
 * @param typ 基金类型，空串表示全部
 * @param rank 排序字段
 * @param sort 排序方向
 * @param page 查询页数，-1 表示全部
 */
export async function fund_cf_em(
  year: string = '2025',
  typ: string = '',
  rank: string = 'FSRQ',
  sort: string = 'desc',
  page: number = -1
): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/Data/funddataIndex_Interface.aspx';

  try {
    const params = {
      dt: '9',
      page: page === -1 ? '1' : String(page),
      rank,
      sort,
      gs: '',
      ftype: typ,
      year,
    };

    const parseResponse = (text: string): any[][] => {
      const arrStart = text.indexOf('[[');
      const arrEnd = text.indexOf(';var jjcf_jjgs');
      if (arrStart === -1 || arrEnd === -1) return [];
      try {
        const code = text.slice(arrStart, arrEnd);
        return new Function(`return ${code}`)();
      } catch {
        return [];
      }
    };

    const getTotalPages = (text: string): number => {
      const eqIndex = text.indexOf('=');
      const semiIndex = text.indexOf(';');
      if (eqIndex === -1 || semiIndex === -1) return 1;
      try {
        const arr = new Function(`return ${text.slice(eqIndex + 1, semiIndex)}`)();
        return arr[0] || 1;
      } catch {
        return 1;
      }
    };

    const text = await httpGetText(url, { params });
    let allData: any[][] = parseResponse(text);

    if (page === -1) {
      const totalPages = getTotalPages(text);
      for (let p = 2; p <= totalPages; p++) {
        const pageParams = { ...params, page: String(p) };
        const pageText = await httpGetText(url, { params: pageParams });
        const pageData = parseResponse(pageText);
        allData = allData.concat(pageData);
      }
    }

    const columns = [
      '序号', '基金代码', '基金简称', '拆分折算日', '拆分类型', '拆分折算',
    ];

    const rows = allData.map((item: any[], index: number) => [
      index + 1,
      item[0] || '',
      item[1] || '',
      item[2] || '',
      item[3] || '',
      parseFloat(item[4]) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金分红排行数据 - 东方财富
 * https://fund.eastmoney.com/data/fundleijifenhong.html
 */
export async function fund_fh_rank_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/Data/funddataIndex_Interface.aspx';
  const params = {
    dt: '10',
    page: '1',
    rank: 'FHFCZ',
    sort: 'desc',
    gs: '',
    ftype: '',
  };

  try {
    const parseResponse = (text: string): any[][] => {
      const arrStart = text.indexOf('[[');
      const arrEnd = text.indexOf(';var fhph_jjgs');
      if (arrStart === -1 || arrEnd === -1) return [];
      try {
        return new Function(`return ${text.slice(arrStart, arrEnd)}`)();
      } catch {
        return [];
      }
    };

    const getTotalPages = (text: string): number => {
      const eqIndex = text.indexOf('=');
      const semiIndex = text.indexOf(';');
      if (eqIndex === -1 || semiIndex === -1) return 1;
      try {
        const arr = new Function(`return ${text.slice(eqIndex + 1, semiIndex)}`)();
        return arr[0] || 1;
      } catch {
        return 1;
      }
    };

    const text = await httpGetText(url, { params });
    const totalPages = getTotalPages(text);
    let allData: any[][] = parseResponse(text);

    for (let p = 2; p <= totalPages; p++) {
      const pageParams = { ...params, page: String(p) };
      const pageText = await httpGetText(url, { params: pageParams });
      const pageData = parseResponse(pageText);
      allData = allData.concat(pageData);
    }

    const columns = [
      '序号', '基金代码', '基金简称', '累计分红', '累计次数', '成立日期',
    ];

    const rows = allData.map((item: any[], index: number) => [
      index + 1,
      item[0] || '',
      item[1] || '',
      parseFloat(item[2]) || null,
      parseInt(item[3]) || null,
      item[4] || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

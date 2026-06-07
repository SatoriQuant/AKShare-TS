/**
 * AKShare TypeScript - 基金排行数据接口
 * 东方财富网-数据中心-开放基金排行
 * https://fund.eastmoney.com/data/fundranking.html
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取开放基金排行 - 东方财富
 *
 * @param symbol 基金类型：全部, 股票型, 混合型, 债券型, 指数型, QDII, LOF, FOF
 */
export async function fund_open_fund_rank_em(
  symbol: '全部' | '股票型' | '混合型' | '债券型' | '指数型' | 'QDII' | 'LOF' | 'FOF' = '全部'
): Promise<DataFrame> {
  // 计算一年前的日期
  const now = new Date();
  const current_date = now.toISOString().slice(0, 10);
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const last_date = oneYearAgo.toISOString().slice(0, 10);

  const typeMap: Record<string, string[]> = {
    '全部': ['all', '1nzf'],
    '股票型': ['gp', '1nzf'],
    '混合型': ['hh', '1nzf'],
    '债券型': ['zq', '1nzf'],
    '指数型': ['zs', '1nzf'],
    'QDII': ['qdii', '1nzf'],
    'LOF': ['lof', '1nzf'],
    'FOF': ['fof', '1nzf'],
  };

  const url = 'https://fund.eastmoney.com/data/rankhandler.aspx';
  const params = {
    op: 'ph',
    dt: 'kf',
    ft: typeMap[symbol][0],
    rs: '',
    gs: '0',
    sc: typeMap[symbol][1],
    st: 'desc',
    sd: last_date.replace(/-/g, ''),
    ed: current_date.replace(/-/g, ''),
    qdii: '',
    tabSubtype: ',,,,,',
    pi: '1',
    pn: '30000',
    dx: '1',
  };

  try {
    const text = await httpGetText(url, {
      params,
      headers: {
        Referer: 'https://fund.eastmoney.com/fundguzhi.html',
      },
    });

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    if (!data?.datas) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '基金代码', '基金简称', '日期', '单位净值', '累计净值',
      '日增长率', '近1周', '近1月', '近3月', '近6月', '近1年',
      '近2年', '近3年', '今年来', '成立来', '自定义', '手续费',
    ];

    const rows = data.datas.map((item: string, index: number) => {
      const parts = item.split(',');
      return [
        index + 1,
        parts[0],
        parts[2],
        parts[3],
        parseFloat(parts[4]) || null,
        parseFloat(parts[5]) || null,
        parseFloat(parts[6]) || null,
        parseFloat(parts[7]) || null,
        parseFloat(parts[8]) || null,
        parseFloat(parts[9]) || null,
        parseFloat(parts[10]) || null,
        parseFloat(parts[11]) || null,
        parseFloat(parts[12]) || null,
        parseFloat(parts[13]) || null,
        parseFloat(parts[14]) || null,
        parseFloat(parts[15]) || null,
        parseFloat(parts[18]) || null,
        parts[20] || '',
      ];
    });

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取场内交易基金排行 - 东方财富
 * https://fund.eastmoney.com/data/fbsfundranking.html
 */
export async function fund_exchange_rank_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/data/rankhandler.aspx';
  const params = {
    op: 'ph',
    dt: 'fb',
    ft: 'ct',
    rs: '',
    gs: '0',
    sc: '1nzf',
    st: 'desc',
    pi: '1',
    pn: '30000',
  };

  try {
    const text = await httpGetText(url, {
      params,
      headers: {
        Referer: 'https://fund.eastmoney.com/fundguzhi.html',
      },
    });

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    if (!data?.datas) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '基金代码', '基金简称', '类型', '日期', '单位净值', '累计净值',
      '近1周', '近1月', '近3月', '近6月', '近1年', '近2年', '近3年',
      '今年来', '成立来', '成立日期',
    ];

    const rows = data.datas.map((item: string, index: number) => {
      const parts = item.split(',');
      return [
        index + 1,
        parts[0],
        parts[2],
        parts[21],
        parts[3],
        parseFloat(parts[4]) || null,
        parseFloat(parts[5]) || null,
        parseFloat(parts[6]) || null,
        parseFloat(parts[7]) || null,
        parseFloat(parts[8]) || null,
        parseFloat(parts[9]) || null,
        parseFloat(parts[10]) || null,
        parseFloat(parts[11]) || null,
        parseFloat(parts[12]) || null,
        parseFloat(parts[13]) || null,
        parseFloat(parts[14]) || null,
        parts[15] || '',
      ];
    });

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取货币型基金排行 - 东方财富
 * https://fund.eastmoney.com/data/hbxfundranking.html
 */
export async function fund_money_rank_em(): Promise<DataFrame> {
  const url = 'https://api.fund.eastmoney.com/FundRank/GetHbRankList';
  const params = {
    intCompany: '0',
    MinsgType: '',
    IsSale: '1',
    strSortCol: 'SYL_1N',
    orderType: 'desc',
    pageIndex: '1',
    pageSize: '10000',
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Referer: 'https://fund.eastmoney.com/fundguzhi.html',
      },
    });

    if (!data?.Data) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '基金代码', '基金简称', '日期', '万份收益',
      '年化收益率7日', '年化收益率14日', '年化收益率28日',
      '近1月', '近3月', '近6月', '近1年', '近2年', '近3年', '近5年',
      '今年来', '成立来', '手续费',
    ];

    const rows = data.Data.map((item: any, index: number) => [
      index + 1,
      item.SYMBOL,
      item.SHORTNAME,
      item.FSRQ ? item.FSRQ.split('T')[0] : '',
      parseFloat(item.DWJZ) || null,
      parseFloat(item.SYL_7D) || null,
      parseFloat(item.SYL_14D) || null,
      parseFloat(item.SYL_28D) || null,
      parseFloat(item.SYL_1M) || null,
      parseFloat(item.SYL_3M) || null,
      parseFloat(item.SYL_6M) || null,
      parseFloat(item.SYL_1N) || null,
      parseFloat(item.SYL_2N) || null,
      parseFloat(item.SYL_3N) || null,
      parseFloat(item.SYL_5N) || null,
      parseFloat(item.SYL_JN) || null,
      parseFloat(item.SYL_CL) || null,
      item.SHOPRATE || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取香港基金排行 - 东方财富
 * https://overseas.1234567.com.cn/FundList
 */
export async function fund_hk_rank_em(): Promise<DataFrame> {
  const now = new Date();
  const format_date = now.toISOString().slice(0, 10);

  const url = 'https://overseas.1234567.com.cn/overseasapi/OpenApiHander.ashx';
  const params = {
    api: 'HKFDApi',
    m: 'MethodFundList',
    action: '1',
    pageindex: '0',
    pagesize: '5000',
    dy: '1',
    date1: format_date,
    date2: format_date,
    sortfield: 'Y',
    sorttype: '-1',
    isbuy: '0',
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Referer: 'https://fund.eastmoney.com/fundguzhi.html',
      },
    });

    if (!data?.Data) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '基金代码', '基金简称', '币种', '日期', '单位净值',
      '日增长率', '近1周', '近1月', '近3月', '近6月', '近1年',
      '近2年', '近3年', '今年来', '成立来', '可购买', '香港基金代码',
    ];

    const rows = data.Data.map((item: any, index: number) => [
      index + 1,
      item.FCODE || '',
      item.SHORTNAME || '',
      item.CURRENCY || '',
      item.PDATE ? item.PDATE.split('T')[0] : '',
      parseFloat(item.DWJZ) || null,
      parseFloat(item.SYL_D) || null,
      parseFloat(item.SYL_1Z) || null,
      parseFloat(item.SYL_1Y) || null,
      parseFloat(item.SYL_3Y) || null,
      parseFloat(item.SYL_6Y) || null,
      parseFloat(item.SYL_1N) || null,
      parseFloat(item.SYL_2N) || null,
      parseFloat(item.SYL_3N) || null,
      parseFloat(item.SYL_JN) || null,
      parseFloat(item.SYL_CL) || null,
      item.ISBUY === '1' ? '可购买' : '不可购买',
      item.HKFCode || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

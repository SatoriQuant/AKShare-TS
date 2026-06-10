/**
 * AKShare TypeScript - 基金数据接口
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

function parseLooseObject(text: string): any {
  const start = text.indexOf('{');
  if (start === -1) {
    return null;
  }
  const body = text.slice(start).replace(/;\s*$/, '');
  try {
    return JSON.parse(body);
  } catch {
    const fn = new Function(`return (${body});`);
    return fn();
  }
}

function toPandasNumericString(value: any): string {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return '';
  }
  const num = Number(raw);
  if (!Number.isFinite(num)) {
    return '';
  }
  return Number.isInteger(num) ? num.toFixed(1) : num.toString();
}

/**
 * 获取基金列表 - 东方财富
 *
 * @param fundType 基金类型：gp 股票型, hh 混合型, zq 债券型, zs 指数型, qdii QDII, fof FOF
 */
export async function fund_name_em(
  fundType: 'gp' | 'hh' | 'zq' | 'zs' | 'qdii' | 'fof' = 'gp'
): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/js/fundcode_search.js';

  try {
    const text = await httpGetText(url);

    // 解析 var r = [[...], ...];
    const match = text.match(/var\s+r\s*=\s*(\[[\s\S]*\])\s*;/);
    if (!match) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(match[1]);

    const columns = ['基金代码', '拼音缩写', '基金简称', '基金类型', '拼音全称'];
    const rows = data.map((item: string[]) => [
      item[0] || '',
      item[1] || '',
      item[2] || '',
      item[3] || '',
      item[4] || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金申购状态 - 东方财富
 * https://fund.eastmoney.com/Fund_sgzt_bzdm.html
 */
export async function fund_purchase_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/Data/Fund_JJJZ_Data.aspx';
  const params = {
    t: '8',
    page: '1,50000',
    js: 'reData',
    sort: 'fcode,asc',
  };

  try {
    const text = await httpGetText(url, { params });

    const data = parseLooseObject(text.replace(/^\s*var\s+reData\s*=\s*/i, ''));

    if (!data?.datas) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '基金代码', '基金简称', '基金类型', '最新净值/万份收益',
      '最新净值/万份收益-报告时间', '申购状态', '赎回状态', '下一开放日',
      '购买起点', '日累计限定金额', '手续费',
    ];

    const rows = data.datas.map((item: string[], index: number) => [
      index + 1,
      item[0] || '',
      item[1] || '',
      item[2] || '',
      item[3] || '',
      item[4] || '',
      item[5] || '',
      item[6] || '',
      item[7] || '',
      item[8] || '',
      item[9] || '',
      item[13] || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取开放式基金每日净值 - 东方财富
 * https://fund.eastmoney.com/fund.html
 */
export async function fund_open_fund_daily_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/Data/Fund_JJJZ_Data.aspx';
  const params = {
    t: '1',
    lx: '1',
    letter: '',
    gsid: '',
    text: '',
    sort: 'zdf,desc',
    page: '1,50000',
    dt: Date.now().toString(),
    atfc: '',
    onlySale: '0',
  };

  try {
    const text = await httpGetText(url, { params });

    const data = parseLooseObject(text.replace(/^\s*var\s+db\s*=\s*/i, ''));
    if (!data?.datas || !data?.showday) {
      return createDataFrame([], []);
    }

    const showDay = data.showday;

    const columns = [
      '基金代码', '基金简称',
      `${showDay[0]}-单位净值`, `${showDay[0]}-累计净值`,
      `${showDay[1]}-单位净值`, `${showDay[1]}-累计净值`,
      '日增长值', '日增长率', '申购状态', '赎回状态', '手续费',
    ];

    const rows = data.datas.map((item: string[]) => [
      item[0] || '',
      item[1] || '',
      item[3] || '',
      item[4] || '',
      item[5] || '',
      item[6] || '',
      item[7] || '',
      item[8] || '',
      item[9] || '',
      item[10] || '',
      item[16] || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取开放式基金历史净值 - 东方财富
 * 通过解析 pingzhongdata JS 文件获取数据
 *
 * @param symbol 基金代码
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function fund_open_fund_info_em(
  symbol: string = '710001',
  startDate?: string,
  endDate?: string
): Promise<DataFrame> {
  const url = `https://fund.eastmoney.com/pingzhongdata/${symbol}.js`;

  try {
    const text = await httpGetText(url, {
      headers: {
        Referer: 'https://fund.eastmoney.com/',
      },
    });

    // Extract Data_netWorthTrend array
    const match = text.match(/var\s+Data_netWorthTrend\s*=\s*(\[.*?\])\s*;/s);
    if (!match) {
      return createDataFrame([], []);
    }

    const data: Array<{ x: number; y: number; equityReturn: number }> = JSON.parse(match[1]);

    const columns = ['净值日期', '单位净值', '日增长率'];

    let rows = data.map((item) => {
      const date = new Date(item.x);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return [
        dateStr,
        item.y !== null && item.y !== undefined ? String(item.y) : '',
        item.equityReturn !== null && item.equityReturn !== undefined ? String(item.equityReturn) : '',
      ];
    });

    // Filter by startDate and endDate if provided
    if (startDate) {
      rows = rows.filter((row) => row[0] >= startDate);
    }
    if (endDate) {
      rows = rows.filter((row) => row[0] <= endDate);
    }

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金实时估值 - 东方财富
 * https://fund.eastmoney.com/fundguzhi.html
 *
 * @param symbol 基金类型：全部, 股票型, 混合型, 债券型, 指数型, QDII, ETF联接, LOF, 场内交易基金
 */
export async function fund_value_estimation_em(
  symbol: '全部' | '股票型' | '混合型' | '债券型' | '指数型' | 'QDII' | 'ETF联接' | 'LOF' | '场内交易基金' = '全部'
): Promise<DataFrame> {
  const symbolMap: Record<string, number> = {
    '全部': 1,
    '股票型': 2,
    '混合型': 3,
    '债券型': 4,
    '指数型': 5,
    'QDII': 6,
    'ETF联接': 7,
    'LOF': 8,
    '场内交易基金': 9,
  };

  const url = 'https://api.fund.eastmoney.com/FundGuZhi/GetFundGZList';
  const params = {
    type: String(symbolMap[symbol]),
    sort: '3',
    orderType: 'desc',
    canbuy: '0',
    pageIndex: '1',
    pageSize: '20000',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Accept: '*/*',
        Referer: 'https://fund.eastmoney.com/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
      },
    });

    if (!data?.Data?.list) {
      return createDataFrame([], []);
    }

    const valueDay = data.Data.gzrq || '';
    const calDay = data.Data.gxrq || '';

    const columns = [
      '序号', '基金代码', '基金名称',
      `${calDay}-估算数据-估算值`, `${calDay}-估算数据-估算增长率`,
      `${calDay}-公布数据-单位净值`, `${calDay}-公布数据-日增长率`,
      '估算偏差', `${valueDay}-单位净值`,
    ];

    const rows = data.Data.list.map((item: any, index: number) => [
      index + 1,
      item[0] || '',
      item[26] || '',
      parseFloat(item[20]) || null,
      parseFloat(item[21]) || null,
      parseFloat(item[24]) || null,
      parseFloat(item[22]) || null,
      parseFloat(item[19]) || null,
      parseFloat(item[23]) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金信息-指数型 - 东方财富
 * https://fund.eastmoney.com/trade/zs.html
 *
 * @param symbol 选择范围：全部, 沪深指数, 行业主题, 大盘指数, 中盘指数, 小盘指数, 股票指数, 债券指数
 * @param indicator 跟踪方式：全部, 被动指数型, 增强指数型
 */
export async function fund_info_index_em(
  symbol: '全部' | '沪深指数' | '行业主题' | '大盘指数' | '中盘指数' | '小盘指数' | '股票指数' | '债券指数' = '沪深指数',
  indicator: '全部' | '被动指数型' | '增强指数型' = '被动指数型'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '全部': '',
    '沪深指数': '053',
    '行业主题': '054',
    '大盘指数': '01',
    '中盘指数': '02',
    '小盘指数': '03',
    '股票指数': '050|001',
    '债券指数': '050|003',
  };

  const indicatorMap: Record<string, string> = {
    '全部': '',
    '被动指数型': '051',
    '增强指数型': '052',
  };

  const url = 'https://api.fund.eastmoney.com/FundTradeRank/GetRankList';

  const symbolParts = symbolMap[symbol].split('|');
  const fr = symbolParts[0];
  const ftype = symbol === '股票指数' || symbol === '债券指数' ? symbolParts[1] : '';

  const params: Record<string, string> = {
    ft: 'zs',
    sc: '1n',
    st: 'desc',
    pi: '1',
    pn: '10000',
    cp: '',
    ct: '',
    cd: '',
    ms: '',
    fr,
    plevel: '',
    fst: '',
    ftype,
    fr1: indicatorMap[indicator],
    fl: '0',
    isab: '1',
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Accept: '*/*',
        Referer: 'https://fund.eastmoney.com/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
      },
    });

    if (!data?.Data) {
      return createDataFrame([], []);
    }

    const jsonData = typeof data.Data === 'string' ? JSON.parse(data.Data) : data.Data;

    if (!jsonData?.datas) {
      return createDataFrame([], []);
    }

    const columns = [
      '基金代码', '基金名称', '单位净值', '日期', '日增长率',
      '近1周', '近1月', '近3月', '近6月', '近1年', '近2年', '近3年',
      '今年来', '成立来', '手续费', '起购金额', '跟踪标的', '跟踪方式',
    ];

    const rows = jsonData.datas.map((item: string) => {
      const parts = item.split('|');
      return [
        parts[0] || '',
        parts[1] || '',
        toPandasNumericString(parts[4]),
        parts[3] || '',
        toPandasNumericString(parts[5]),
        toPandasNumericString(parts[6]),
        toPandasNumericString(parts[7]),
        toPandasNumericString(parts[8]),
        toPandasNumericString(parts[9]),
        toPandasNumericString(parts[10]),
        toPandasNumericString(parts[11]),
        toPandasNumericString(parts[12]),
        toPandasNumericString(parts[13]),
        toPandasNumericString(parts[14]),
        toPandasNumericString(parts[18]),
        parts[24] || '',
        symbol,
        indicator,
      ];
    });

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取货币型基金历史净值 - 东方财富
 *
 * @param symbol 货币型基金代码
 */
export async function fund_money_fund_info_em(
  symbol: string = '000009'
): Promise<DataFrame> {
  const url = 'https://api.fund.eastmoney.com/f10/lsjz';
  const params = {
    fundCode: symbol,
    pageIndex: '1',
    pageSize: '10000',
    startDate: '',
    endDate: '',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Referer: `https://fundf10.eastmoney.com/jjjz_${symbol}.html`,
      },
    });

    if (!data?.Data?.LSJZList) {
      return createDataFrame([], []);
    }

    const columns = ['净值日期', '每万份收益', '7日年化收益率', '申购状态', '赎回状态'];
    const rows = data.Data.LSJZList.map((item: any) => [
      item.FSRQ,
      parseFloat(item.DWJZ) || null,
      parseFloat(item.LJJZ) || null,
      item.SGZT,
      item.SHZT,
    ]);

    // 按日期排序
    rows.sort((a: any[], b: any[]) => (a[0] || '').localeCompare(b[0] || ''));

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取分级基金每日净值 - 东方财富
 * https://fund.eastmoney.com/fjjj.html
 */
export async function fund_graded_fund_daily_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/Data/Fund_JJJZ_Data.aspx';
  const params = {
    t: '1',
    lx: '9',
    letter: '',
    gsid: '0',
    text: '',
    sort: 'zdf,desc',
    page: '1,10000',
    dt: Date.now().toString(),
    atfc: '',
  };

  try {
    const text = await httpGetText(url, {
      params,
      headers: {
        Referer: 'https://fund.eastmoney.com/fjjj.html',
      },
    });

    const data = parseLooseObject(text.replace(/^\s*var\s+db\s*=\s*/i, ''));

    if (!data?.datas || !data?.showday) {
      return createDataFrame([], []);
    }

    const showDay = data.showday;

    const columns = [
      '基金代码', '基金简称',
      `${showDay[0]}-单位净值`, `${showDay[0]}-累计净值`,
      `${showDay[1]}--单位净值`, `${showDay[1]}--累计净值`,
      '日增长值', '日增长率', '市价', '折价率', '手续费',
    ];

    const rows = data.datas.map((item: any[]) => [
      item?.[0] ?? '',
      item?.[1] ?? '',
      item?.[3] ?? '',
      item?.[4] ?? '',
      item?.[5] ?? '',
      item?.[6] ?? '',
      item?.[7] ?? '',
      item?.[8] ?? '',
      item?.[9] ?? '',
      item?.[10] ?? '',
      item?.[19] ?? '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取分级基金历史净值 - 东方财富
 *
 * @param symbol 分级基金代码
 */
export async function fund_graded_fund_info_em(
  symbol: string = '150232'
): Promise<DataFrame> {
  const url = 'https://api.fund.eastmoney.com/f10/lsjz';
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    Referer: `https://fundf10.eastmoney.com/jjjz_${symbol}.html`,
  };

  try {
    const baseParams = {
      fundCode: symbol,
      pageIndex: '1',
      pageSize: '20',
      startDate: '',
      endDate: '',
      _: Date.now(),
    };

    const firstData = await httpGet<any>(url, { params: baseParams, headers });
    const totalCount = Number(firstData?.TotalCount ?? 0);
    if (!Array.isArray(firstData?.Data?.LSJZList) || totalCount <= 0) {
      return createDataFrame([], []);
    }

    const totalPage = Math.ceil(totalCount / 20);
    const allRows = [...firstData.Data.LSJZList];

    for (let page = 2; page <= totalPage; page++) {
      const pageData = await httpGet<any>(url, {
        params: { ...baseParams, pageIndex: String(page), _: Date.now() + page },
        headers,
      });
      if (Array.isArray(pageData?.Data?.LSJZList)) {
        allRows.push(...pageData.Data.LSJZList);
      }
    }

    allRows.sort((a: any, b: any) => String(a?.FSRQ ?? '').localeCompare(String(b?.FSRQ ?? '')));

    const columns = ['净值日期', '单位净值', '累计净值', '日增长率', '申购状态', '赎回状态'];
    const rows = allRows.map((item: any) => [
      item?.FSRQ ?? '',
      toPandasNumericString(item?.DWJZ),
      toPandasNumericString(item?.LJJZ),
      toPandasNumericString(item?.JZZZL),
      item?.SGZT ?? '',
      item?.SHZT ?? '',
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取香港基金历史净值 - 东方财富
 * https://overseas.1234567.com.cn/f10/FundJz/968092
 *
 * @param code 香港基金代码
 * @param symbol 历史净值明细 或 分红送配详情
 */
export async function fund_hk_fund_hist_em(
  code: string = '1002200683',
  symbol: '历史净值明细' | '分红送配详情' = '历史净值明细'
): Promise<DataFrame> {
  const url = 'https://overseas.1234567.com.cn/overseasapi/OpenApiHander.ashx';

  try {
    if (symbol === '历史净值明细') {
      const params = {
        api: 'HKFDApi',
        m: 'MethodJZ',
        hkfcode: code,
        action: '2',
        pageindex: '0',
        pagesize: '1000',
        date1: '',
        date2: '',
      };

      const data = await httpGet<any>(url, { params });

      if (!data?.Data) {
        return createDataFrame([], []);
      }

      const columns = ['净值日期', '单位净值', '日增长值', '日增长率', '单位'];
      const rows = data.Data.map((item: any) => {
        if (Array.isArray(item)) {
          return [
            item[3] || '',
            item[4] ?? '',
            item[6] ?? '',
            item[7] ?? '',
            item[9] || '',
          ];
        }
        return [
          item?.PDATE || '',
          item?.NAV ?? '',
          item?.NAVCHG ?? '',
          item?.NAVCHGRT ?? '',
          item?.CURRENCY || '',
        ];
      });

      return createDataFrame(columns, rows);
    } else {
      const params = {
        api: 'HKFDApi',
        m: 'MethodJZ',
        hkfcode: code,
        action: '3',
        pageindex: '0',
        pagesize: '1000',
        date1: '',
        date2: '',
      };

      const data = await httpGet<any>(url, { params });

      if (!data?.Data) {
        return createDataFrame([], []);
      }

      const columns = ['年份', '权益登记日', '除息日', '分红发放日', '分红金额', '单位'];
      const rows = data.Data.map((item: any) => {
        if (Array.isArray(item)) {
          return [
            item[5] || '',
            item[8] || '',
            item[7] || '',
            item[9] || '',
            item[6] ?? '',
            item[11] || '',
          ];
        }
        return [
          item?.BYEAR || '',
          item?.REGDATE || '',
          item?.EXDDATE || '',
          item?.ISSDATE || '',
          item?.BONUS ?? '',
          item?.CURRENCY || '',
        ];
      });

      return createDataFrame(columns, rows);
    }
  } catch (error) {
    return createDataFrame([], []);
  }
}

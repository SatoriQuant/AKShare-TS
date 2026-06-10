/**
 * AKShare TypeScript - 中国债券市场数据接口
 * 中国外汇交易中心暨全国银行间同业拆借中心
 * https://www.chinamoney.com.cn/chinese/mkdatabond/
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取中国国债收益率曲线 - 中国债券信息网
 *
 * @param date 日期，格式 "2024-01-01"
 */
export async function bond_china_yield(date?: string): Promise<DataFrame> {
  const url = 'https://yield.chinabond.com.cn/cbweb-cbrc-web/cbrc/queryGjqxInfo';

  const params: Record<string, any> = {
    locale: 'zh_CN',
  };

  if (date) {
    params.workTime = date;
  }

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.records) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '期限', '收益率'];
    const rows = data.records.map((item: any) => [
      item.workTime,
      item.jqx,
      parseFloat(item.syl),
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取中国国债收益率历史数据 - 东方财富
 */
export async function bond_zh_us_rate(startYear?: string): Promise<DataFrame> {
  const url = 'https://datacenter.eastmoney.com/api/data/get';
  const pageSize = 500;
  const baseParams = {
    type: 'RPTA_WEB_TREASURYYIELD',
    sty: 'ALL',
    st: 'SOLAR_DATE',
    sr: '-1',
    token: '894050c76af8597a853f5b408b759f5d',
    ps: String(pageSize),
  };

  const toStartDate = (input?: string): string => {
    if (!input) return '19901219';
    const compact = input.replace(/[^\d]/g, '');
    if (compact.length === 8) return compact;
    if (compact.length === 4) return `${compact}0101`;
    return '19901219';
  };

  const formatDate = (value: any): string => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const datePart = raw.includes(' ') ? raw.split(' ')[0] : raw;
    return datePart;
  };

  const startDate = toStartDate(startYear);
  const startDateObj = new Date(`${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`);

  const firstPage = await httpGet<any>(url, {
    params: {
      ...baseParams,
      p: '1',
      pageNo: '1',
      pageNum: '1',
    },
  });

  const totalPages = Number(firstPage?.result?.pages ?? 0);
  if (!Number.isFinite(totalPages) || totalPages <= 0) {
    return createDataFrame([], []);
  }

  const allRows: any[] = [];
  for (let page = 1; page <= totalPages; page++) {
    const pageData = page === 1
      ? firstPage
      : await httpGet<any>(url, {
          params: {
            ...baseParams,
            p: String(page),
            pageNo: String(page),
            pageNum: String(page),
          },
        });

    const currentRows = pageData?.result?.data;
    if (Array.isArray(currentRows) && currentRows.length > 0) {
      allRows.push(...currentRows);

      const lastDate = formatDate(currentRows[currentRows.length - 1]?.SOLAR_DATE);
      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        if (!Number.isNaN(lastDateObj.getTime()) && lastDateObj <= startDateObj) {
          break;
        }
      }
    }
  }

  if (allRows.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期',
    '中国国债收益率2年',
    '中国国债收益率5年',
    '中国国债收益率10年',
    '中国国债收益率30年',
    '中国国债收益率10年-2年',
    '中国GDP年增率',
    '美国国债收益率2年',
    '美国国债收益率5年',
    '美国国债收益率10年',
    '美国国债收益率30年',
    '美国国债收益率10年-2年',
    '美国GDP年增率',
  ];

  const rows = allRows
    .map((item: any) => {
      const date = formatDate(item?.SOLAR_DATE);
      return [
        date,
        item?.EMM00588704 ?? '',
        item?.EMM00166462 ?? '',
        item?.EMM00166466 ?? '',
        item?.EMM00166469 ?? '',
        item?.EMM01276014 ?? '',
        item?.EMM00000024 ?? '',
        item?.EMG00001306 ?? '',
        item?.EMG00001308 ?? '',
        item?.EMG00001310 ?? '',
        item?.EMG00001312 ?? '',
        item?.EMG01339436 ?? '',
        item?.EMG00159635 ?? '',
      ];
    })
    .filter((row: any[]) => row[0])
    .sort((a: any[], b: any[]) => String(a[0]).localeCompare(String(b[0])));

  const filteredRows = rows.filter((row: any[]) => {
    const d = new Date(String(row[0]));
    if (Number.isNaN(d.getTime())) return false;
    return d >= startDateObj;
  });

  return createDataFrame(columns, filteredRows);
}

/**
 * 获取中国债券总指数 - 东方财富
 */
export async function bond_china_close_return(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_BOND_CLOSE_RETURN',
    columns: 'ALL',
    pageNumber: '1',
    pageSize: '10000',
    sortTypes: '-1',
    sortColumns: 'TRADE_DATE',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '指数名称', '收盘指数', '涨跌幅', '成交量', '成交额'];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE,
    item.INDEX_NAME,
    item.CLOSE_INDEX,
    item.CHANGE_RATE,
    item.DEAL_AMOUNT,
    item.DEAL_VOLUME,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取收盘收益率曲线映射数据
 * https://www.chinamoney.com.cn/chinese/bkcurvclosedyhis/?bondType=CYCC000&reference=1
 */
export async function bond_china_close_return_map(): Promise<DataFrame> {
  const url = 'https://www.chinamoney.com.cn/ags/ms/cm-u-bk-currency/ClsYldCurvCurvGO';

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Length': '0',
        'Host': 'www.chinamoney.com.cn',
        'Origin': 'https://www.chinamoney.com.cn',
        'Pragma': 'no-cache',
        'Referer': 'https://www.chinamoney.com.cn/chinese/bkcurvclosedyhis/?bondType=CYCC000&reference=1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!data?.records) {
      return createDataFrame([], []);
    }

    // 根据实际返回数据结构处理
    const columns = Object.keys(data.records[0] || {});
    const rows = data.records.map((item: any) => columns.map(col => item[col]));

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取现券市场做市报价
 * https://www.chinamoney.com.cn/chinese/mkdatabond/
 */
export async function bond_spot_quote(): Promise<DataFrame> {
  const url = 'https://www.chinamoney.com.cn/ags/ms/cm-u-md-bond/CbMktMakQuot';
  const payload = {
    flag: '1',
    lang: 'cn',
  };

  try {
    const data = await httpPost<any>(url, payload, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    if (!data?.records) {
      return createDataFrame([], []);
    }

    const columns = [
      '报价机构', '债券简称', '买入净价', '卖出净价', '买入收益率', '卖出收益率'
    ];

    const rows = data.records.map((item: any) => {
      const buySellPrice = item.buySellNetPrice || '';
      const buySellYield = item.buySellYield || '';
      const [buyPrice, sellPrice] = buySellPrice.split('/');
      const [buyYield, sellYield] = buySellYield.split('/');

      return [
        item.instName,
        item.bondName,
        parseFloat(buyPrice) || null,
        parseFloat(sellPrice) || null,
        parseFloat(buyYield) || null,
        parseFloat(sellYield) || null,
      ];
    });

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取现券市场成交行情
 * https://www.chinamoney.com.cn/chinese/mkdatabond/
 */
export async function bond_spot_deal(): Promise<DataFrame> {
  const url = 'https://www.chinamoney.com.cn/ags/ms/cm-u-md-bond/CbtPri';
  const payload = {
    flag: '1',
    lang: 'cn',
    bondName: '',
  };

  try {
    const data = await httpPost<any>(url, payload, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    if (!data?.records) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券简称', '成交净价', '最新收益率', '涨跌', '加权收益率', '交易量'
    ];

    const rows = data.records.map((item: any) => [
      item.bondName,
      parseFloat(item.netPrice) || null,
      parseFloat(item.latestYield) || null,
      parseFloat(item.change) || null,
      parseFloat(item.weightedYield) || null,
      parseFloat(item.volume) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取收盘收益率曲线历史数据
 * https://www.chinamoney.com.cn/chinese/bkcurvclosedyhis/?bondType=CYCC000&reference=1
 *
 * @param symbol 债券类型，如 "国债", "同业存单(AAA)"
 * @param period 期限间隔，如 "0.1", "0.5", "1"
 * @param startDate 开始日期，格式 "20231101"
 * @param endDate 结束日期，格式 "20231101"（与开始日期间隔不超过1个月）
 */
export async function bond_china_close_return_history(
  symbol: string = '国债',
  period: string = '1',
  startDate: string = '20231101',
  endDate: string = '20231101'
): Promise<DataFrame> {
  // 先获取债券类型映射
  const mapDf = await bond_china_close_return_map();

  if (mapDf.data.length === 0) {
    return createDataFrame([], []);
  }

  // 查找对应的债券类型代码
  const cnLabelIndex = mapDf.columns.indexOf('cnLabel');
  const valueIndex = mapDf.columns.indexOf('value');

  if (cnLabelIndex === -1 || valueIndex === -1) {
    return createDataFrame([], []);
  }

  const symbolRow = mapDf.data.find(row => row[cnLabelIndex] === symbol);
  if (!symbolRow) {
    return createDataFrame([], []);
  }

  const symbolCode = symbolRow[valueIndex];
  const url = 'https://www.chinamoney.com.cn/ags/ms/cm-u-bk-currency/ClsYldCurvHis';

  const params = {
    lang: 'CN',
    reference: '1,2,3',
    bondType: symbolCode,
    startDate: `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`,
    endDate: `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`,
    termId: period,
    pageNum: '1',
    pageSize: '50',
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    if (!data?.records) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '期限', '到期收益率', '即期收益率', '远期收益率'];

    const rows = data.records.map((item: any) => [
      item.dateValue,
      parseFloat(item.term) || null,
      parseFloat(item.yieldToMaturity) || null,
      parseFloat(item.spotRate) || null,
      parseFloat(item.forwardRate) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

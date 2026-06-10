/**
 * AKShare TypeScript - 东方财富大宗交易数据接口
 * https://data.eastmoney.com/dzjy/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-大宗交易-市场统计
 */
export async function stock_dzjy_sctj(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const columns = [
    '序号', '交易日期', '上证指数', '上证指数涨跌幅', '大宗交易成交总额',
    '溢价成交总额', '溢价成交总额占比', '折价成交总额', '折价成交总额占比',
  ];

  const allRows: any[][] = [];
  let pageNumber = 1;

  while (true) {
    const params = {
      sortColumns: 'TRADE_DATE',
      sortTypes: '-1',
      pageSize: '500',
      pageNumber: String(pageNumber),
      reportName: 'PRT_BLOCKTRADE_MARKET_STA',
      columns: 'TRADE_DATE,SZ_INDEX,SZ_CHANGE_RATE,BLOCKTRADE_DEAL_AMT,PREMIUM_DEAL_AMT,PREMIUM_RATIO,DISCOUNT_DEAL_AMT,DISCOUNT_RATIO',
      source: 'WEB',
      client: 'WEB',
    };

    const data = await httpGet<any>(url, { params });
    if (!data?.result?.data || data.result.data.length === 0) {
      break;
    }

    const pageRows = data.result.data.map((item: any) => [
      String(allRows.length + 1),
      item.TRADE_DATE ? item.TRADE_DATE.substring(0, 10) : item.TRADE_DATE,
      String(item.SZ_INDEX ?? ''),
      String(item.SZ_CHANGE_RATE ?? ''),
      String(item.BLOCKTRADE_DEAL_AMT ?? ''),
      String(item.PREMIUM_DEAL_AMT ?? ''),
      String(item.PREMIUM_RATIO ?? ''),
      String(item.DISCOUNT_DEAL_AMT ?? ''),
      String(item.DISCOUNT_RATIO ?? ''),
    ]);
    allRows.push(...pageRows);

    if (data.result.data.length < 500) {
      break;
    }
    pageNumber++;
  }

  return createDataFrame(columns, allRows);
}

/**
 * 东方财富-数据中心-大宗交易-每日明细
 *
 * @param symbol 证券类型：A股, B股, 基金, 债券
 * @param startDate 开始日期，格式 "20220104"
 * @param endDate 结束日期，格式 "20220104"
 */
export async function stock_dzjy_mrmx(
  symbol: 'A股' | 'B股' | '基金' | '债券' = '基金',
  startDate: string = '20220104',
  endDate: string = '20220104'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    'A股': '1', 'B股': '2', '基金': '3', '债券': '4',
  };

  const formatDate = (d: string) =>
    `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'SECURITY_CODE',
    sortTypes: '1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_DATA_BLOCKTRADE',
    columns: 'TRADE_DATE,SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,CHANGE_RATE,CLOSE_PRICE,DEAL_PRICE,PREMIUM_RATIO,DEAL_VOLUME,DEAL_AMT,TURNOVER_RATE,BUYER_NAME,SELLER_NAME,CHANGE_RATE_1DAYS,CHANGE_RATE_5DAYS,CHANGE_RATE_10DAYS,CHANGE_RATE_20DAYS,BUYER_CODE,SELLER_CODE',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_TYPE_WEB=${symbolMap[symbol]})(TRADE_DATE>='${formatDate(startDate)}')(TRADE_DATE<='${formatDate(endDate)}')`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  if (symbol === 'A股') {
    const columns = [
      '序号', '交易日期', '证券代码', '证券简称', '涨跌幅', '收盘价', '成交价',
      '折溢率', '成交量', '成交额', '成交额/流通市值', '买方营业部', '卖方营业部',
    ];

    const rows = data.result.data.map((item: any, index: number) => [
      String(index + 1),
      item.TRADE_DATE ? item.TRADE_DATE.substring(0, 10) : item.TRADE_DATE,
      item.SECURITY_CODE,
      item.SECURITY_NAME_ABBR,
      String(item.CHANGE_RATE ?? ''),
      String(item.CLOSE_PRICE ?? ''),
      String(item.DEAL_PRICE ?? ''),
      String(item.PREMIUM_RATIO ?? ''),
      String(item.DEAL_VOLUME ?? ''),
      String(item.DEAL_AMT ?? ''),
      String(item.TURNOVER_RATE ?? ''),
      item.BUYER_NAME,
      item.SELLER_NAME,
    ]);

    return createDataFrame(columns, rows);
  } else {
    const columns = [
      '序号', '交易日期', '证券代码', '证券简称', '成交价', '成交量', '成交额',
      '买方营业部', '卖方营业部',
    ];

    const rows = data.result.data.map((item: any, index: number) => [
      String(index + 1),
      item.TRADE_DATE ? item.TRADE_DATE.substring(0, 10) : item.TRADE_DATE,
      item.SECURITY_CODE,
      item.SECURITY_NAME_ABBR,
      String(item.DEAL_PRICE ?? ''),
      String(item.DEAL_VOLUME ?? ''),
      String(item.DEAL_AMT ?? ''),
      item.BUYER_NAME,
      item.SELLER_NAME,
    ]);

    return createDataFrame(columns, rows);
  }
}

/**
 * 东方财富-数据中心-大宗交易-每日统计
 *
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function stock_dzjy_mrtj(
  startDate: string = '20220105',
  endDate: string = '20220105'
): Promise<DataFrame> {
  const formatDate = (d: string) =>
    `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'TURNOVERRATE',
    sortTypes: '-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_BLOCKTRADE_STA',
    columns: 'TRADE_DATE,SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,CHANGE_RATE,CLOSE_PRICE,AVERAGE_PRICE,PREMIUM_RATIO,DEAL_NUM,VOLUME,DEAL_AMT,TURNOVERRATE,D1_CLOSE_ADJCHRATE,D5_CLOSE_ADJCHRATE,D10_CLOSE_ADJCHRATE,D20_CLOSE_ADJCHRATE',
    source: 'WEB',
    client: 'WEB',
    filter: `(TRADE_DATE>='${formatDate(startDate)}')(TRADE_DATE<='${formatDate(endDate)}')`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '交易日期', '证券代码', '证券简称', '涨跌幅', '收盘价', '成交价',
    '折溢率', '成交笔数', '成交总量', '成交总额', '成交总额/流通市值',
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    String(index + 1),
    item.TRADE_DATE ? item.TRADE_DATE.substring(0, 10) : item.TRADE_DATE,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    String(item.CHANGE_RATE ?? ''),
    String(item.CLOSE_PRICE ?? ''),
    String(item.AVERAGE_PRICE ?? ''),
    String(item.PREMIUM_RATIO ?? ''),
    String(item.DEAL_NUM ?? ''),
    String(item.VOLUME ?? ''),
    String(item.DEAL_AMT ?? ''),
    String(item.TURNOVERRATE ?? ''),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-大宗交易-活跃 A 股统计
 *
 * @param symbol 周期：近一月, 近三月, 近六月, 近一年
 */
export async function stock_dzjy_hygtj(
  symbol: '近一月' | '近三月' | '近六月' | '近一年' = '近三月'
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    '近一月': '1', '近三月': '3', '近六月': '6', '近一年': '12',
  };

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'DEAL_NUM,SECURITY_CODE',
    sortTypes: '-1,-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_BLOCKTRADE_ACSTA',
    columns: 'SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,CLOSE_PRICE,CHANGE_RATE,TRADE_DATE,DEAL_AMT,PREMIUM_RATIO,SUM_TURNOVERRATE,DEAL_NUM,PREMIUM_TIMES,DISCOUNT_TIMES,D1_AVG_ADJCHRATE,D5_AVG_ADJCHRATE,D10_AVG_ADJCHRATE,D20_AVG_ADJCHRATE,DATE_TYPE_CODE',
    source: 'WEB',
    client: 'WEB',
    filter: `(DATE_TYPE_CODE=${periodMap[symbol]})`,
  };

  const allRows: any[][] = [];
  let pageNumber = 1;

  while (true) {
    const pageParams = {
      ...params,
      pageNumber: String(pageNumber),
    };

    const data = await httpGet<any>(url, { params: pageParams });
    if (!data?.result?.data || data.result.data.length === 0) {
      break;
    }

    const pageRows = data.result.data.map((item: any) => [
      String(allRows.length + 1),
      item.SECURITY_CODE,
      item.SECURITY_NAME_ABBR,
      String(item.CLOSE_PRICE ?? ''),
      String(item.CHANGE_RATE ?? ''),
      item.TRADE_DATE ? item.TRADE_DATE.substring(0, 10) : item.TRADE_DATE,
      String(item.DEAL_NUM ?? ''),
      String(item.PREMIUM_TIMES ?? ''),
      String(item.DISCOUNT_TIMES ?? ''),
      String(item.DEAL_AMT ?? ''),
      String(item.PREMIUM_RATIO ?? ''),
      String(item.SUM_TURNOVERRATE ?? ''),
      String(item.D1_AVG_ADJCHRATE ?? ''),
      String(item.D5_AVG_ADJCHRATE ?? ''),
      String(item.D10_AVG_ADJCHRATE ?? ''),
      String(item.D20_AVG_ADJCHRATE ?? ''),
    ]);
    allRows.push(...pageRows);

    if (data.result.data.length < 5000) {
      break;
    }
    pageNumber++;
  }

  const columns = [
    '序号', '证券代码', '证券简称', '最新价', '涨跌幅', '最近上榜日',
    '上榜次数-总计', '上榜次数-溢价', '上榜次数-折价',
    '总成交额', '折溢率', '成交总额/流通市值',
    '上榜日后平均涨跌幅-1日', '上榜日后平均涨跌幅-5日',
    '上榜日后平均涨跌幅-10日', '上榜日后平均涨跌幅-20日',
  ];

  return createDataFrame(columns, allRows);
}

/**
 * 东方财富-数据中心-大宗交易-活跃营业部统计
 *
 * @param symbol 周期：当前交易日, 近3日, 近5日, 近10日, 近30日
 */
export async function stock_dzjy_hyyybtj(
  symbol: '当前交易日' | '近3日' | '近5日' | '近10日' | '近30日' = '近3日'
): Promise<DataFrame> {
  const periodMap: Record<string, number> = {
    '当前交易日': -1, '近3日': -3, '近5日': -5, '近10日': -10, '近30日': -30,
  };

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const baseParams = {
    sortColumns: 'BUYER_NUM,TOTAL_BUYAMT',
    sortTypes: '-1,-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_BLOCKTRADE_OPERATEDEPTSTATISTICS',
    columns: 'OPERATEDEPT_CODE,OPERATEDEPT_NAME,ONLIST_DATE,STOCK_DETAILS,BUYER_NUM,SELLER_NUM,TOTAL_BUYAMT,TOTAL_SELLAMT,TOTAL_NETAMT,N_DATE',
    source: 'WEB',
    client: 'WEB',
    filter: `(N_DATE=${periodMap[symbol]})`,
  };

  const columns = [
    '序号', '最近上榜日', '营业部名称', '次数总计-买入', '次数总计-卖出',
    '成交金额统计-买入', '成交金额统计-卖出', '成交金额统计-净买入额', '买入的股票',
  ];

  const allRows: any[][] = [];
  let pageNumber = 1;

  while (true) {
    const params = {
      ...baseParams,
      pageNumber: String(pageNumber),
    };

    const data = await httpGet<any>(url, { params });
    if (!data?.result?.data || data.result.data.length === 0) {
      break;
    }

    const pageRows = data.result.data.map((item: any) => [
      String(allRows.length + 1),
      item.ONLIST_DATE ? item.ONLIST_DATE.substring(0, 10) : item.ONLIST_DATE,
      item.OPERATEDEPT_NAME,
      String(item.BUYER_NUM ?? ''),
      String(item.SELLER_NUM ?? ''),
      String(item.TOTAL_BUYAMT ?? ''),
      String(item.TOTAL_SELLAMT ?? ''),
      String(item.TOTAL_NETAMT ?? ''),
      item.STOCK_DETAILS,
    ]);
    allRows.push(...pageRows);

    if (data.result.data.length < 5000) {
      break;
    }
    pageNumber++;
  }

  return createDataFrame(columns, allRows);
}

/**
 * 东方财富-数据中心-大宗交易-营业部排行
 *
 * @param symbol 周期：近一月, 近三月, 近六月, 近一年
 */
export async function stock_dzjy_yybph(
  symbol: '近一月' | '近三月' | '近六月' | '近一年' = '近三月'
): Promise<DataFrame> {
  const periodMap: Record<string, number> = {
    '近一月': -30, '近三月': -90, '近六月': -180, '近一年': -360,
  };

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const baseParams = {
    sortColumns: 'D5_BUYER_NUM,D1_AVERAGE_INCREASE',
    sortTypes: '-1,-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_BLOCKTRADE_OPERATEDEPT_RANK',
    columns: 'OPERATEDEPT_CODE,OPERATEDEPT_NAME,D1_BUYER_NUM,D1_AVERAGE_INCREASE,D1_RISE_PROBABILITY,D5_BUYER_NUM,D5_AVERAGE_INCREASE,D5_RISE_PROBABILITY,D10_BUYER_NUM,D10_AVERAGE_INCREASE,D10_RISE_PROBABILITY,D20_BUYER_NUM,D20_AVERAGE_INCREASE,D20_RISE_PROBABILITY,N_DATE,RELATED_ORG_CODE',
    source: 'WEB',
    client: 'WEB',
    filter: `(N_DATE=${periodMap[symbol]})`,
  };

  const columns = [
    '序号', '营业部名称',
    '上榜后1天-买入次数', '上榜后1天-平均涨幅', '上榜后1天-上涨概率',
    '上榜后5天-买入次数', '上榜后5天-平均涨幅', '上榜后5天-上涨概率',
    '上榜后10天-买入次数', '上榜后10天-平均涨幅', '上榜后10天-上涨概率',
    '上榜后20天-买入次数', '上榜后20天-平均涨幅', '上榜后20天-上涨概率',
  ];

  const allRows: any[][] = [];
  let pageNumber = 1;

  while (true) {
    const params = {
      ...baseParams,
      pageNumber: String(pageNumber),
    };

    const data = await httpGet<any>(url, { params });
    if (!data?.result?.data || data.result.data.length === 0) {
      break;
    }

    const pageRows = data.result.data.map((item: any) => [
      String(allRows.length + 1),
      item.OPERATEDEPT_NAME,
      String(item.D1_BUYER_NUM ?? ''), String(item.D1_AVERAGE_INCREASE ?? ''), String(item.D1_RISE_PROBABILITY ?? ''),
      String(item.D5_BUYER_NUM ?? ''), String(item.D5_AVERAGE_INCREASE ?? ''), String(item.D5_RISE_PROBABILITY ?? ''),
      String(item.D10_BUYER_NUM ?? ''), String(item.D10_AVERAGE_INCREASE ?? ''), String(item.D10_RISE_PROBABILITY ?? ''),
      String(item.D20_BUYER_NUM ?? ''), String(item.D20_AVERAGE_INCREASE ?? ''), String(item.D20_RISE_PROBABILITY ?? ''),
    ]);
    allRows.push(...pageRows);

    if (data.result.data.length < 5000) {
      break;
    }
    pageNumber++;
  }

  return createDataFrame(columns, allRows);
}

/**
 * AKShare TypeScript - 东方财富网-数据中心-新股数据-打新收益率
 * https://data.eastmoney.com/xg/xg/dxsyl.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-新股申购-打新收益率
 * https://data.eastmoney.com/xg/xg/dxsyl.html
 * @returns 打新收益率数据
 */
export async function stock_dxsyl_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'LISTING_DATE,SECURITY_CODE',
    sortTypes: '-1,-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPTA_APP_IPOAPPLY',
    quoteColumns: 'f2~01~SECURITY_CODE,f14~01~SECURITY_CODE',
    quoteType: '0',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: '((APPLY_DATE>\'2010-01-01\')(|@APPLY_DATE="NULL"))((LISTING_DATE>\'2010-01-01\')(|@LISTING_DATE="NULL"))(TRADE_MARKET_CODE!="069001017")',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  // 获取剩余页数据
  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '序号', '股票代码', '股票简称', '发行价', '最新价',
    '网上-发行中签率', '网上-有效申购股数', '网上-有效申购户数',
    '网上-超额认购倍数', '网下-配售中签率', '网下-有效申购股数',
    '网下-有效申购户数', '网下-配售认购倍数', '总发行数量',
    '开盘溢价', '首日涨幅', '上市日期'
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.f14,
    item.ISSUE_PRICE,
    item.LATELY_PRICE,
    item.ONLINE_ISSUE_LWR,
    item.ONLINE_VA_SHARES,
    item.ONLINE_VA_NUM,
    item.ONLINE_ES_MULTIPLE,
    item.OFFLINE_VAP_RATIO,
    item.OFFLINE_VATS,
    item.OFFLINE_VAP_OBJECT,
    item.OFFLINE_VAS_MULTIPLE,
    item.ISSUE_NUM,
    item.LD_OPEN_PREMIUM,
    item.LD_CLOSE_CHANGE,
    item.LISTING_DATE ? new Date(item.LISTING_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 新股申购与中签查询
 * https://data.eastmoney.com/xg/xg/default_2.html
 * @param symbol 市场类型，可选 {"全部股票", "沪市主板", "科创板", "深市主板", "创业板", "北交所"}
 * @returns 新股申购与中签数据
 */
export async function stock_xgsglb_em(
  symbol: string = '全部股票'
): Promise<DataFrame> {
  const marketMap: Record<string, string> = {
    '全部股票': `(APPLY_DATE>'2010-01-01')`,
    '沪市主板': `(APPLY_DATE>'2010-01-01')(SECURITY_TYPE_CODE in ("058001001","058001008"))(TRADE_MARKET_CODE in ("069001001001","069001001003","069001001006"))`,
    '科创板': `(APPLY_DATE>'2010-01-01')(SECURITY_TYPE_CODE in ("058001001","058001008"))(TRADE_MARKET_CODE="069001001006")`,
    '深市主板': `(APPLY_DATE>'2010-01-01')(SECURITY_TYPE_CODE="058001001")(TRADE_MARKET_CODE in ("069001002001","069001002002","069001002003","069001002005"))`,
    '创业板': `(APPLY_DATE>'2010-01-01')(SECURITY_TYPE_CODE="058001001")(TRADE_MARKET_CODE="069001002002")`,
  };

  const url = 'http://datacenter-web.eastmoney.com/api/data/v1/get';

  if (symbol === '北交所') {
    const params = {
      sortColumns: 'APPLY_DATE',
      sortTypes: '-1',
      pageSize: '500',
      pageNumber: '1',
      columns: 'ALL',
      reportName: 'RPT_NEEQ_ISSUEINFO_LIST',
      quoteColumns: 'f14~01~SECURITY_CODE~SECURITY_NAME_ABBR',
      source: 'NEEQSELECT',
      client: 'WEB',
    };

    const data = await httpGet<any>(url, { params });

    if (!data?.result?.data) {
      return createDataFrame([], []);
    }

    const totalPage = data.result.pages;
    let allData: any[] = [...data.result.data];

    for (let page = 2; page <= totalPage; page++) {
      const pageParams = { ...params, pageNumber: String(page) };
      const pageData = await httpGet<any>(url, { params: pageParams });
      if (pageData?.result?.data) {
        allData = allData.concat(pageData.result.data);
      }
    }

    const columns = [
      '代码', '简称', '申购代码', '发行总数', '网上-发行数量',
      '网上-申购上限', '网上-顶格所需资金', '发行价格', '申购日',
      '中签率', '稳获百股需配资金', '最新价格-价格', '最新价格-累计涨幅',
      '上市首日-上市日', '上市首日-均价', '上市首日-涨幅',
      '上市首日-每百股获利', '上市首日-约合年化收益', '发行市盈率',
      '行业市盈率', '参与申购资金', '参与申购人数'
    ];

    const rows = allData.map((item: any) => [
      item.SECURITY_CODE,
      item.SECURITY_NAME_ABBR,
      item.APPLY_CODE,
      item.EXPECT_ISSUE_NUM,
      item.ONLINE_ISSUE_NUM,
      item.APPLY_NUM_UPPER,
      item.APPLY_AMT_UPPER,
      item.ISSUE_PRICE,
      item.APPLY_DATE ? new Date(item.APPLY_DATE).toISOString().split('T')[0] : null,
      item.ONLINE_ISSUE_LWR,
      item.APPLY_AMT_100,
      item.NEWEST_PRICE,
      item.CLOSE_PRICE && item.NEWEST_PRICE ? item.CLOSE_PRICE / item.NEWEST_PRICE : null,
      item.SELECT_LISTING_DATE ? new Date(item.SELECT_LISTING_DATE).toISOString().split('T')[0] : null,
      item.AVERAGE_PRICE,
      item.LD_CLOSE_CHANGE,
      item.PER_SHARES_INCOME,
      item.CAPTURE_PROFIT,
      item.ISSUE_PE_RATIO,
      item.INDUSTRY_PE_RATIO,
      item.VA_AMT,
      item.ORG_VAN,
    ]);

    return createDataFrame(columns, rows);
  } else {
    const params = {
      sortColumns: 'APPLY_DATE,SECURITY_CODE',
      sortTypes: '-1,-1',
      pageSize: '5000',
      pageNumber: '1',
      reportName: 'RPTA_APP_IPOAPPLY',
      columns: 'SECURITY_CODE,SECURITY_NAME,TRADE_MARKET_CODE,APPLY_CODE,TRADE_MARKET,MARKET_TYPE,ORG_TYPE,ISSUE_NUM,ONLINE_ISSUE_NUM,OFFLINE_PLACING_NUM,TOP_APPLY_MARKETCAP,PREDICT_ONFUND_UPPER,ONLINE_APPLY_UPPER,PREDICT_ONAPPLY_UPPER,ISSUE_PRICE,LATELY_PRICE,CLOSE_PRICE,APPLY_DATE,BALLOT_NUM_DATE,BALLOT_PAY_DATE,LISTING_DATE,AFTER_ISSUE_PE,ONLINE_ISSUE_LWR,INITIAL_MULTIPLE,INDUSTRY_PE_NEW,OFFLINE_EP_OBJECT,CONTINUOUS_1WORD_NUM,TOTAL_CHANGE,PROFIT,LIMIT_UP_PRICE,INFO_CODE,OPEN_PRICE,LD_OPEN_PREMIUM,LD_CLOSE_CHANGE,TURNOVERRATE,LD_HIGH_CHANG,LD_AVERAGE_PRICE,OPEN_DATE,OPEN_AVERAGE_PRICE,PREDICT_PE,PREDICT_ISSUE_PRICE2,PREDICT_ISSUE_PRICE,PREDICT_ISSUE_PRICE1,PREDICT_ISSUE_PE,PREDICT_PE_THREE,ONLINE_APPLY_PRICE,MAIN_BUSINESS',
      filter: marketMap[symbol],
      source: 'WEB',
      client: 'WEB',
    };

    const data = await httpGet<any>(url, { params });

    if (!data?.result?.data) {
      return createDataFrame([], []);
    }

    const totalPage = data.result.pages;
    let allData: any[] = [...data.result.data];

    for (let page = 2; page <= totalPage; page++) {
      const pageParams = { ...params, pageNumber: String(page) };
      const pageData = await httpGet<any>(url, { params: pageParams });
      if (pageData?.result?.data) {
        allData = allData.concat(pageData.result.data);
      }
    }

    const columns = [
      '股票代码', '股票简称', '申购代码', '交易所', '板块',
      '发行总数', '网上发行', '顶格申购需配市值', '申购上限',
      '发行价格', '最新价', '首日收盘价', '申购日期',
      '中签号公布日', '中签缴款日期', '上市日期', '发行市盈率',
      '行业市盈率', '中签率', '询价累计报价倍数', '配售对象报价家数',
      '连续一字板数量', '涨幅', '每中一签获利'
    ];

    const rows = allData.map((item: any) => [
      item.SECURITY_CODE,
      item.SECURITY_NAME,
      item.APPLY_CODE,
      item.TRADE_MARKET,
      item.MARKET_TYPE,
      item.ISSUE_NUM,
      item.ONLINE_ISSUE_NUM,
      item.TOP_APPLY_MARKETCAP,
      item.ONLINE_APPLY_UPPER,
      item.ISSUE_PRICE,
      item.LATELY_PRICE,
      item.CLOSE_PRICE,
      item.APPLY_DATE ? new Date(item.APPLY_DATE).toISOString().split('T')[0] : null,
      item.BALLOT_NUM_DATE ? new Date(item.BALLOT_NUM_DATE).toISOString().split('T')[0] : null,
      item.BALLOT_PAY_DATE ? new Date(item.BALLOT_PAY_DATE).toISOString().split('T')[0] : null,
      item.LISTING_DATE ? new Date(item.LISTING_DATE).toISOString().split('T')[0] : null,
      item.AFTER_ISSUE_PE,
      item.INDUSTRY_PE_NEW,
      item.ONLINE_ISSUE_LWR,
      item.INITIAL_MULTIPLE,
      item.OFFLINE_EP_OBJECT,
      item.CONTINUOUS_1WORD_NUM,
      item.TOTAL_CHANGE,
      item.PROFIT,
    ]);

    return createDataFrame(columns, rows);
  }
}

/**
 * AKShare TypeScript - 特色指数数据接口
 * 包括：生猪指数、义乌小商品指数、Drewry集装箱指数、柯桥纺织指数、排污权指数、公路物流指数
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 行情宝-生猪市场价格指数
 * https://hqb.nxin.com/pigindex/index.shtml
 */
export async function index_hog_spot_price(): Promise<DataFrame> {
  const url = 'https://hqb.nxin.com/pigindex/getPigIndexChart.shtml';
  const params = { regionId: '0' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '指数', '4个月均线', '6个月均线', '12个月均线',
    '预售均价', '成交均价', '成交均重',
  ];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[0];
    const d = new Date(timestamp + 8 * 3600 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[2]),
      parseFloat(item[3]),
      parseFloat(item[4]),
      parseFloat(item[5]),
      parseFloat(item[6]),
      parseFloat(item[7]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 义乌小商品指数
 * https://www.ywindex.com/Home/Product/index/
 *
 * @param symbol 选择: "周价格指数", "月价格指数", "月景气指数"
 */
export async function index_yw(
  symbol: '周价格指数' | '月价格指数' | '月景气指数' = '月景气指数'
): Promise<DataFrame> {
  if (symbol === '月景气指数') {
    const url = 'https://apiserver.chinagoods.com/yiwuindex/v1/active/industry/class/history/bi?gcCode=';
    const data = await httpGet<any>(url);

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const columns = ['期数', '景气指数', '规模指数', '效益指数', '市场信心指数'];
    const rows = data.data.map((item: any) => [
      item.indextimeno,
      parseFloat(item.totalindex),
      parseFloat(item.scopeindex),
      parseFloat(item.benifitindex),
      parseFloat(item.confidentindex),
    ]);

    return createDataFrame(columns, rows);
  }

  const symbolMap: Record<string, string> = {
    '周价格指数': 'piweek',
    '月价格指数': 'month',
  };

  const url = `https://apiserver.chinagoods.com/yiwuindex/v1/active/industry/class/history/${symbolMap[symbol]}?gcCode=`;
  const data = await httpGet<any>(url);

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['期数', '价格指数', '场内价格指数', '网上价格指数', '订单价格指数', '出口价格指数'];
  const rows = data.data.map((item: any) => [
    item.indextimeno,
    parseFloat(item.totalpriceindex),
    parseFloat(item.stockdealpriceindex),
    parseFloat(item.netdealpriceindex),
    parseFloat(item.orderdealpriceindex),
    parseFloat(item.outdealpriceindex),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * Drewry 集装箱指数
 * https://infogram.com/world-container-index-1h17493095xl4zj
 *
 * @param symbol 选择: "composite", "shanghai-rotterdam", "rotterdam-shanghai",
 *   "shanghai-los angeles", "los angeles-shanghai", "shanghai-genoa",
 *   "new york-rotterdam", "rotterdam-new york"
 */
export async function drewry_wci_index(
  symbol: string = 'composite'
): Promise<DataFrame> {
  const url = 'https://infogram.com/world-container-index-1h17493095xl4zj';
  const symbolMap: Record<string, number> = {
    composite: 0,
    'shanghai-rotterdam': 1,
    'rotterdam-shanghai': 2,
    'shanghai-los angeles': 3,
    'los angeles-shanghai': 4,
    'shanghai-genoa': 5,
    'new york-rotterdam': 6,
    'rotterdam-new york': 7,
  };

  const parseDate = (text: string): string => {
    const raw = String(text || '').trim();
    const parts = raw.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/);
    if (!parts) {
      return raw;
    }
    const monthMap: Record<string, string> = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    };
    const day = parts[1].padStart(2, '0');
    const month = monthMap[parts[2]] || '01';
    const year = `20${parts[3]}`;
    return `${year}-${month}-${day}`;
  };

  try {
    const text = await httpGetText(url);
    const match = text.match(/window\.infographicData\s*=\s*([\s\S]*?);<\/script>/i);
    if (!match) {
      return createDataFrame([], []);
    }

    let data: any;
    try {
      data = JSON.parse(match[1]);
    } catch {
      const fn = new Function(`return (${match[1]});`);
      data = fn();
    }

    const entities = data?.elements?.content?.content?.entities || {};
    const entityKey =
      entities['7a55585f-3fb3-44e6-9b54-beea1cd20b4d']
        ? '7a55585f-3fb3-44e6-9b54-beea1cd20b4d'
        : Object.keys(entities)[0];
    if (!entityKey) {
      return createDataFrame([], []);
    }

    const chartData = entities[entityKey]?.data?.[symbolMap[symbol]];
    if (!chartData) {
      return createDataFrame([], []);
    }

    const columns = ['date', 'wci'];
    const rows = chartData
      .slice(1)
      .map((item: any[]) => {
        const date = parseDate(String(item?.[0]?.value ?? ''));
        const value = Number(item?.[1]?.value);
        return [date, Number.isNaN(value) ? null : value];
      })
      .filter((item: any[]) => item[0]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 中国柯桥纺织指数
 * http://www.kqindex.cn/flzs/jiage
 *
 * @param symbol 选择: "价格指数", "景气指数", "外贸指数"
 */
export async function index_kq_fz(
  symbol: '价格指数' | '景气指数' | '外贸指数' = '价格指数'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '价格指数': '1_1',
    '景气指数': '1_2',
    '外贸指数': '2',
  };

  const url = 'http://www.kqindex.cn/flzs/table_data';
  const params = {
    category: '0',
    start: '',
    end: '',
    indexType: symbolMap[symbol],
    pageindex: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result) {
    return createDataFrame([], []);
  }

  // Get first page data (simplified - no pagination loop for TS version)
  let columns: string[];
  if (symbol === '价格指数') {
    columns = ['期次', '指数', '涨跌幅'];
  } else if (symbol === '景气指数') {
    columns = ['期次', '总景气指数', '涨跌幅', '流通景气指数', '生产景气指数'];
  } else {
    columns = ['期次', '价格指数', '价格指数-涨跌幅', '景气指数', '景气指数-涨跌幅'];
  }

  const rows = data.result.map((item: any) => {
    const values = Object.values(item);
    return values.map(v => {
      if (typeof v === 'string' && !isNaN(Number(v))) return parseFloat(v as string);
      return v;
    });
  });

  return createDataFrame(columns, rows);
}

/**
 * 柯桥时尚指数
 * http://ss.kqindex.cn:9559/rinder_web_kqsszs/index/index_page.do
 *
 * @param symbol 选择: "柯桥时尚指数", "时尚创意指数", "时尚设计人才数", "新花型推出数", 等
 */
export async function index_kq_fashion(
  symbol: string = '时尚创意指数'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '柯桥时尚指数': 'root',
    '时尚创意指数': '01',
    '时尚设计人才数': '0101',
    '新花型推出数': '0102',
    '创意产品成交数': '0103',
    '创意企业数量': '0104',
    '时尚活跃度指数': '02',
    '电商运行数': '0201',
    '时尚平台拓展数': '0201',
    '新产品销售额占比': '0201',
    '企业合作占比': '0201',
    '品牌传播费用': '0201',
    '时尚推广度指数': '03',
    '国际交流合作次数': '0301',
    '企业参展次数': '0302',
    '外商驻点数量变化': '0302',
    '时尚评价指数': '04',
  };

  const url = 'http://api.idx365.com/index/project/34/data';
  const params = { structCode: symbolMap[symbol] || symbol };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '指数', '涨跌值', '涨跌幅'];
  const sortedData = [...data.data].sort(
    (a: any, b: any) => new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime()
  );

  const rows = sortedData.map((item: any, idx: number) => {
    const val = parseFloat(item.indexValue);
    const prevVal = idx > 0 ? parseFloat(sortedData[idx - 1].indexValue) : NaN;
    return [
      item.publishTime,
      val,
      idx > 0 ? val - prevVal : NaN,
      idx > 0 ? (val - prevVal) / prevVal : NaN,
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 浙江省排污权交易指数
 * https://zs.zjpwq.net
 *
 * @param symbol 选择: "月度", "季度"
 */
export async function index_eri(
  symbol: '月度' | '季度' = '月度'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '月度': 'MONTH',
    '季度': 'QUARTER',
  };

  const baseUrl = 'https://zs.zjpwq.net/pwq-index-webapi';
  const params = {
    cycle: symbolMap[symbol],
    regionId: '1',
    structId: '1',
    pageSize: '5000',
    indexId: '1',
    orderBy: 'stage.publishTime',
  };

  const indexData = await httpGet<any>(`${baseUrl}/indexData`, { params });
  const statsData = await httpGet<any>(`${baseUrl}/dataStatistics`, { params });

  if (!indexData?.data || !statsData?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '交易指数', '成交量', '成交额'];

  const rows = indexData.data.map((item: any, idx: number) => [
    item.stage?.publishTime ?? '',
    parseFloat(item.indexValue),
    parseFloat(statsData.data[idx]?.totalQuantity ?? 'NaN'),
    parseFloat(statsData.data[idx]?.totalCost ?? 'NaN'),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 中国公路物流运价指数
 * http://index.0256.cn/expx.htm
 *
 * @param symbol 选择: "周指数", "月指数", "季度指数", "年度指数"
 */
export async function index_price_cflp(
  symbol: '周指数' | '月指数' | '季度指数' | '年度指数' = '周指数'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '周指数': '2',
    '月指数': '3',
    '季度指数': '4',
    '年度指数': '5',
  };

  const url = 'http://index.0256.cn/expcenter_trend.action';

  // This is a POST request with form data
  const formData = new URLSearchParams({
    marketId: '1',
    attribute1: '5',
    exponentTypeId: symbolMap[symbol],
    cateId: '2',
    attribute2: '华北',
    city: '',
    startLine: '',
    endLine: '',
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Origin': 'http://index.0256.cn',
        'Referer': 'http://index.0256.cn/expx.htm',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return createDataFrame([], []);
    }

    const data = await response.json();

    const columns = ['日期', '定基指数', '环比指数', '同比指数'];
    const rows = data.chart1.xLebal.map((date: string, idx: number) => [
      date,
      parseFloat(data.chart1.yLebal[idx]),
      parseFloat(data.chart2.yLebal[idx]),
      parseFloat(data.chart3.yLebal[idx]),
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 中国公路物流运量指数
 * http://index.0256.cn/expx.htm
 *
 * @param symbol 选择: "月指数", "季度指数", "年度指数"
 */
export async function index_volume_cflp(
  symbol: '月指数' | '季度指数' | '年度指数' = '月指数'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '月指数': '3',
    '季度指数': '4',
    '年度指数': '5',
  };

  const url = 'http://index.0256.cn/volume_query.action';

  const formData = new URLSearchParams({
    type: '1',
    marketId: '1',
    expTypeId: symbolMap[symbol],
    startDate1: '',
    endDate1: '',
    city: '',
    startDate3: '',
    endDate3: '',
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Origin': 'http://index.0256.cn',
        'Referer': 'http://index.0256.cn/expx.htm',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return createDataFrame([], []);
    }

    const data = await response.json();

    const columns = ['日期', '定基指数', '环比指数', '同比指数'];
    const rows = data.chart1.xLebal.map((date: string, idx: number) => [
      date,
      parseFloat(data.chart1.yLebal[idx]),
      parseFloat(data.chart2.yLebal[idx]),
      parseFloat(data.chart3.yLebal[idx]),
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 沐甜科技数据中心-配额内进口糖估算指数
 * https://www.msweet.com.cn/mtkj/sjzx13/index.html
 */
export async function index_inner_quote_sugar_msweet(): Promise<DataFrame> {
  const url = 'https://www.msweet.com.cn/datacenterapply/datacenter/json/JinKongTang.json';

  const data = await httpGet<any>(url);

  if (!data?.category || !data?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '利润空间', '泰国糖', '泰国MA5', '巴西MA5',
    '利润MA5', '巴西MA10', '巴西糖', '柳州现货价', '广州现货价',
    '泰国MA10', '利润MA30', '利润MA10',
  ];

  const rows = data.category.map((date: string, idx: number) => {
    const row: any[] = [date.replace('/', '-')];
    for (let i = 0; i < Math.min(12, data.data.length); i++) {
      row.push(parseFloat(data.data[i]?.[idx] ?? 'NaN'));
    }
    return row;
  });

  return createDataFrame(columns, rows);
}

/**
 * 沐甜科技数据中心-配额外进口糖估算指数
 * https://www.msweet.com.cn/mtkj/sjzx13/index.html
 */
export async function index_outer_quote_sugar_msweet(): Promise<DataFrame> {
  const url = 'https://www.msweet.com.cn/datacenterapply/datacenter/json/Jkpewlr.json';

  const data = await httpGet<any>(url);

  if (!data?.category || !data?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '巴西糖进口成本', '泰国糖进口利润空间',
    '巴西糖进口利润空间', '泰国糖进口成本', '日照现货价',
  ];

  const rows = data.category.map((date: string, idx: number) => {
    const row: any[] = [date.replace('/', '-')];
    for (let i = 0; i < Math.min(5, data.data.length); i++) {
      row.push(parseFloat(data.data[i]?.[idx] ?? 'NaN'));
    }
    return row;
  });

  return createDataFrame(columns, rows);
}

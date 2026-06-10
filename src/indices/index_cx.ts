/**
 * AKShare TypeScript - 财新数据指数接口
 * https://yun.ccxe.com.cn/indices/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 财新数据-指数报告-综合 PMI
 * https://yun.ccxe.com.cn/indices/pmi
 */
export async function index_pmi_com_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'com' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '综合PMI', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-制造业 PMI
 * https://yun.ccxe.com.cn/indices/pmi
 */
export async function index_pmi_man_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'man' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '制造业PMI', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-服务业 PMI
 * https://yun.ccxe.com.cn/indices/pmi
 */
export async function index_pmi_ser_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'ser' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '服务业PMI', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-数字经济指数
 * https://yun.ccxe.com.cn/indices/dei
 */
export async function index_dei_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'dei' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '数字经济指数', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-产业指数
 * https://yun.ccxe.com.cn/indices/dei
 */
export async function index_ii_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'ii' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '产业指数', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-溢出指数
 * https://yun.ccxe.com.cn/indices/dei
 */
export async function index_si_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'si' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '溢出指数', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-融合指数
 * https://yun.ccxe.com.cn/indices/dei
 */
export async function index_fi_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'fi' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '融合指数', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-基础指数
 * https://yun.ccxe.com.cn/indices/dei
 */
export async function index_bi_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'bi' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '基础指数', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-中国新经济指数
 * https://yun.ccxe.com.cn/indices/nei
 */
export async function index_nei_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'nei' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '中国新经济指数', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-劳动力投入指数
 * https://yun.ccxe.com.cn/indices/nei
 */
export async function index_li_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'li' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '劳动力投入指数', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-资本投入指数
 * https://yun.ccxe.com.cn/indices/nei
 */
export async function index_ci_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'ci' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '资本投入指数', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-科技投入指数
 * https://yun.ccxe.com.cn/indices/nei
 */
export async function index_ti_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'ti' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '科技投入指数', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-新经济行业入职平均工资水平
 * https://yun.ccxe.com.cn/indices/nei
 */
export async function index_neaw_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'neaw' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '新经济行业入职平均工资水平', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-新经济入职工资溢价水平
 * https://yun.ccxe.com.cn/indices/nei
 */
export async function index_awpr_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = { type: 'awpr' };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '新经济入职工资溢价水平', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-大宗商品指数
 * https://yun.ccxe.com.cn/indices/nei
 */
export async function index_cci_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = {
    type: 'cci',
    code: '1000050',
    month: '-1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '大宗商品指数', '变化值'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-高质量因子
 * https://yun.ccxe.com.cn/indices/qli
 */
export async function index_qli_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = {
    type: 'qli',
    code: '1000050',
    month: '-1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '高质量因子指数', '变化幅度'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-AI策略指数
 * https://yun.ccxe.com.cn/indices/ai
 */
export async function index_ai_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = {
    type: 'ai',
    code: '1000050',
    month: '-1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', 'AI策略指数', '变化幅度'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-基石经济指数
 * https://yun.ccxe.com.cn/indices/bei
 */
export async function index_bei_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = {
    type: 'ind',
    code: '930927',
    month: '-1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '基石经济指数', '变化幅度'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 财新数据-指数报告-新动能指数
 * https://yun.ccxe.com.cn/indices/neei
 */
export async function index_neei_cx(): Promise<DataFrame> {
  const url = 'https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo';
  const params = {
    type: 'ind',
    code: '930928',
    month: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '新动能指数', '变化幅度'];

  const rows = data.data.map((item: any[]) => {
    const timestamp = item[2];
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return [
      dateStr,
      parseFloat(item[1]),
      parseFloat(item[0]),
    ];
  });

  return createDataFrame(columns, rows);
}

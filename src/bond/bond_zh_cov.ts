/**
 * AKShare TypeScript - 可转债数据接口
 * 新浪财经-债券-沪深可转债-实时行情数据和历史行情数据
 * https://vip.stock.finance.sina.com.cn/mkt/#hskzz_z
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { get_cninfo_js } from '../data/datasets';

async function getCninfoEncKey(): Promise<string> {
  try {
    const jsCode = await get_cninfo_js();
    if (!jsCode) return '';
    const fn = new Function(
      `${jsCode}; return (typeof getResCode1 === 'function' ? getResCode1() : '');`
    );
    const result = fn();
    return String(result ?? '').trim();
  } catch {
    return '';
  }
}

/**
 * 获取可转债列表 - 东方财富
 */
export async function bond_cb_jsl(): Promise<DataFrame> {
  const url = 'https://www.jisilu.cn/data/cbnew/cb_list/';
  const params = {
    ___jsl: `LST___t=${Date.now()}`,
  };

  try {
    const data = await httpPost<any>(url, {
      fprice: '',
      tprice: '',
      curr_iss_amt: '',
      volume: '',
      svolume: '',
      premium_rt: '',
      ytm_rt: '',
      market: '',
      rating_cd: '',
      is_search: 'N',
      'market_cd[]': 'szcy',
      btype: '',
      listed: 'Y',
      qflag: 'N',
      sw_cd: '',
      bond_ids: '',
      rp: '50',
    }, {
      params,
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json;charset=UTF-8',
        Origin: 'https://www.jisilu.cn',
        Pragma: 'no-cache',
        Referer: 'https://www.jisilu.cn/data/cbnew/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!data?.rows) {
      const { runPythonDataFrameFunction } = await import('../utils/pythonBridge');
      const fallback = await runPythonDataFrameFunction('bond_cb_jsl');
      return fallback.ok && fallback.columns && fallback.data ? createDataFrame(fallback.columns, fallback.data) : createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券名称', '正股代码', '正股名称', '正股价',
      '转股价', '转股价值', '转股溢价率', '纯债价值', '评级',
      '回售触发价', '强赎触发价', '到期时间', '剩余年限', '发行规模'
    ];

    const rows = data.rows.map((item: any) => [
      item.cell.bond_id,
      item.cell.bond_nm,
      item.cell.stock_id,
      item.cell.stock_nm,
      item.cell.price,
      item.cell.convert_price,
      item.cell.convert_value,
      item.cell.convert_price_t,
      item.cell.purevalue_rt,
      item.cell.rating_cd,
      item.cell.put_convert_price,
      item.cell.force_redeem_price,
      item.cell.maturity_dt,
      item.cell.year_left,
      item.cell.orig_iss_amt,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取可转债实时行情 - 东方财富
 */
export async function bond_cov_stock_issue_cninfo(): Promise<DataFrame> {
  const url = 'http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1124';
  try {
    const encKey = await getCninfoEncKey();
    const headers: Record<string, string> = {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Content-Length': '0',
      Host: 'webapi.cninfo.com.cn',
      Origin: 'http://webapi.cninfo.com.cn',
      Pragma: 'no-cache',
      'Proxy-Connection': 'keep-alive',
      Referer: 'http://webapi.cninfo.com.cn/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (encKey) {
      headers['Accept-Enckey'] = encKey;
    }

    const data = await httpPost<any>(url, null, { headers });

    if (!Array.isArray(data?.records) || data.records.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券简称', '公告日期', '转股代码', '转股简称',
      '转股价格', '自愿转换期起始日', '自愿转换期终止日', '标的股票', '债券名称'
    ];

    const rows = data.records.map((item: any) => [
      item.SECCODE ?? '',
      item.SECNAME ?? '',
      String(item.DECLAREDATE ?? '').split(' ')[0],
      item.F001V ?? '',
      item.F002V ?? '',
      item.F003N ?? '',
      String(item.F004D ?? '').split(' ')[0],
      String(item.F005D ?? '').split(' ')[0],
      item.F017V ?? '',
      item.BONDNAME ?? '',
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取可转债比价表 - 东方财富
 * https://quote.eastmoney.com/center/fullscreenlist.html#convertible_comparison
 */
export async function bond_cov_comparison(): Promise<DataFrame> {
  const url = 'https://16.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '1000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f243',
    fs: 'b:MK0354',
    fields: 'f1,f152,f2,f3,f12,f13,f14,f227,f228,f229,f230,f231,f232,f233,f234,f235,f236,f237,f238,f239,f240,f241,f242,f26,f243',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.data?.diff) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '转债代码', '转债名称', '转债最新价', '转债涨跌幅',
      '正股代码', '正股名称', '正股最新价', '正股涨跌幅',
      '转股价', '转股价值', '转股溢价率', '纯债溢价率',
      '回售触发价', '强赎触发价', '到期赎回价', '纯债价值',
      '开始转股日', '上市日期', '申购日期'
    ];

    const rows = data.data.diff.map((item: any) => [
      item.f1,
      item.f12,
      item.f14,
      item.f2,
      item.f3,
      item.f234,
      item.f232,
      item.f229,
      item.f230,
      item.f235,
      item.f236,
      item.f237,
      item.f238,
      item.f239,
      item.f240,
      item.f241,
      item.f229,
      item.f233,
      item.f227,
      item.f26,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取可转债数据 - 东方财富
 * https://data.eastmoney.com/kzz/default.html
 */
export async function bond_zh_cov(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'PUBLIC_START_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_BOND_CB_LIST',
    columns: 'ALL',
    quoteColumns: 'f2~01~CONVERT_STOCK_CODE~CONVERT_STOCK_PRICE,f235~10~SECURITY_CODE~TRANSFER_PRICE,f236~10~SECURITY_CODE~TRANSFER_VALUE,f2~10~SECURITY_CODE~CURRENT_BOND_PRICE,f237~10~SECURITY_CODE~TRANSFER_PREMIUM_RATIO,f239~10~SECURITY_CODE~RESALE_TRIG_PRICE,f240~10~SECURITY_CODE~REDEEM_TRIG_PRICE,f23~01~CONVERT_STOCK_CODE~PBV_RATIO',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.result?.data) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券简称', '申购日期', '申购代码', '申购上限',
      '正股代码', '正股简称', '正股价', '转股价', '转股价值',
      '债现价', '转股溢价率', '原股东配售-股权登记日', '原股东配售-每股配售额',
      '发行规模', '中签号发布日', '中签率', '上市时间', '信用评级'
    ];

    const rows = data.result.data.map((item: any) => [
      item.SECURITY_CODE,
      item.SECURITY_NAME_ABBR,
      item.PUBLIC_START_DATE,
      item.APPLY_CODE,
      item.APPLY_LIMIT,
      item.CONVERT_STOCK_CODE,
      item.CONVERT_STOCK_NAME_ABBR,
      item.CONVERT_STOCK_PRICE,
      item.TRANSFER_PRICE,
      item.TRANSFER_VALUE,
      item.CURRENT_BOND_PRICE,
      item.TRANSFER_PREMIUM_RATIO,
      item.ORIGINAL_STOCK_RECORD_DATE,
      item.ORIGINAL_STOCK_PER_ALLOTMENT,
      item.ISSUE_SCALE,
      item.BALLOT_NUMBER_DATE,
      item.SUCCESS_RATE,
      item.LISTING_DATE,
      item.CREDIT_RATING,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

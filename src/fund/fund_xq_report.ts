/**
 * AKShare TypeScript - fund missing individual XQ / report cninfo / legu position
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import { load } from 'cheerio';
import { createDataFrame, DataFrame } from '../utils/dataframe';
import { get_cninfo_js } from '../data/datasets';
import * as vm from 'vm';

function toNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v).replace(/%/g, '').trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const DJ_HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

// ─── Xueqiu individual fund ──────────────────────────────────

export async function fund_individual_basic_info_xq(symbol: string = '000001'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>(`https://danjuanfunds.com/djapi/fund/${symbol}`, { headers: DJ_HEADERS });
    const d = data?.data ?? {};
    const keys: [string, string][] = [
      ['fd_code', '基金代码'],
      ['fd_name', '基金名称'],
      ['fd_full_name', '基金全称'],
      ['found_date', '成立时间'],
      ['totshare', '最新规模'],
      ['keeper_name', '基金公司'],
      ['manager_name', '基金经理'],
      ['trup_name', '托管银行'],
      ['type_desc', '基金类型'],
      ['rating_source', '评级机构'],
      ['rating_desc', '基金评级'],
      ['invest_orientation', '投资策略'],
      ['invest_target', '投资目标'],
      ['performance_bench_mark', '业绩比较基准'],
    ];
    const rows = keys.map(([k, label]) => [label, d[k] ?? '']);
    return createDataFrame(['item', 'value'], rows);
  } catch { return createDataFrame([], []); }
}

export async function fund_individual_achievement_xq(symbol: string = '000001'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>(`https://danjuanfunds.com/djapi/fundx/base/fund/achievement/${symbol}`, { headers: DJ_HEADERS });
    const d = data?.data ?? {};
    const allRows: any[][] = [];
    const types: Record<string, string> = { annual_performance_list: '\u5e74\u5ea6\u4e1a\u7ee9', stage_performance_list: '\u9636\u6bb5\u4e1a\u7ee9' };
    for (const [k, typeName] of Object.entries(types)) {
      for (const item of (d[k] ?? [])) {
        allRows.push([
          typeName, item.period_time ?? '',
          toNum(String(item.self_nav ?? '').replace('%', '')),
          toNum(String(item.self_max_draw_down ?? '').replace('%', '')),
          item.self_nav_rank ?? '',
        ]);
      }
    }
    return createDataFrame(['业绩类型', '周期', '本产品区间收益', '本产品最大回撒', '周期收益同类排名'], allRows);
  } catch { return createDataFrame([], []); }
}

export async function fund_individual_analysis_xq(symbol: string = '000001'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>(`https://danjuanfunds.com/djapi/fund/base/quote/data/index/analysis/${symbol}`, { headers: DJ_HEADERS });
    const list = data?.data?.index_data_list ?? [];
    const columns = ['\u5468\u671f', '\u8f83\u540c\u7c7b\u98ce\u9669\u6536\u76ca\u6bd4', '\u8f83\u540c\u7c7b\u6297\u98ce\u9669\u6ce2\u52a8', '\u5e74\u5316\u6ce2\u52a8\u7387', '\u5e74\u5316\u590f\u666e\u6bd4\u7387', '\u6700\u5927\u56de\u64a4'];
    const rows = list.map((item: any) => [
      item.index_time_period ?? '',
      toNum(item.investment_cost_performance), toNum(item.risk_control),
      toNum((item.self_index?.volatility_rank ?? 0) * 100),
      toNum(item.self_index?.sharpe_rank),
      toNum((item.self_index?.max_draw_down ?? 0) * 100),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function fund_individual_profit_probability_xq(symbol: string = '000001'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>(`https://danjuanfunds.com/djapi/fundx/base/fund/profit/ratio/${symbol}`, { headers: DJ_HEADERS });
    const list = data?.data?.data_list ?? [];
    const columns = ['\u6301\u6709\u65f6\u957f', '\u76c8\u5229\u6982\u7387', '\u5e73\u5747\u6536\u76ca'];
    const rows = list.map((item: any) => [
      item.holding_time ?? '',
      toNum(String(item.profit_ratio ?? '').replace('%', '')),
      toNum(String(item.average_income ?? '').replace('%', '')),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function fund_individual_detail_info_xq(symbol: string = '000001'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>(`https://danjuanfunds.com/djapi/fund/detail/${symbol}`, { headers: DJ_HEADERS });
    const rates = data?.data?.fund_rates ?? {};
    const allRows: any[][] = [];
    const types: Record<string, string> = {
      declare_rate_table: '\u4e70\u5165\u89c4\u5219',
      withdraw_rate_table: '\u5356\u51fa\u89c4\u5219',
      other_rate_table: '\u5176\u4ed6\u8d39\u7528',
    };
    for (const [k, typeName] of Object.entries(types)) {
      for (const item of (rates[k] ?? [])) {
        allRows.push([typeName, item.name ?? '', toNum(item.value)]);
      }
    }
    return createDataFrame(['\u8d39\u7528\u7c7b\u578b', '\u6761\u4ef6\u6216\u540d\u79f0', '\u8d39\u7528'], allRows);
  } catch { return createDataFrame([], []); }
}

export async function fund_individual_detail_hold_xq(symbol: string = '002804', date: string = '20231231'): Promise<DataFrame> {
  try {
    const dateStr = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    const data = await httpGet<any>('https://danjuanfunds.com/djapi/fundx/base/fund/record/asset/percent', {
      params: { fund_code: symbol, report_date: dateStr },
      headers: DJ_HEADERS,
    });
    const list = data?.data?.chart_list ?? [];
    const columns = ['资产类型', '仓位占比'];
    const rows = list.map((item: any) => [item.type_desc ?? '', toNum(item.percent)]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Fund report cninfo ───────────────────────────────────────

async function getCninfoEncKey(): Promise<string> {
  try {
    const jsCode = await get_cninfo_js();
    const ctx: any = {};
    vm.createContext(ctx);
    vm.runInContext(jsCode, ctx);
    return ctx.getResCode1?.() ?? '';
  } catch { return ''; }
}

const CNINFO_BASE_HEADERS = {
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  Host: 'webapi.cninfo.com.cn',
  Origin: 'https://webapi.cninfo.com.cn',
  Referer: 'https://webapi.cninfo.com.cn/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'X-Requested-With': 'XMLHttpRequest',
};

async function _cninfo_post(apiPath: string, params?: Record<string, string>): Promise<any[]> {
  try {
    const encKey = await getCninfoEncKey();
    const headers = { ...CNINFO_BASE_HEADERS, 'Content-Length': '0', 'Accept-Enckey': encKey };
    const { default: axios } = await import('axios');
    const resp = await axios.post(`https://webapi.cninfo.com.cn${apiPath}`, null, { params, headers, timeout: 30000 });
    return resp.data?.records ?? [];
  } catch { return []; }
}

export async function fund_report_stock_cninfo(date: string = '20210630'): Promise<DataFrame> {
  const rdate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  const records = await _cninfo_post('/api/sysapi/p_sysapi1112', { rdate });
  const columns = ['序号', '股票代码', '股票简称', '报告期', '基金覆盖家数', '持股总数', '持股总市值'];
  const rows = records.map((item: any, idx: number) => [
    idx + 1, item.SECCODE ?? '', item.SECNAME ?? '',
    item.ENDDATE ? item.ENDDATE.slice(0, 10) : '',
    toNum(item.F001N), toNum(item.F002N), toNum(item.F003N),
  ]);
  return createDataFrame(columns, rows);
}

export async function fund_report_industry_allocation_cninfo(date: string = '20210630'): Promise<DataFrame> {
  const rdate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  const records = await _cninfo_post('/api/sysapi/p_sysapi1113', { rdate });
  const columns = ['\u884c\u4e1a\u7f16\u7801', '\u8bc1\u76d1\u4f1a\u884c\u4e1a\u540d\u79f0', '\u62a5\u544a\u671f', '\u57fa\u91d1\u8986\u76d6\u5bb6\u6570', '\u884c\u4e1a\u89c4\u6a21', '\u5360\u51c0\u8d44\u4ea7\u6bd4\u4f8b'];
  const rows = records.map((item: any) => [
    item.F001V ?? '', item.F002V ?? '',
    item.ENDDATE ? item.ENDDATE.slice(0, 10) : '',
    toNum(item.F003N), toNum(item.F004N), toNum(item.F005N),
  ]);
  return createDataFrame(columns, rows);
}

export async function fund_report_asset_allocation_cninfo(): Promise<DataFrame> {
  const records = await _cninfo_post('/api/sysapi/p_sysapi1114');
  const columns = ['\u62a5\u544a\u671f', '\u57fa\u91d1\u8986\u76d6\u5bb6\u6570', '\u80a1\u7968\u6743\u76ca\u7c7b\u5360\u51c0\u8d44\u4ea7\u6bd4\u4f8b', '\u503a\u5238\u56fa\u5b9a\u6536\u76ca\u7c7b\u5360\u51c0\u8d44\u4ea7\u6bd4\u4f8b', '\u73b0\u91d1\u8d27\u5e01\u7c7b\u5360\u51c0\u8d44\u4ea7\u6bd4\u4f8b', '\u57fa\u91d1\u5e02\u573a\u51c0\u8d44\u4ea7\u89c4\u6a21'];
  const rows = records.map((item: any) => [
    item.ENDDATE ? item.ENDDATE.slice(0, 10) : '',
    toNum(item.F001N), toNum(item.F006N), toNum(item.F007N), toNum(item.F008N), toNum(item.F005N),
  ]);
  return createDataFrame(columns, rows);
}

// ─── Legu fund position ───────────────────────────────────────

async function _legu_fund_position(posType: string): Promise<DataFrame> {
  try {
    const { createHash } = await import('crypto');
    const { default: axios } = await import('axios');
    const pageUrl = `https://legulegu.com/stockdata/fund-position/${posType}`;
    // \u751f\u6210 token\uff08MD5 of current date\uff09
    const date = new Date().toISOString().slice(0, 10);
    const token = createHash('md5').update(date).digest('hex');
    // \u83b7\u53d6 cookies \u548c CSRF token\uff08\u4ece\u4e3b\u9875\u83b7\u53d6\uff0c\u56e0\u4e3a\u5b50\u9875\u9762\u53ef\u80fd 404\uff09
    const pageResp = await axios.get('https://legulegu.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000,
    });
    const cookies = (pageResp.headers['set-cookie'] ?? []).map((c: string) => c.split(';')[0]).join('; ');
    const csrfMatch = pageResp.data.match(/name="_csrf"[^>]*content="([^"]+)"/);
    const csrf = csrfMatch ? csrfMatch[1] : '';
    // \u8c03\u7528 API\uff08\u76f4\u63a5\u7528 axios \u800c\u975e httpGet\uff0c\u907f\u514d JSON \u89e3\u6790\u95ee\u9898\uff09
    const apiResp = await axios.get('https://legulegu.com/api/stockdata/fund-position', {
      params: { token, type: posType, category: '\u603b\u4ed3\u4f4d', marketId: '5' },
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: pageUrl,
        ...(cookies ? { Cookie: cookies } : {}),
        ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
      },
      timeout: 15000,
    });
    const list = Array.isArray(apiResp.data) ? apiResp.data : [];
    const columns = ['date', 'close', 'position'];
    const rows = list.map((item: any) => [
      item.date ? String(item.date).slice(0, 10) : '',
      toNum(item.close), toNum(item.position),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function fund_stock_position_lg(): Promise<DataFrame> { return _legu_fund_position('pos_stock'); }
export async function fund_balance_position_lg(): Promise<DataFrame> { return _legu_fund_position('pos_pingheng'); }
export async function fund_linghuo_position_lg(): Promise<DataFrame> { return _legu_fund_position('pos_linghuo'); }

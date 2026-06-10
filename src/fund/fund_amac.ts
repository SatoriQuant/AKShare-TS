/**
 * AKShare TypeScript - AMAC fund industry association interfaces
 */

import axios from 'axios';
import { httpPost, getLegacyHttpsAgent, getNoVerifyAgent } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

const AMAC_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Content-Type': 'application/json',
};

function toNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function msToDate(v: any): string {
  if (!v) return '';
  const d = new Date(Number(v));
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
}

async function _amac_paginated(url: string, body: Record<string, any>, keys: string[], cols: string[], pageSize = 20): Promise<DataFrame> {
  try {
    const httpsAgent = getNoVerifyAgent();
    const allRows: any[][] = [];
    let totalPages = 0;
    // 第一次请求获取 totalPages
    for (let retry = 0; retry < 5; retry++) {
      const resp = await axios.post(url, { ...body, page: '1' }, {
        params: { rand: '0.7665138514630696', page: '1', size: String(pageSize) },
        headers: AMAC_HEADERS,
        httpsAgent,
        timeout: 30000,
      });
      const data = resp.data;
      totalPages = Number(data?.totalPages ?? 0);
      if (totalPages > 0) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    // 逐页获取数据（body 中 page 始终为 '1'，通过 params 分页）
    for (let page = 0; page < totalPages; page++) {
      let success = false;
      for (let retry = 0; retry < 3; retry++) {
        try {
          const resp = await axios.post(url, { ...body, page: '1' }, {
            params: { rand: '0.7665138514630696', page: String(page), size: String(pageSize) },
            headers: AMAC_HEADERS,
            httpsAgent,
            timeout: 30000,
          });
          const data = resp.data;
          const content = Array.isArray(data?.content) ? data.content : [];
          if (content.length > 0) {
            for (const item of content) {
              allRows.push(keys.map((k) => item[k] ?? ''));
            }
            success = true;
            break;
          }
        } catch { /* retry */ }
        await new Promise(r => setTimeout(r, 1000));
      }
      if (!success) break;
    }
    return createDataFrame(cols, allRows);
  } catch { return createDataFrame([], []); }
}

export async function amac_member_info(): Promise<DataFrame> {
  return _amac_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/pofMember',
    {},
    ['managerName', 'memberBehalf', 'memberType', 'memberCode', 'memberDate', 'primaryInvestType', 'markStar'],
    ['\u673a\u6784\uff08\u4f1a\u5458\uff09\u540d\u79f0', '\u4f1a\u5458\u4ee3\u8868', '\u4f1a\u5458\u7c7b\u578b', '\u4f1a\u5458\u7f16\u53f7', '\u5165\u4f1a\u65f6\u95f4', '\u673a\u6784\u7c7b\u578b', '\u662f\u5426\u661f\u6807']
  ).then(df => {
    // Convert ms timestamps
    const idx = df.columns.indexOf('\u5165\u4f1a\u65f6\u95f4');
    if (idx >= 0) { df.data = df.data.map((r) => { const nr = [...r]; nr[idx] = msToDate(nr[idx]); return nr; }); }
    return df;
  });
}

export async function amac_person_fund_org_list(symbol: string = '\u516c\u52df\u57fa\u91d1\u7ba1\u7406\u516c\u53f8'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '\u516c\u52df\u57fa\u91d1\u7ba1\u7406\u516c\u53f8': 'gmjjglgs',
    '\u516c\u52df\u57fa\u91d1\u7ba1\u7406\u516c\u53f8\u8d44\u7ba1\u5b50\u516c\u53f8': 'gmjjglgszgzgs',
    '\u5546\u4e1a\u9280\u884c': 'syyh',
    '\u8bc1\u5238\u516c\u53f8': 'zqgs',
    '\u79c1\u52df\u57fa\u91d1\u7ba1\u7406\u4eba': 'smjjglr',
    '\u671f\u8d27\u516c\u53f8': 'qhgs',
  };
  const orgType = symbolMap[symbol] ?? 'gmjjglgs';
  const df = await _amac_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/personOrg',
    { orgType },
    ['orgName', 'orgType', 'workerTotalNum', 'operNum', 'salesmanNum', 'investmentManagerNum', 'fundManagerNum'],
    ['\u673a\u6784\u540d\u79f0', '\u673a\u6784\u7c7b\u578b', '\u5458\u5de5\u4eba\u6570', '\u57fa\u91d1\u4ece\u4e1a\u8d44\u683c', '\u57fa\u91d1\u9500\u552e\u4e1a\u52a1\u8d44\u683c', '\u57fa\u91d1\u7ecf\u7406', '\u6295\u8d44\u7ecf\u7406']
  );
  // \u6dfb\u52a0\u5e8f\u53f7\u5217
  const indexCol = df.data.map((_, i) => i + 1);
  return createDataFrame(['\u5e8f\u53f7', ...df.columns], df.data.map((row, i) => [indexCol[i], ...row]));
}

export async function amac_person_bond_org_list(): Promise<DataFrame> {
  try {
    const resp = await axios.get('https://human.amac.org.cn/web/api/publicityAddress?rand=0.6288001872566391&pageNum=1&pageSize=5000', {
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      httpsAgent: getLegacyHttpsAgent(),
    });
    const list = resp.data?.list ?? [];
    const columns = ['\u5e8f\u53f7', '\u673a\u6784\u7c7b\u578b', '\u673a\u6784\u540d\u79f0', '\u516c\u793a\u7f51\u5740'];
    const rows = list.map((item: any, idx: number) => [idx + 1, item.orgClass ?? '', item.orgName ?? '', item.publicityAddress ?? '']);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function amac_manager_info(): Promise<DataFrame> {
  return _amac_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/manager',
    {},
    ['managerName', 'artificialPersonName', 'primaryInvestType', 'registerProvince', 'registerNo', 'establishDate', 'registerDate'],
    ['\u79c1\u52df\u57fa\u91d1\u7ba1\u7406\u4eba\u540d\u79f0', '\u6cd5\u5b9a\u4ee3\u8868\u4eba\u59d3\u540d', '\u673a\u6784\u7c7b\u578b', '\u6ce8\u518c\u5730', '\u767b\u8bb0\u7f16\u53f7', '\u6210\u7acb\u65f6\u95f4', '\u767b\u8bb0\u65f6\u95f4'],
    100
  ).then(df => {
    const idx1 = df.columns.indexOf('\u6210\u7acb\u65f6\u95f4');
    const idx2 = df.columns.indexOf('\u767b\u8bb0\u65f6\u95f4');
    df.data = df.data.map((r) => {
      const nr = [...r];
      if (idx1 >= 0) nr[idx1] = msToDate(nr[idx1]);
      if (idx2 >= 0) nr[idx2] = msToDate(nr[idx2]);
      return nr;
    });
    return df;
  });
}

export async function amac_manager_classify_info(): Promise<DataFrame> {
  return _amac_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/managertype',
    {},
    ['managerName', 'primaryInvestType', 'registerProvince', 'registerNo', 'fundNum', 'establishDate', 'registerDate'],
    ['\u79c1\u52df\u57fa\u91d1\u7ba1\u7406\u4eba\u540d\u79f0', '\u673a\u6784\u7c7b\u578b', '\u6ce8\u518c\u5730', '\u767b\u8bb0\u7f16\u53f7', '\u5df2\u767b\u8bb0\u57fa\u91d1\u6570\u91cf', '\u6210\u7acb\u65f6\u95f4', '\u767b\u8bb0\u65f6\u95f4'],
    100
  );
}

export async function amac_member_sub_info(): Promise<DataFrame> {
  return _amac_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/pofMemberSub',
    {},
    ['managerName', 'memberType', 'memberCode', 'registerNo', 'memberDate'],
    ['\u673a\u6784\u540d\u79f0', '\u4f1a\u5458\u7c7b\u578b', '\u4f1a\u5458\u7f16\u53f7', '\u767b\u8bb0\u7f16\u53f7', '\u5165\u4f1a\u65f6\u95f4']
  );
}

async function _amac_fund_paginated(url: string, keys: string[], cols: string[]): Promise<DataFrame> {
  const allRows: any[][] = [];
  try {
    const httpsAgent = getNoVerifyAgent();
    let totalPages = 0;
    // 第一次请求获取 totalPages
    for (let retry = 0; retry < 5; retry++) {
      const resp = await axios.post(url, { page: '1' }, {
        params: { rand: '0.7665138514630696', page: '1', size: '100' },
        headers: AMAC_HEADERS,
        httpsAgent,
        timeout: 30000,
      });
      const data = resp.data;
      totalPages = Number(data?.totalPages ?? 0);
      if (totalPages > 0) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    // 逐页获取数据
    for (let page = 0; page < totalPages; page++) {
      let success = false;
      for (let retry = 0; retry < 3; retry++) {
        try {
          const resp = await axios.post(url, { page: String(page) }, {
            params: { rand: '0.7665138514630696', page: String(page), size: '100' },
            headers: AMAC_HEADERS,
            httpsAgent,
            timeout: 30000,
          });
          const data = resp.data;
          const content = Array.isArray(data?.content) ? data.content : [];
          if (content.length > 0) {
            for (const item of content) { allRows.push(keys.map((k) => item[k] ?? '')); }
            success = true;
            break;
          }
        } catch { /* retry */ }
        await new Promise(r => setTimeout(r, 1000));
      }
      if (!success) break;
    }
  } catch { /* return partial */ }
  return createDataFrame(cols, allRows);
}

export async function amac_fund_info(): Promise<DataFrame> {
  return _amac_fund_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/fund',
    ['fundName', 'manager', 'trustee', 'registerNo', 'setupDate', 'fundStatus'],
    ['\u57fa\u91d1\u540d\u79f0', '\u57fa\u91d1\u7ba1\u7406\u4eba', '\u57fa\u91d1\u6258\u7ba1\u4eba', '\u767b\u8bb0\u7f16\u53f7', '\u6210\u7acb\u65e5\u671f', '\u57fa\u91d1\u72b6\u6001']
  );
}

export async function amac_securities_info(): Promise<DataFrame> {
  return _amac_fund_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/asset',
    ['fundName', 'manager', 'trustee', 'registerNo', 'setupDate', 'fundStatus'],
    ['\u4ea7\u54c1\u540d\u79f0', '\u7ba1\u7406\u516c\u53f8', '\u6258\u7ba1\u4eba', '\u767b\u8bb0\u7f16\u53f7', '\u6210\u7acb\u65e5\u671f', '\u72b6\u6001']
  );
}

export async function amac_aoin_info(): Promise<DataFrame> {
  return _amac_fund_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/directfund',
    ['fundName', 'manager', 'registerNo', 'setupDate'],
    ['\u57fa\u91d1\u540d\u79f0', '\u7ba1\u7406\u516c\u53f8', '\u767b\u8bb0\u7f16\u53f7', '\u6210\u7acb\u65e5\u671f']
  );
}

export async function amac_fund_sub_info(): Promise<DataFrame> {
  return _amac_fund_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/pfund',
    ['fundName', 'manager', 'trustee', 'registerNo', 'setupDate', 'fundStatus'],
    ['\u57fa\u91d1\u540d\u79f0', '\u57fa\u91d1\u7ba1\u7406\u4eba', '\u57fa\u91d1\u6258\u7ba1\u4eba', '\u767b\u8bb0\u7f16\u53f7', '\u6210\u7acb\u65e5\u671f', '\u72b6\u6001']
  );
}

export async function amac_fund_account_info(): Promise<DataFrame> {
  return _amac_fund_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/subfund',
    ['fundName', 'manager', 'trustee', 'registerNo', 'setupDate', 'fundStatus'],
    ['\u57fa\u91d1\u540d\u79f0', '\u57fa\u91d1\u7ba1\u7406\u4eba', '\u57fa\u91d1\u6258\u7ba1\u4eba', '\u767b\u8bb0\u7f16\u53f7', '\u6210\u7acb\u65e5\u671f', '\u72b6\u6001']
  );
}

export async function amac_fund_abs(): Promise<DataFrame> {
  return _amac_fund_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/abs',
    ['fundName', 'manager', 'trustee', 'registerNo', 'setupDate', 'fundStatus'],
    ['\u4ea7\u54c1\u540d\u79f0', '\u7ba1\u7406\u4eba', '\u6258\u7ba1\u4eba', '\u767b\u8bb0\u7f16\u53f7', '\u6210\u7acb\u65e5\u671f', '\u72b6\u6001']
  );
}

export async function amac_futures_info(): Promise<DataFrame> {
  return _amac_fund_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/qhfund',
    ['fundName', 'manager', 'trustee', 'registerNo', 'setupDate', 'fundStatus'],
    ['\u57fa\u91d1\u540d\u79f0', '\u57fa\u91d1\u7ba1\u7406\u4eba', '\u57fa\u91d1\u6258\u7ba1\u4eba', '\u767b\u8bb0\u7f16\u53f7', '\u6210\u7acb\u65e5\u671f', '\u72b6\u6001']
  );
}

export async function amac_manager_cancelled_info(): Promise<DataFrame> {
  return _amac_fund_paginated(
    'https://gs.amac.org.cn/amac-infodisc/api/pof/cancelmanager',
    ['managerName', 'artificialPersonName', 'registerProvince', 'registerNo', 'cancelDate', 'cancelType'],
    ['\u79c1\u52df\u57fa\u91d1\u7ba1\u7406\u4eba\u540d\u79f0', '\u6cd5\u5b9a\u4ee3\u8868\u4eba', '\u6ce8\u518c\u5730', '\u767b\u8bb0\u7f16\u53f7', '\u6ce8\u9500\u65f6\u95f4', '\u6ce8\u9500\u539f\u56e0']
  );
}

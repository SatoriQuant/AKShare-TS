/**
 * AKShare TypeScript - 中国外汇交易中心债券信息接口
 * 中国外汇交易中心暨全国银行间同业拆借中心
 * https://www.chinamoney.com.cn/chinese/scsjzqxx/
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 查询债券类型参数
 */
export async function bond_info_cm_query(
  symbol: '主承销商' | '债券类型' | '息票类型' | '发行年份' | '评级等级' = '评级等级'
): Promise<DataFrame> {
  if (symbol === '主承销商') {
    const url = 'https://www.chinamoney.com.cn/ags/ms/cm-u-bond-md/EntyFullNameSearchCondition';

    try {
      const data = await httpPost<any>(url, {}, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        },
      });

      if (!data?.data?.enty) {
        return createDataFrame([], []);
      }

      const columns = ['name', 'code'];
      const rows = data.data.enty.map((item: any) => [item.name, item.code]);

      return createDataFrame(columns, rows);
    } catch (error) {
      return createDataFrame([], []);
    }
  } else {
    const symbolMap: Record<string, string> = {
      '债券类型': 'bondType',
      '息票类型': 'couponType',
      '发行年份': 'issueYear',
      '评级等级': 'bondRtngShrt',
    };

    const url = 'https://www.chinamoney.com.cn/ags/ms/cm-u-bond-md/BondBaseInfoSearchCondition';

    try {
      const data = await httpPost<any>(url, {}, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        },
      });

      const key = symbolMap[symbol];
      if (!data?.data?.[key]) {
        return createDataFrame([], []);
      }

      const items = data.data[key];
      const columns = ['name', 'code'];
      const rows = Array.isArray(items)
        ? items.map((item: any) => [item.name || item, item.code || item])
        : [];

      return createDataFrame(columns, rows);
    } catch (error) {
      return createDataFrame([], []);
    }
  }
}

/**
 * 获取债券信息查询结果
 * https://www.chinamoney.com.cn/chinese/scsjzqxx/
 *
 * @param bondName 债券名称
 * @param bondCode 债券代码
 * @param bondIssue 发行人/受托机构
 * @param bondType 债券类型
 * @param couponType 息票类型
 * @param issueYear 发行年份
 * @param underwriter 主承销商
 * @param grade 评级等级
 */
export async function bond_info_cm(
  bondName: string = '',
  bondCode: string = '',
  bondIssue: string = '',
  bondType: string = '',
  couponType: string = '',
  issueYear: string = '',
  underwriter: string = '',
  grade: string = ''
): Promise<DataFrame> {
  const url = 'https://www.chinamoney.com.cn/ags/ms/cm-u-bond-md/BondMarketInfoList2';

  const buildPayload = (pageNo: string): URLSearchParams =>
    new URLSearchParams({
      pageNo,
      pageSize: '15',
      bondName,
      bondCode,
      issueEnty: bondIssue,
      bondType,
      bondSpclPrjctVrty: '',
      couponType,
      issueYear,
      entyDefinedCode: underwriter,
      rtngShrt: grade,
    });

  try {
    const firstPayload = buildPayload('1');
    const firstData = await httpPost<any>(url, firstPayload.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!firstData?.data?.resultList) {
      return createDataFrame([], []);
    }

    const totalPages = Number(firstData.data.pageTotal ?? 1);
    const allRows: any[] = Array.isArray(firstData.data.resultList) ? [...firstData.data.resultList] : [];

    for (let page = 2; page <= totalPages; page++) {
      const pagePayload = buildPayload(String(page));
      const pageData = await httpPost<any>(url, pagePayload.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      if (Array.isArray(pageData?.data?.resultList)) {
        allRows.push(...pageData.data.resultList);
      }
    }

    if (allRows.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券简称', '债券代码', '发行人/受托机构', '债券类型',
      '发行日期', '最新债项评级', '查询代码'
    ];

    const rows = allRows.map((item: any) => [
      item.bondName,
      item.bondCode,
      item.entyFullName,
      item.bondType,
      item.issueStartDate,
      item.debtRtng,
      item.bondDefinedCode,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取债券详情
 * https://www.chinamoney.com.cn/chinese/zqjc/
 *
 * @param symbol 债券简称
 */
export async function bond_info_detail_cm(symbol: string = '淮安农商行CDSD2022021012'): Promise<DataFrame> {
  // 先获取查询代码
  const infoDf = await bond_info_cm(symbol);

  if (infoDf.data.length === 0) {
    return createDataFrame([], []);
  }

  // 获取查询代码列的索引
  const codeIndex = infoDf.columns.indexOf('查询代码');
  if (codeIndex === -1 || !infoDf.data[0]?.[codeIndex]) {
    return createDataFrame([], []);
  }

  const bondCode = infoDf.data[0][codeIndex];
  const url = 'https://www.chinamoney.com.cn/ags/ms/cm-u-bond-md/BondDetailInfo';

  try {
    const payload = new URLSearchParams({
      bondDefinedCode: String(bondCode),
    });

    const data = await httpPost<any>(url, payload.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'host': 'www.chinamoney.com.cn',
        'origin': 'https://www.chinamoney.com.cn',
        'referer': 'https://www.chinamoney.com.cn/chinese/zqjc/?bondDefinedCode=egfjh08154',
      },
    });

    if (!data?.data?.bondBaseInfo) {
      return createDataFrame([], []);
    }

    const bondInfo = data.data.bondBaseInfo;
    const columns = ['name', 'value'];
    const rows: string[][] = [];

    for (const [key, value] of Object.entries(bondInfo)) {
      // 与 Python 版对齐：仅当列表有内容时才剔除
      if ((key === 'creditRateEntyList' || key === 'exerciseInfoList') && Array.isArray(value) && value.length > 0) {
        continue;
      }
      rows.push([key, value === null || value === undefined ? '' : String(value)]);
    }

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

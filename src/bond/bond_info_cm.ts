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

      const columns = ['名称', '代码'];
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
      const columns = ['名称', '代码'];
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

  const payload = {
    pageNo: '1',
    pageSize: '100',
    bondName,
    bondCode,
    issueEnty: bondIssue,
    bondType,
    bondSpclPrjctVrty: '',
    couponType,
    issueYear,
    entyDefinedCode: underwriter,
    rtngShrt: grade,
  };

  try {
    const data = await httpPost<any>(url, payload, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      },
    });

    if (!data?.data?.resultList) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券简称', '债券代码', '发行人/受托机构', '债券类型',
      '发行日期', '最新债项评级', '查询代码'
    ];

    const rows = data.data.resultList.map((item: any) => [
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
    const data = await httpPost<any>(url, { bondDefinedCode: bondCode }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'host': 'www.chinamoney.com.cn',
        'origin': 'https://www.chinamoney.com.cn',
        'referer': 'https://www.chinamoney.com.cn/chinese/zqjc/',
      },
    });

    if (!data?.data?.bondBaseInfo) {
      return createDataFrame([], []);
    }

    const bondInfo = data.data.bondBaseInfo;
    const columns = ['名称', '值'];
    const rows: string[][] = [];

    for (const [key, value] of Object.entries(bondInfo)) {
      // 跳过复杂对象
      if (key === 'creditRateEntyList' || key === 'exerciseInfoList') {
        continue;
      }
      if (value !== null && value !== undefined) {
        rows.push([key, String(value)]);
      }
    }

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

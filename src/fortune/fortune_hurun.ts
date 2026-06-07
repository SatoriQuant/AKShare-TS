/**
 * AKShare TypeScript - 胡润排行榜
 * https://www.hurun.net/
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/** 胡润百富榜类型 */
type HurunIndicator =
  | '胡润百富榜'
  | '胡润全球富豪榜'
  | '胡润印度榜'
  | '胡润全球独角兽榜'
  | '中国瞪羚企业榜'
  | '全球瞪羚企业榜'
  | '胡润Under30s创业领袖榜'
  | '胡润中国500强民营企业'
  | '胡润世界500强'
  | '胡润艺术榜';

/** 根据 indicator 返回列名映射 */
function getColumnMapping(indicator: HurunIndicator): { rename: Record<string, string>; select: string[] } {
  switch (indicator) {
    case '胡润百富榜':
    case '胡润全球富豪榜':
    case '胡润印度榜':
    case '胡润全球独角兽榜':
      return {
        rename: {
          hs_Rank_Rich_Ranking: '排名',
          hs_Rank_Rich_Wealth: '财富',
          hs_Rank_Rich_Ranking_Change: '排名变化',
          hs_Rank_Rich_ChaName_Cn: '姓名',
          hs_Rank_Rich_ComName_Cn: '企业',
          hs_Rank_Rich_Industry_Cn: '行业',
          hs_Rank_Global_Ranking: '排名',
          hs_Rank_Global_Wealth: '财富',
          hs_Rank_Global_Ranking_Change: '排名变化',
          hs_Rank_Global_ChaName_Cn: '姓名',
          hs_Rank_Global_ComName_Cn: '企业',
          hs_Rank_Global_Industry_Cn: '行业',
          hs_Rank_India_Ranking: '排名',
          hs_Rank_India_Wealth: '财富',
          hs_Rank_India_Ranking_Change: '排名变化',
          hs_Rank_India_ChaName_Cn: '姓名',
          hs_Rank_India_ComName_Cn: '企业',
          hs_Rank_India_Industry_Cn: '行业',
          hs_Rank_Unicorn_Ranking: '排名',
          hs_Rank_Unicorn_Wealth: '财富',
          hs_Rank_Unicorn_Ranking_Change: '排名变化',
          hs_Rank_Unicorn_ChaName_Cn: '姓名',
          hs_Rank_Unicorn_ComName_Cn: '企业',
          hs_Rank_Unicorn_Industry_Cn: '行业',
        },
        select: ['排名', '财富', '姓名', '企业', '行业'],
      };
    case '中国瞪羚企业榜':
      return {
        rename: {
          hs_Rank_CGazelles_ComHeadquarters_Cn: '企业总部',
          hs_Rank_CGazelles_Name_Cn: '掌门人/联合创始人',
          hs_Rank_CGazelles_ComName_Cn: '企业信息',
          hs_Rank_CGazelles_Industry_Cn: '行业',
        },
        select: ['企业信息', '掌门人/联合创始人', '企业总部', '行业'],
      };
    case '全球瞪羚企业榜':
      return {
        rename: {
          hs_Rank_GGazelles_ComHeadquarters_Cn: '企业总部',
          hs_Rank_GGazelles_Name_Cn: '掌门人/联合创始人',
          hs_Rank_GGazelles_ComName_Cn: '企业信息',
          hs_Rank_GGazelles_Industry_Cn: '行业',
        },
        select: ['企业信息', '掌门人/联合创始人', '企业总部', '行业'],
      };
    case '胡润Under30s创业领袖榜':
      return {
        rename: {
          hs_Rank_U30_ComHeadquarters_Cn: '企业总部',
          hs_Rank_U30_ChaName_Cn: '姓名',
          hs_Rank_U30_ComName_Cn: '企业信息',
          hs_Rank_U30_Industry_Cn: '行业',
        },
        select: ['姓名', '企业信息', '企业总部', '行业'],
      };
    case '胡润中国500强民营企业':
      return {
        rename: {
          hs_Rank_CTop500_Ranking: '排名',
          hs_Rank_CTop500_Wealth: '企业估值',
          hs_Rank_CTop500_Ranking_Change: '排名变化',
          hs_Rank_CTop500_ChaName_Cn: 'CEO',
          hs_Rank_CTop500_ComName_Cn: '企业信息',
          hs_Rank_CTop500_Industry_Cn: '行业',
        },
        select: ['排名', '排名变化', '企业估值', '企业信息', 'CEO', '行业'],
      };
    case '胡润世界500强':
      return {
        rename: {
          hs_Rank_GTop500_Ranking: '排名',
          hs_Rank_GTop500_Wealth: '企业估值',
          hs_Rank_GTop500_Ranking_Change: '排名变化',
          hs_Rank_GTop500_ChaName_Cn: 'CEO',
          hs_Rank_GTop500_ComName_Cn: '企业信息',
          hs_Rank_GTop500_Industry_Cn: '行业',
        },
        select: ['排名', '排名变化', '企业估值', '企业信息', 'CEO', '行业'],
      };
    case '胡润艺术榜':
      return {
        rename: {
          hs_Rank_Art_Ranking: '排名',
          hs_Rank_Art_Turnover: '成交额',
          hs_Rank_Art_Ranking_Change: '排名变化',
          hs_Rank_Art_Name_Cn: '姓名',
          hs_Rank_Art_Age: '年龄',
          hs_Rank_Art_ArtCategory_Cn: '艺术类别',
        },
        select: ['排名', '排名变化', '成交额', '姓名', '年龄', '艺术类别'],
      };
    default:
      return {
        rename: {},
        select: [],
      };
  }
}

/**
 * 胡润排行榜
 * https://www.hurun.net/CN/HuList/Index?num=3YwKs889SRIm
 *
 * @param indicator 榜单类型
 * @param year 年份
 * @returns 指定榜单和年份的数据
 */
export async function hurun_rank(
  indicator: HurunIndicator = '胡润百富榜',
  year: string = '2023'
): Promise<DataFrame> {
  // 第一步：获取主页面，解析名称和URL映射
  const mainUrl = 'https://www.hurun.net/zh-CN/Rank/HsRankDetails?pagetype=rich';
  const mainHtml = await httpGetText(mainUrl);

  // 解析下拉菜单中的链接
  const nameUrlMap: Record<string, string> = {};
  const dropdownRegex = /<ul[^>]*class="dropdown-menu"[^>]*>([\s\S]*?)<\/ul>/gi;
  let dropdownMatch;
  while ((dropdownMatch = dropdownRegex.exec(mainHtml)) !== null) {
    const content = dropdownMatch[1];
    const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(content)) !== null) {
      const href = linkMatch[1];
      const name = linkMatch[2].replace(/<[^>]+>/g, '').trim();
      nameUrlMap[name] = `https://www.hurun.net${href}`;
    }
  }

  const indicatorUrl = nameUrlMap[indicator];
  if (!indicatorUrl) {
    throw new Error(`未找到榜单: ${indicator}`);
  }

  // 第二步：获取榜单页面，解析年份和代码映射
  const indicatorHtml = await httpGetText(indicatorUrl);

  // 解析年份选择器中的代码
  const selectRegex = /<select[^>]*id="exampleFormControlSelect1"[^>]*>([\s\S]*?)<\/select>/i;
  const selectMatch = selectRegex.exec(indicatorHtml);

  const yearCodeMap: Record<string, string> = {};
  if (selectMatch) {
    const selectContent = selectMatch[1];
    const optionRegex = /<option[^>]*value="([^"]+)"[^>]*>([\s\S]*?)<\/option>/gi;
    let optionMatch;
    while ((optionMatch = optionRegex.exec(selectContent)) !== null) {
      const value = optionMatch[1];
      const text = optionMatch[2].trim().split(' ')[0];
      // value 格式通常包含 num=xxx，提取最后一段
      const codeParts = value.split('=');
      const code = codeParts[codeParts.length - 1];
      yearCodeMap[text] = code;
    }
  }

  const yearCode = yearCodeMap[year];
  if (!yearCode) {
    throw new Error(`未找到年份: ${year} 的数据`);
  }

  // 第三步：获取数据
  const dataUrl = 'https://www.hurun.net/zh-CN/Rank/HsRankDetailsList';
  const params = {
    num: yearCode,
    search: '',
    offset: '0',
    limit: '20000',
  };

  interface HurunResponse {
    rows: Record<string, any>[];
    total?: number;
  }

  const data = await httpGet<HurunResponse>(dataUrl, { params });

  if (!data?.rows || data.rows.length === 0) {
    return createDataFrame([], []);
  }

  const { rename, select } = getColumnMapping(indicator);

  // 重命名列
  const renamedRows = data.rows.map(row => {
    const newRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      const newKey = rename[key] || key;
      newRow[newKey] = value;
    }
    return newRow;
  });

  // 选择指定列
  if (select.length > 0) {
    const columns = select;
    const rows = renamedRows.map(row => columns.map(col => row[col] ?? ''));
    return createDataFrame(columns, rows);
  }

  // 如果没有指定列，返回所有重命名后的列
  if (renamedRows.length === 0) {
    return createDataFrame([], []);
  }
  const columns = Object.keys(renamedRows[0]);
  const rows = renamedRows.map(row => columns.map(col => row[col]));
  return createDataFrame(columns, rows);
}

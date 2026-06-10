/**
 * AKShare TypeScript - 中国银行保险监督管理委员会-首页-政务信息-行政处罚
 * https://www.nfra.gov.cn/cn/view/pages/ItemList.html?itemPId=923&itemId=4115&itemUrl=ItemListRightList.html&itemName=%E9%93%B6%E4%BF%9D%E7%9B%91%E5%88%86%E5%B1%80%E6%9C%AC%E7%BA%A7&itemsubPId=931&itemsubPName=%E8%A1%8C%E6%94%BF%E5%A4%84%E7%BD%9A#2
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';
import { cbirc_headers_without_cookie_2020 } from './cons';

/**
 * 首页-政务信息-行政处罚-银保监分局本级 总页数
 * https://www.nfra.gov.cn/cn/view/pages/ItemList.html?itemPId=923&itemId=4115&itemUrl=ItemListRightList.html&itemName=%E9%93%B6%E4%BF%9D%E7%9B%91%E5%88%86%E5%B1%80%E6%9C%AC%E7%BA%A7&itemsubPId=931
 * @param item choice of {"机关", "本级", "分局本级"}
 * @returns 总页数
 */
export async function bank_fjcf_total_num(item: string = '分局本级'): Promise<number> {
  const itemIdList: Record<string, string> = {
    '机关': '4113',
    '本级': '4114',
    '分局本级': '4115',
  };

  const url = 'https://www.nfra.gov.cn/cbircweb/DocInfo/SelectDocByItemIdAndChild';
  const params = {
    itemId: itemIdList[item],
    pageSize: '18',
    pageIndex: '1',
  };

  const response = await httpGet<any>(url, { params, headers: cbirc_headers_without_cookie_2020 });
  return parseInt(response.data.total) || 0;
}

/**
 * 获取首页-政务信息-行政处罚-银保监分局本级的总页数
 * https://www.nfra.gov.cn/cn/view/pages/ItemList.html?itemPId=923&itemId=4115&itemUrl=ItemListRightList.html&itemName=%E9%93%B6%E4%BF%9D%E7%9B%91%E5%88%86%E5%B1%80%E6%9C%AC%E7%BA%A7&itemsubPId=931
 * @param item choice of {"机关", "本级", "分局本级"}
 * @param begin 开始页数
 * @returns 总页数
 */
export async function bank_fjcf_total_page(
  item: string = '分局本级',
  begin: number = 1
): Promise<number> {
  const itemIdList: Record<string, string> = {
    '机关': '4113',
    '本级': '4114',
    '分局本级': '4115',
  };

  const url = 'https://www.nfra.gov.cn/cbircweb/DocInfo/SelectDocByItemIdAndChild';
  const params = {
    itemId: itemIdList[item],
    pageSize: '18',
    pageIndex: String(begin),
  };

  const response = await httpGet<any>(url, { params, headers: cbirc_headers_without_cookie_2020 });
  const total = parseInt(response.data.total) || 0;
  return Math.ceil(total / 18);
}

/**
 * 获取 首页-政务信息-行政处罚-银保监分局本级-每一页的 json 数据
 * @param page 需要获取前 page 页的内容, 总页数请通过 bank_fjcf_total_page() 获取
 * @param item choice of {"机关", "本级", "分局本级"}
 * @param begin 开始页数
 * @returns 需要的字段
 */
export async function bank_fjcf_page_url(
  page: number = 5,
  item: string = '分局本级',
  begin: number = 1
): Promise<DataFrame> {
  const itemIdList: Record<string, string> = {
    '机关': '4113',
    '本级': '4114',
    '分局本级': '4115',
  };

  const url = 'https://www.nfra.gov.cn/cbircweb/DocInfo/SelectDocByItemIdAndChild';
  const allRows: any[][] = [];

  for (let i_page = begin; i_page < page + begin; i_page++) {
    const params = {
      itemId: itemIdList[item],
      pageSize: '18',
      pageIndex: String(i_page),
    };

    const response = await httpGet<any>(url, { params, headers: cbirc_headers_without_cookie_2020 });

    if (response.data && response.data.rows) {
      response.data.rows.forEach((row: any) => {
        allRows.push([
          row.docId,
          row.docSubtitle,
          row.publishDate,
          row.docFileUrl,
          row.docTitle,
          row.generaltype,
        ]);
      });
    }
  }

  const columns = ['docId', 'docSubtitle', 'publishDate', 'docFileUrl', 'docTitle', 'generaltype'];
  return createDataFrame(columns, allRows);
}

/**
 * 获取 首页-政务信息-行政处罚-银保监分局本级-XXXX行政处罚信息公开表 数据
 * @param page 需要获取前 page 页的内容, 总页数请通过 bank_fjcf_total_page() 获取
 * @param item choice of {"机关", "本级", "分局本级"}
 * @param begin 开始页面
 * @returns 返回所有行政处罚信息公开表的集合, 按第一页到最后一页的顺序排列
 */
export async function bank_fjcf_table_detail(
  page: number = 5,
  item: string = '分局本级',
  begin: number = 1
): Promise<DataFrame> {
  const pageData = await bank_fjcf_page_url(page, item, begin);
  const docIds = pageData.data.map(row => row[0]); // docId is first column

  const allRows: any[][] = [];

  for (const docId of docIds) {
    const url = `https://www.nfra.gov.cn/cn/static/data/DocInfo/SelectByDocId/data_docId=${docId}.json`;

    try {
      const response = await httpGet<any>(url);

      if (response.data && response.data.docClob) {
        // Parse HTML table from docClob
        const tableMatch = response.data.docClob.match(/<table[^>]*>[\s\S]*?<\/table>/i);
        if (tableMatch) {
          const table = tableMatch[0];
          const cells: string[] = [];
          const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
          let cellMatch;

          while ((cellMatch = cellRegex.exec(table)) !== null) {
            cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
          }

          // Handle different table formats
          let tableList = cells.slice(cells.length >= 2 ? 1 : 0);

          // Fill missing fields for different table formats
          if (tableList.length === 7) {
            tableList.splice(2, 0, '');
            tableList.splice(3, 0, '');
            tableList.splice(4, 0, '');
          } else if (tableList.length === 8) {
            tableList.splice(1, 0, '');
            tableList.splice(2, 0, '');
          } else if (tableList.length === 9) {
            tableList.splice(2, 0, '');
          } else if (tableList.length === 11) {
            tableList = tableList.slice(2);
            tableList.splice(2, 0, '');
          }

          if (tableList.length === 10) {
            allRows.push([
              ...tableList,
              String(docId),
              response.data.publishDate || '',
            ]);
          }
        }
      }
    } catch (error) {
      // Skip non-table data
      continue;
    }
  }

  const columns = [
    '行政处罚决定书文号',
    '姓名',
    '单位',
    '单位名称',
    '主要负责人姓名',
    '主要违法违规事实（案由）',
    '行政处罚依据',
    '行政处罚决定',
    '作出处罚决定的机关名称',
    '作出处罚决定的日期',
    '处罚ID',
    '处罚公布日期',
  ];

  return createDataFrame(columns, allRows);
}

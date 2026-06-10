/**
 * AKShare TypeScript - 郑州商品交易所-交易数据-参考数据
 * http://www.czce.com.cn/cn/jysj/cksj/H770322index_1.htm
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 简单的 XML 解析: 提取指定标签下的子元素数据
 */
function parseXmlRecords(xml: string, tagName: string): Record<string, string>[] {
  const records: Record<string, string>[] = [];
  const tagRegex = new RegExp(`<${tagName}>[\\s\\S]*?<\\/${tagName}>`, 'gi');
  const matches = xml.match(tagRegex);

  if (!matches) return records;

  for (const match of matches) {
    const record: Record<string, string> = {};
    // Strip the outer container tags to get only inner field content
    const inner = match
      .replace(new RegExp(`^<${tagName}>`, 'i'), '')
      .replace(new RegExp(`<\\/${tagName}>$`, 'i'), '');

    const fieldRegex = /<([A-Za-z_]+)>([\s\S]*?)<\/\1>/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(inner)) !== null) {
      record[fieldMatch[1]] = fieldMatch[2].trim();
    }

    records.push(record);
  }

  return records;
}

/**
 * 郑州商品交易所-交易数据-参考数据
 * http://www.czce.com.cn/cn/jysj/cksj/H770322index_1.htm
 *
 * @param date 查询日期，格式 "YYYYMMDD"
 */
export async function futures_contract_info_czce(
  date: string = '20240228'
): Promise<DataFrame> {
  const year = date.slice(0, 4);
  const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${year}/${date}/FutureDataReferenceData.xml`;

  const xml = await httpGet<string>(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
      Host: 'www.czce.com.cn',
    },
    responseType: 'text' as any,
  });

  const records = parseXmlRecords(xml, 'Contract');

  if (records.length === 0) {
    return createDataFrame([], []);
  }

  const columnMap: Record<string, string> = {
    Name: '产品名称',
    CtrCd: '合约代码',
    PrdCd: '产品代码',
    PrdTp: '产品类型',
    ExchCd: '交易所MIC编码',
    SegTp: '交易场所',
    TrdHrs: '交易时间节假日除外',
    TrdCtyCd: '交易国家ISO编码',
    TrdCcyCd: '交易币种ISO编码',
    ClrngCcyCd: '结算币种ISO编码',
    ExpiryTime: '到期时间待国家公布2025年节假日安排后进行调整',
    SettleTp: '结算方式',
    Duration: '挂牌频率',
    TckSz: '最小变动价位',
    TckVal: '最小变动价值',
    CtrSz: '交易单位',
    MsrmntUnt: '计量单位',
    MaxOrdSz: '最大下单量',
    MnthPosLmt: '日持仓限额期货公司会员不限仓',
    MinBlckTrdSz: '大宗交易最小规模',
    CesrEaaFl: '是否受CESR监管',
    FlexElgblFl: '是否为灵活合约',
    ListCy: '上市周期该产品的所有合约月份',
    DlvryNtcDt: '交割通知日',
    FrstTrdDt: '第一交易日',
    LstTrdDt: '最后交易日待国家公布2025年节假日安排后进行调整',
    DlvrySettleDt: '交割结算日',
    MnthCd: '月份代码',
    YrCd: '年份代码',
    LstDlvryDt: '最后交割日',
    LstDlvryDtBoard: '车（船）板最后交割日',
    DlvryMnth: '合约交割月份本合约交割月份',
    Margin: '交易保证金率',
    PxLim: '涨跌停板',
    FeeCcy: '费用币种ISO编码',
    TrdFee: '交易手续费',
    FeeCollectionType: '手续费收取方式',
    DlvryFee: '交割手续费',
    IntraDayTrdFee: '平今仓手续费',
    TradingLimit: '交易限额',
  };

  // 获取所有可能的列（按 columnMap 中文名排列）
  const allColumns = Object.values(columnMap);

  // 从数据中提取实际存在的列
  const firstRecord = records[0];
  const presentSourceKeys = Object.keys(firstRecord);
  const columns = presentSourceKeys
    .map((key) => columnMap[key] || key)
    .filter((val, idx, arr) => arr.indexOf(val) === idx);

  const numericColumns = ['交易手续费', '交割手续费', '平今仓手续费', '交易限额'];

  const rows = records.map((record) =>
    columns.map((col) => {
      // 找到原始 key
      const sourceKey = presentSourceKeys.find((key) => (columnMap[key] || key) === col);
      const val = sourceKey ? record[sourceKey] || '' : '';

      if (numericColumns.includes(col)) {
        const num = parseFloat(val);
        return isNaN(num) ? val : num;
      }

      return val;
    })
  );

  return createDataFrame(columns, rows);
}

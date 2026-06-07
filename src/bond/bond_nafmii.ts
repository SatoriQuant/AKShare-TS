/**
 * AKShare TypeScript - 中国银行间市场交易商协会数据接口
 * 中国银行间市场交易商协会(https://www.nafmii.org.cn/)
 * 孔雀开屏(http://zhuce.nafmii.org.cn/fans/publicQuery/manager)
 */

import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取非金融企业债务融资工具注册信息系统数据
 * http://zhuce.nafmii.org.cn/fans/publicQuery/manager
 *
 * @param page 页码
 */
export async function bond_debt_nafmii(page: string = '1'): Promise<DataFrame> {
  const url = 'http://zhuce.nafmii.org.cn/fans/publicQuery/releFileProjDataGrid';

  const payload = {
    regFileName: '',
    itemType: '',
    startTime: '',
    endTime: '',
    entityName: '',
    leadManager: '',
    regPrdtType: '',
    page,
    rows: 50,
  };

  try {
    const data = await httpPost<any>(url, payload);

    if (!data?.rows) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券名称', '品种', '注册或备案', '金额',
      '注册通知书文号', '更新日期', '项目状态'
    ];

    const rows = data.rows.map((item: any) => [
      item.regFileName,
      item.regPrdtType,
      item.isReg,
      parseFloat(item.firstIssueAmount) || null,
      item.regNoticeNo || '',
      item.releaseTime,
      item.projPhase,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

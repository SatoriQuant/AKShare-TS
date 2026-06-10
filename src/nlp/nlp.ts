/**
 * AKShare TypeScript - NLP 自然语言处理接口
 * https://ownthink.com/
 * https://www.ownthink.com/docs/kg/
 */

import { httpGet, httpPost } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 知识图谱接口 - ownthink
 * https://ownthink.com/
 *
 * @param word 查询的中文词
 * @param indicator 返回类型: "entity" | "desc" | "avp" | "tag"
 */
export async function nlp_ownthink(
  word: string = '人工智能',
  indicator: 'entity' | 'desc' | 'avp' | 'tag' = 'entity'
): Promise<DataFrame | string | string[] | null> {
  const url = 'https://api.ownthink.com/kg/knowledge';

  const formData = new URLSearchParams();
  formData.append('entity', word);

  const resp = await httpPost<any>(url, formData.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!resp?.data) {
    console.warn('Can not find the resource, please type into the correct word');
    return indicator === 'avp' ? createDataFrame([], []) : null;
  }

  const data = resp.data;

  switch (indicator) {
    case 'entity':
      return data.entity;
    case 'desc':
      return data.desc;
    case 'avp':
      if (Array.isArray(data.avp)) {
        const columns = ['字段', '值'];
        const rows = data.avp.map((item: any) => [item[0], item[1]]);
        return createDataFrame(columns, rows);
      }
      return createDataFrame([], []);
    case 'tag':
      return data.tag;
    default:
      return data.entity;
  }
}

/**
 * 智能问答 - ownthink
 * https://ownthink.com/robot.html
 *
 * @param question 中文问题
 * @returns 回答文本
 */
export async function nlp_answer(question: string = '人工智能'): Promise<string> {
  const url = 'https://api.ownthink.com/bot';

  const data = await httpGet<any>(url, {
    params: { spoken: question },
  });

  return data?.data?.info?.text ?? '';
}

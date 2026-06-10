/**
 * AKShare TypeScript - 河北省空气质量预报信息发布系统
 * https://110.249.223.67/publish
 */

import { load } from 'cheerio';
import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

function parseNullableNumber(value: string): number | null {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * 河北省空气质量预报信息发布系统-空气质量预报, 未来 6 天
 * http://218.11.10.130:8080/#/application/home
 * @returns 所有地区的空气质量数据
 */
export async function air_quality_hebei(): Promise<DataFrame> {
  const url = 'http://218.11.10.130:8080/api/hour/130000.xml';
  const response = await httpGet<string>(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/xml,text/xml,*/*;q=0.8',
    },
  });

  const $ = load(response, { xmlMode: true });
  const rows: Record<string, string | number | null>[] = [];
  const pollutantKeys = new Set<string>();

  $('City').each((_, cityEl) => {
    const city = $(cityEl);
    const cityName = city.find('Name').first().text().trim();

    city.find('Pointer').each((__, pointerEl) => {
      const pointer = $(pointerEl);
      const row: Record<string, string | number | null> = {
        城市: cityName,
        区域: pointer.find('Region').first().text().trim(),
        监测点: pointer.find('Name').first().text().trim(),
        时间: pointer.find('DataTime').first().text().trim(),
        AQI: parseNullableNumber(pointer.find('AQI').first().text().trim()),
        空气质量等级: pointer.find('Level').first().text().trim(),
        首要污染物: pointer.find('MaxPoll').first().text().trim(),
        经度: parseNullableNumber(pointer.find('CLng').first().text().trim()),
        纬度: parseNullableNumber(pointer.find('CLat').first().text().trim()),
      };

      // XML 标签名 → 中文名映射（与 Python 版保持一致）
      const pollNameMap: Record<string, string> = {
        SO2: '二氧化硫',
        CO: '一氧化碳',
        NO2: '二氧化氮',
        'O3-1H': '臭氧1小时',
        'O3-8H': '臭氧8小时',
        'PM2.5': 'PM2.5',
        PM10: 'PM10',
      };

      pointer.find('Poll').each((___, pollEl) => {
        const poll = $(pollEl);
        const rawName = poll.find('Name').first().text().trim();
        if (!rawName) return;
        const chName = pollNameMap[rawName] ?? rawName;
        const valueCol = `${chName}_浓度`;
        const iaqiCol = `${chName}_IAQI`;
        row[valueCol] = parseNullableNumber(poll.find('Value').first().text().trim());
        row[iaqiCol] = parseNullableNumber(poll.find('IAQI').first().text().trim());
        pollutantKeys.add(valueCol);
        pollutantKeys.add(iaqiCol);
      });

      rows.push(row);
    });
  });

  const basicColumns = ['城市', '区域', '监测点', '时间', 'AQI', '空气质量等级', '首要污染物', '经度', '纬度'];
  const pollutantColumns = Array.from(pollutantKeys).sort();
  const columns = [...basicColumns, ...pollutantColumns];

  const data = rows.map((row) => columns.map((col) => row[col] ?? null));
  return createDataFrame(columns, data);
}

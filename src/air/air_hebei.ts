/**
 * AKShare TypeScript - 河北省空气质量预报信息发布系统
 * https://110.249.223.67/publish
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 河北省空气质量预报信息发布系统-空气质量预报, 未来 6 天
 * http://218.11.10.130:8080/#/application/home
 * @returns 所有地区的空气质量数据
 */
export async function air_quality_hebei(): Promise<DataFrame> {
  const url = 'http://218.11.10.130:8080/api/hour/130000.xml';
  const response = await httpGet<string>(url);

  // Simple XML parsing using regex
  const data: any[][] = [];

  // Extract all City blocks
  const cityRegex = /<City>([\s\S]*?)<\/City>/g;
  let cityMatch;

  while ((cityMatch = cityRegex.exec(response)) !== null) {
    const cityBlock = cityMatch[1];
    const cityNameMatch = cityBlock.match(/<Name>(.*?)<\/Name>/);
    const cityName = cityNameMatch ? cityNameMatch[1] : '';

    // Extract all Pointer blocks within this City
    const pointerRegex = /<Pointer>([\s\S]*?)<\/Pointer>/g;
    let pointerMatch;

    while ((pointerMatch = pointerRegex.exec(cityBlock)) !== null) {
      const pointerBlock = pointerMatch[1];

      const getTagValue = (tag: string): string => {
        const match = pointerBlock.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`));
        return match ? match[1] : '';
      };

      const row: any[] = [
        cityName,
        getTagValue('Region'),
        getTagValue('Name'),
        getTagValue('DataTime'),
        parseFloat(getTagValue('AQI')) || 0,
        getTagValue('Level'),
        getTagValue('MaxPoll'),
        parseFloat(getTagValue('CLng')) || 0,
        parseFloat(getTagValue('CLat')) || 0,
      ];

      // Add pollutant data
      const pollutantData: Record<string, any> = {};
      const pollRegex = /<Poll>([\s\S]*?)<\/Poll>/g;
      let pollMatch;

      while ((pollMatch = pollRegex.exec(pointerBlock)) !== null) {
        const pollBlock = pollMatch[1];
        const getPollValue = (tag: string): string => {
          const match = pollBlock.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`));
          return match ? match[1] : '';
        };

        const pollName = getPollValue('Name');
        const pollValue = getPollValue('Value');
        const pollIAQI = getPollValue('IAQI');

        pollutantData[`${pollName}_Value`] = parseFloat(pollValue) || 0;
        pollutantData[`${pollName}_IAQI`] = parseFloat(pollIAQI) || 0;
      }

      // Add all pollutant values to row
      row.push(
        pollutantData['SO2_Value'] || 0,
        pollutantData['SO2_IAQI'] || 0,
        pollutantData['CO_Value'] || 0,
        pollutantData['CO_IAQI'] || 0,
        pollutantData['NO2_Value'] || 0,
        pollutantData['NO2_IAQI'] || 0,
        pollutantData['O3-1H_Value'] || 0,
        pollutantData['O3-1H_IAQI'] || 0,
        pollutantData['O3-8H_Value'] || 0,
        pollutantData['O3-8H_IAQI'] || 0,
        pollutantData['PM2.5_Value'] || 0,
        pollutantData['PM2.5_IAQI'] || 0,
        pollutantData['PM10_Value'] || 0,
        pollutantData['PM10_IAQI'] || 0
      );

      data.push(row);
    }
  }

  const columns = [
    '城市', '区域', '监测点', '时间', 'AQI', '空气质量等级', '首要污染物', '经度', '纬度',
    '二氧化硫_浓度', '二氧化硫_IAQI',
    '一氧化碳_浓度', '一氧化碳_IAQI',
    '二氧化氮_浓度', '二氧化氮_IAQI',
    '臭氧1小时_浓度', '臭氧1小时_IAQI',
    '臭氧8小时_浓度', '臭氧8小时_IAQI',
    'PM2.5_浓度', 'PM2.5_IAQI',
    'PM10_浓度', 'PM10_IAQI'
  ];

  return createDataFrame(columns, data);
}

/**
 * AKShare TypeScript - 百度地图慧眼-百度迁徙数据
 * https://qianxi.baidu.com/
 */

import { httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';
import { provinceDict, cityDict, getAreaCodeMap, isProvince } from './cons';

/**
 * 百度地图慧眼-百度迁徙-XXX迁入地详情/XXX迁出地详情
 * 展示 top100 结果，如不够 100 则展示全部
 *
 * 迁入来源地比例: 从 xx 地迁入到当前区域的人数与当前区域迁入总人口的比值
 * 迁出目的地比例: 从当前区域迁出到 xx 的人口与从当前区域迁出总人口的比值
 *
 * @param area 可以输入省份或者具体城市，需要用全称
 * @param indicator move_in 迁入 move_out 迁出
 * @param date 查询的日期 20200101 以后的时间
 * @returns 迁入地详情/迁出地详情
 */
export async function migration_area_baidu(
  area: string = '重庆市',
  indicator: 'move_in' | 'move_out' = 'move_in',
  date: string = '20230922'
): Promise<DataFrame> {
  const areaCodeMap = getAreaCodeMap();
  const code = areaCodeMap[area];

  if (!code) {
    throw new Error(`未找到地区: ${area}，请输入正确的省份或城市全称`);
  }

  const dtFlag = isProvince(code) ? 'province' : 'city';

  const url = 'https://huiyan.baidu.com/migration/cityrank.jsonp';
  const params = {
    dt: dtFlag,
    id: code,
    type: indicator,
    date: date,
  };

  const responseText = await httpGetText(url, { params });

  // 解析 JSONP 格式: callback({...});
  const jsonStart = responseText.indexOf('({');
  const jsonEnd = responseText.lastIndexOf('});');
  if (jsonStart === -1 || jsonEnd === -1) {
    return createDataFrame([], []);
  }

  const jsonStr = responseText.substring(jsonStart + 1, jsonEnd + 1);
  const dataJson = JSON.parse(jsonStr);

  if (!dataJson?.data?.list) {
    return createDataFrame([], []);
  }

  const list = dataJson.data.list as Array<{ city_name: string; province_name: string; value: string }>;

  const columns = ['city_name', 'province_name', 'value'];
  const rows = list.map(item => [
    item.city_name,
    item.province_name,
    Number(item.value) || 0,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 百度地图慧眼-百度迁徙-迁徙规模
 * 迁徙规模指数：反映迁入或迁出人口规模，城市间可横向对比
 * 城市迁徙边界采用该城市行政区划，包含该城市管辖的区、县、乡、村
 *
 * @param area 可以输入省份或者具体城市，需要用全称
 * @param indicator move_in 迁入 move_out 迁出
 * @returns 时间序列的迁徙规模指数
 */
export async function migration_scale_baidu(
  area: string = '广州市',
  indicator: 'move_in' | 'move_out' = 'move_in'
): Promise<DataFrame> {
  const areaCodeMap = getAreaCodeMap();
  const code = areaCodeMap[area];

  if (!code) {
    throw new Error(`未找到地区: ${area}，请输入正确的省份或城市全称`);
  }

  const dtFlag = isProvince(code) ? 'province' : 'city';

  const url = 'https://huiyan.baidu.com/migration/historycurve.jsonp';
  const params = {
    dt: dtFlag,
    id: code,
    type: indicator,
  };

  const responseText = await httpGetText(url, { params });

  // 解析 JSONP 格式
  const jsonStart = responseText.indexOf('({');
  const jsonEnd = responseText.lastIndexOf('});');
  if (jsonStart === -1 || jsonEnd === -1) {
    return createDataFrame([], []);
  }

  const jsonStr = responseText.substring(jsonStart + 1, jsonEnd + 1);
  const dataJson = JSON.parse(jsonStr);

  if (!dataJson?.data?.list) {
    return createDataFrame([], []);
  }

  const listObj = dataJson.data.list as Record<string, string>;
  const columns = ['日期', '迁徙规模指数'];
  const rows = Object.entries(listObj).map(([dateStr, value]) => [
    dateStr,
    Number(value) || 0,
  ]);

  return createDataFrame(columns, rows);
}

import DataSet from '@antv/data-set';
import { Chart } from '@antv/g2';

fetch('../data/candle-sticks.json')
  .then(res => res.json())
  .then(data => {
    // 设置状态量，时间格式建议转换为时间戳，转换为时间戳时请注意区间
    const ds = new DataSet();
    const dv = ds.createView();
    dv.source(data)
      .transform({
        type: 'map',
        callback: obj => {
          obj.trend = (obj.start <= obj.end) ? '上涨' : '下跌';
          obj.range = [obj.start, obj.end, obj.max, obj.min];
          return obj;
        }
      });

    const chart = new Chart({
      container: 'container',
      autoFit: true,
      height: 400,
      padding: [10, 40, 40, 40]
    });

    chart.data(dv.rows);

    chart.scale({
      time: {
        type: 'timeCat',
        range: [0, 1],
        tickCount: 4,
      },
      trend: {
        values: ['上涨', '下跌']
      },
      volumn: { alias: '成交量' },
      start: { alias: '开盘价' },
      end: { alias: '收盘价' },
      max: { alias: '最高价' },
      min: { alias: '最低价' },
      range: { alias: '股票价格' }
    });
    chart.tooltip({
      showTitle: false,
      showMarkers: false,
      itemTpl: '<li class="g2-tooltip-list-item" data-index={index}>'
        + '<span style="background-color:{color};" class="g2-tooltip-marker"></span>'
        + '{name}{value}</li>'
    });

    chart.schema()
      .position('time*range')
      .color('trend', val => {
        if (val === '上涨') {
          return '#f04864';
        }

        if (val === '下跌') {
          return '#2fc25b';
        }
      })
      .shape('candle')
      .tooltip('time*start*end*max*min', (time, start, end, max, min) => {
        return {
          name: time,
          value: '<br><span style="padding-left: 16px">开盘价：' + start + '</span><br/>'
            + '<span style="padding-left: 16px">收盘价：' + end + '</span><br/>'
            + '<span style="padding-left: 16px">最高价：' + max + '</span><br/>'
            + '<span style="padding-left: 16px">最低价：' + min + '</span>'
        };
      });

    chart.render();
  });
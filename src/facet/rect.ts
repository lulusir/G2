import { deepMix, each, every, filter, isNil } from '@antv/util';
import { AxisCfg } from '../chart/interface';
import View from '../chart/view';
import { DIRECTION } from '../constant';
import { Datum } from '../interface';
import { getFactTitleConfig } from '../util/facet';
import { Facet } from './facet';
import { RectCfg, RectData } from './interface';

/**
 * 矩阵分面
 */
export default class Rect extends Facet<RectCfg, RectData> {
  protected afterEachView(view: View, facet: RectData) {
    this.processAxis(view, facet);
  }

  protected beforeEachView(view: View, facet: RectData) {
    // do nothing
  }

  protected getDefaultCfg() {
    // @ts-ignore
    const fontFamily = this.view.getTheme().fontFamily;
    return deepMix({}, super.getDefaultCfg(), {
      columnTitle: {
        style: {
          fontSize: 14,
          fill: '#666',
          fontFamily,
        }
      },
      rowTitle: {
        style: {
          fontSize: 14,
          fill: '#666',
          fontFamily,
        }
      }
    })
  }

  public render() {
    super.render();

    if (this.cfg.showTitle) {
      this.renderTitle();
    }
  }

  /**
   * 生成矩阵分面的分面数据
   * @param data
   */
  protected generateFacets(data: Datum[]): RectData[] {
    const [columnField, rowField] = this.cfg.fields;

    const rst = [];
    let columnValuesLength = 1;
    let rowValuesLength = 1;

    let columnValues: string[] = [''];
    let rowValues: string[] = [''];

    if (columnField) {
      columnValues = this.getFieldValues(data, columnField);
      columnValuesLength = columnValues.length;
    }
    if (rowField) {
      rowValues = this.getFieldValues(data, rowField);
      rowValuesLength = rowValues.length;
    }

    // 获取每个维度对应的数据配置片段
    columnValues.forEach((xVal, xIndex) => {
      rowValues.forEach((yVal, yIndex) => {
        const conditions = [
          { field: columnField, value: xVal, values: columnValues },
          { field: rowField, value: yVal, values: rowValues },
        ];

        const facetData = filter(data, (datum: Datum) => {
          // 过滤出全部满足条件的数据
          return every(conditions, (condition) => {
            const { field, value } = condition;

            if (!isNil(value) && field) {
              return datum[field] === value;
            }
            return true;
          });
        });

        const facet: RectData = {
          type: this.cfg.type,
          data: facetData,
          region: this.getRegion(rowValuesLength, columnValuesLength, xIndex, yIndex),

          columnValue: xVal,
          rowValue: yVal,
          columnField,
          rowField,
          columnIndex: xIndex,
          rowIndex: yIndex,
          columnValuesLength,
          rowValuesLength,
        };
        rst.push(facet);
      });
    });

    return rst;
  }

  private renderTitle(): void {
    each(this.facets, (facet: RectData, facetIndex: number) => {
      const { columnIndex, rowIndex, columnValuesLength, rowValuesLength, columnValue, rowValue, view } = facet;

      // top
      if (rowIndex === 0) {
        const config = deepMix({
          position: [ '50%', '0%' ] as [string, string],
          content: columnValue,
        }, getFactTitleConfig(DIRECTION.TOP), this.cfg.columnTitle);

        view.annotation().text(config);
      }
      // right
      if (columnIndex === columnValuesLength - 1) {
        const config = deepMix({
          position: [ '100%', '50%' ] as [string, string],
          content: rowValue,
        }, getFactTitleConfig(DIRECTION.RIGHT), this.cfg.rowTitle);

        view.annotation().text(config);
      }
    });
  }

  /**
   * 设置 x 坐标轴的文本、title 是否显示
   * @param x
   * @param axes
   * @param option
   * @param facet
   */
  protected getXAxisOption(x: string, axes: any, option: AxisCfg, facet: RectData): object {
    // 非最后一行
    if (facet.rowIndex !== facet.rowValuesLength - 1) {
      return {
        ...option,
        title: null,
        label: null,
      };
    } else if (facet.columnIndex !== Math.floor((facet.columnValuesLength - 1) / 2)) {
      // 不是中间列
      return {
        ...option,
        title: null,
      }
    }
    return option
  }

  /**
   * 设置 y 坐标轴的文本、title 是否显示
   * @param y
   * @param axes
   * @param option
   * @param facet
   */
  protected getYAxisOption(y: string, axes: any, option: AxisCfg, facet: RectData): object {
    if (facet.columnIndex !== 0) {
      return {
        ...option,
        title: null,
        label: null,
      };
    } else if (facet.rowIndex !== Math.floor((facet.rowValuesLength - 1) / 2)) {
      return {
        ...option,
        title: null,
      }
    }
    return option;
  }
}
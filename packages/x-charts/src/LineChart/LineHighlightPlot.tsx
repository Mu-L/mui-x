'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { SlotComponentPropsFromProps } from '@mui/x-internals/types';
import { useStore } from '../internals/store/useStore';
import { useSelector } from '../internals/store/useSelector';
import { LineHighlightElement, LineHighlightElementProps } from './LineHighlightElement';
import { getValueToPositionMapper } from '../hooks/useScale';
import { DEFAULT_X_AXIS_KEY } from '../constants';
import { useLineSeriesContext } from '../hooks/useLineSeries';
import getColor from './seriesConfig/getColor';
import { useChartContext } from '../context/ChartProvider';
import {
  UseChartCartesianAxisSignature,
  selectorChartsHighlightXAxisIndex,
} from '../internals/plugins/featurePlugins/useChartCartesianAxis';
import { useXAxes, useYAxes } from '../hooks/useAxis';

export interface LineHighlightPlotSlots {
  lineHighlight?: React.JSXElementConstructor<LineHighlightElementProps>;
}

export interface LineHighlightPlotSlotProps {
  lineHighlight?: SlotComponentPropsFromProps<LineHighlightElementProps, {}, {}>;
}

export interface LineHighlightPlotProps extends React.SVGAttributes<SVGSVGElement> {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: LineHighlightPlotSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: LineHighlightPlotSlotProps;
}

/**
 * Demos:
 *
 * - [Lines](https://mui.com/x/react-charts/lines/)
 * - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
 *
 * API:
 *
 * - [LineHighlightPlot API](https://mui.com/x/api/charts/line-highlight-plot/)
 */
function LineHighlightPlot(props: LineHighlightPlotProps) {
  const { slots, slotProps, ...other } = props;

  const seriesData = useLineSeriesContext();
  const { xAxis, xAxisIds } = useXAxes();
  const { yAxis, yAxisIds } = useYAxes();

  const { instance } = useChartContext();

  const store = useStore<[UseChartCartesianAxisSignature]>();
  const highlightedIndexes = useSelector(store, selectorChartsHighlightXAxisIndex);

  if (highlightedIndexes.length === 0) {
    return null;
  }

  if (seriesData === undefined) {
    return null;
  }
  const { series, stackingGroups } = seriesData;
  const defaultXAxisId = xAxisIds[0];
  const defaultYAxisId = yAxisIds[0];

  const Element = slots?.lineHighlight ?? LineHighlightElement;

  return (
    <g {...other}>
      {highlightedIndexes.flatMap(({ dataIndex: highlightedIndex, axisId: highlightedAxisId }) =>
        stackingGroups.flatMap(({ ids: groupIds }) => {
          return groupIds.flatMap((seriesId) => {
            const {
              xAxisId = defaultXAxisId,
              yAxisId = defaultYAxisId,
              stackedData,
              data,
              disableHighlight,
              shape = 'circle',
            } = series[seriesId];

            if (disableHighlight || data[highlightedIndex] == null) {
              return null;
            }
            if (highlightedAxisId !== xAxisId) {
              return null;
            }
            const xScale = getValueToPositionMapper(xAxis[xAxisId].scale);
            const yScale = yAxis[yAxisId].scale;
            const xData = xAxis[xAxisId].data;

            if (xData === undefined) {
              throw new Error(
                `MUI X Charts: ${
                  xAxisId === DEFAULT_X_AXIS_KEY
                    ? 'The first `xAxis`'
                    : `The x-axis with id "${xAxisId}"`
                } should have data property to be able to display a line plot.`,
              );
            }

            const x = xScale(xData[highlightedIndex]);
            const y = yScale(stackedData[highlightedIndex][1])!; // This should not be undefined since y should not be a band scale

            if (!instance.isPointInside(x, y)) {
              return null;
            }

            const colorGetter = getColor(series[seriesId], xAxis[xAxisId], yAxis[yAxisId]);
            return (
              <Element
                key={`${seriesId}`}
                id={seriesId}
                color={colorGetter(highlightedIndex)}
                x={x}
                y={y}
                shape={shape}
                {...slotProps?.lineHighlight}
              />
            );
          });
        }),
      )}
    </g>
  );
}

LineHighlightPlot.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
} as any;

export { LineHighlightPlot };

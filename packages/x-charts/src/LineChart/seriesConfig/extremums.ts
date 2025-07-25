import {
  CartesianExtremumFilter,
  CartesianExtremumGetter,
} from '../../internals/plugins/models/seriesConfig';
import { findMinMax } from '../../internals/findMinMax';

export const getExtremumX: CartesianExtremumGetter<'line'> = (params) => {
  const { axis } = params;

  return findMinMax(axis.data ?? []);
};

type GetValues = (d: [number, number]) => [number, number];

function getSeriesExtremums(
  getValues: GetValues,
  data: readonly (number | null)[],
  stackedData: [number, number][],
  filter?: CartesianExtremumFilter,
): [number, number] {
  return stackedData.reduce<[number, number]>(
    (seriesAcc, stackedValue, index) => {
      if (data[index] === null) {
        return seriesAcc;
      }
      const [base, value] = getValues(stackedValue);
      if (
        filter &&
        (!filter({ y: base, x: null }, index) || !filter({ y: value, x: null }, index))
      ) {
        return seriesAcc;
      }

      return [Math.min(base, value, seriesAcc[0]), Math.max(base, value, seriesAcc[1])];
    },
    [Infinity, -Infinity],
  );
}

export const getExtremumY: CartesianExtremumGetter<'line'> = (params) => {
  const { series, axis, isDefaultAxis, getFilters } = params;

  return Object.keys(series)
    .filter((seriesId) => {
      const yAxisId = series[seriesId].yAxisId;
      return yAxisId === axis.id || (isDefaultAxis && yAxisId === undefined);
    })
    .reduce(
      (acc, seriesId) => {
        const { area, stackedData, data } = series[seriesId];
        const isArea = area !== undefined;

        const filter = getFilters?.({
          currentAxisId: axis.id,
          isDefaultAxis,
          seriesXAxisId: series[seriesId].xAxisId,
          seriesYAxisId: series[seriesId].yAxisId,
        });

        // Since this series is not used to display an area, we do not consider the base (the d[0]).
        const getValues: GetValues =
          isArea && axis.scaleType !== 'log' && typeof series[seriesId].baseline !== 'string'
            ? (d) => d
            : (d) => [d[1], d[1]];

        const seriesExtremums = getSeriesExtremums(getValues, data, stackedData, filter);

        const [seriesMin, seriesMax] = seriesExtremums;
        return [Math.min(seriesMin, acc[0]), Math.max(seriesMax, acc[1])];
      },
      [Infinity, -Infinity],
    );
};

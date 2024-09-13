import { createSelector, createSelectorMemoized } from '../../../utils/createSelector';
import { GridSortDirection, GridSortModel } from '../../../models/gridSortModel';
import { gridRowTreeSelector, gridRowsLookupSelector } from '../rows/gridRowsSelector';
import { GRID_ID_AUTOGENERATED, isAutogeneratedRowNode } from '../rows/gridRowsUtils';
import type { GridStateCommunity } from '../../../models/gridStateCommunity';
import type { GridValidRowModel, GridRowEntry } from '../../../models/gridRows';

/**
 * @category Sorting
 * @ignore - do not document.
 */
const gridSortingStateSelector = (state: GridStateCommunity) => state.sorting;

/**
 * Get the id of the rows after the sorting process.
 * @category Sorting
 */
export const gridSortedRowIdsSelector = createSelector(
  gridSortingStateSelector,
  (sortingState) => sortingState.sortedRows,
);

/**
 * Get the id and the model of the rows after the sorting process.
 * @category Sorting
 */
export const gridSortedRowEntriesSelector = createSelectorMemoized(
  gridSortedRowIdsSelector,
  gridRowsLookupSelector,
  gridRowTreeSelector,
  (sortedIds, idRowsLookup, rowTree) =>
    sortedIds.reduce<GridRowEntry<GridValidRowModel>[]>((acc, id) => {
      const model = idRowsLookup[id];
      if (model) {
        acc.push({ id, model });
      }
      const rowNode = rowTree[id];
      if (rowNode && isAutogeneratedRowNode(rowNode)) {
        acc.push({ id, model: { [GRID_ID_AUTOGENERATED]: id } });
      }
      return acc;
    }, [] as GridRowEntry<GridValidRowModel>[]),
);

/**
 * Get the current sorting model.
 * @category Sorting
 */
export const gridSortModelSelector = createSelector(
  gridSortingStateSelector,
  (sorting) => sorting.sortModel,
);

export type GridSortColumnLookup = Record<
  string,
  { sortDirection: GridSortDirection; sortIndex?: number }
>;

/**
 * @category Sorting
 * @ignore - do not document.
 */
export const gridSortColumnLookupSelector = createSelectorMemoized(
  gridSortModelSelector,
  (sortModel: GridSortModel) => {
    const result = sortModel.reduce<GridSortColumnLookup>((res, sortItem, index) => {
      res[sortItem.field] = {
        sortDirection: sortItem.sort,
        sortIndex: sortModel.length > 1 ? index + 1 : undefined,
      };
      return res;
    }, {});
    return result;
  },
);
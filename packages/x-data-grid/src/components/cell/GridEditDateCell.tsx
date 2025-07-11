'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { styled } from '@mui/material/styles';
import { NotRendered } from '../../utils/assert';
import { GridSlotProps } from '../../models/gridSlotsComponent';
import { GridRenderEditCellParams } from '../../models/params/gridCellParams';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';

type OwnerState = { classes: DataGridProcessedProps['classes'] };

const StyledInputBase = styled(NotRendered<GridSlotProps['baseInput']>)({
  fontSize: 'inherit',
});

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['editInputCell'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

export interface GridEditDateCellProps extends GridRenderEditCellParams {
  /**
   * Callback called when the value is changed by the user.
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * @param {Date | null} newValue The value that is going to be passed to `apiRef.current.setEditCellValue`.
   * @returns {Promise<void> | void} A promise to be awaited before calling `apiRef.current.setEditCellValue`
   */
  onValueChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: Date | null,
  ) => Promise<void> | void;
  slotProps?: {
    root?: Partial<GridSlotProps['baseInput']>;
  };
}

function GridEditDateCell(props: GridEditDateCellProps) {
  const {
    id,
    value: valueProp,
    formattedValue,
    api,
    field,
    row,
    rowNode,
    colDef,
    cellMode,
    isEditable,
    tabIndex,
    hasFocus,
    inputProps,
    isValidating,
    isProcessingProps,
    onValueChange,
    slotProps,
    ...other
  } = props;

  const isDateTime = colDef.type === 'dateTime';
  const apiRef = useGridApiContext();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const valueTransformed = React.useMemo(() => {
    let parsedDate: Date | null;

    if (valueProp == null) {
      parsedDate = null;
    } else if (valueProp instanceof Date) {
      parsedDate = valueProp;
    } else {
      parsedDate = new Date((valueProp ?? '').toString());
    }

    let formattedDate: string;
    if (parsedDate == null || Number.isNaN(parsedDate.getTime())) {
      formattedDate = '';
    } else {
      const localDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60 * 1000);
      formattedDate = localDate.toISOString().substr(0, isDateTime ? 16 : 10);
    }

    return {
      parsed: parsedDate,
      formatted: formattedDate,
    };
  }, [valueProp, isDateTime]);

  const [valueState, setValueState] = React.useState(valueTransformed);
  const rootProps = useGridRootProps();
  const ownerState = { classes: rootProps.classes };
  const classes = useUtilityClasses(ownerState);

  const parseValueToDate = React.useCallback((value: string) => {
    if (value === '') {
      return null;
    }

    const [date, time] = value.split('T');
    const [year, month, day] = date.split('-');

    const parsedDate = new Date();
    parsedDate.setFullYear(Number(year), Number(month) - 1, Number(day));
    parsedDate.setHours(0, 0, 0, 0);

    if (time) {
      const [hours, minutes] = time.split(':');
      parsedDate.setHours(Number(hours), Number(minutes), 0, 0);
    }

    return parsedDate;
  }, []);

  const handleChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const newFormattedDate = event.target.value;
      const newParsedDate = parseValueToDate(newFormattedDate);

      if (onValueChange) {
        await onValueChange(event, newParsedDate);
      }

      setValueState({ parsed: newParsedDate, formatted: newFormattedDate });
      apiRef.current.setEditCellValue({ id, field, value: newParsedDate }, event);
    },
    [apiRef, field, id, onValueChange, parseValueToDate],
  );

  React.useEffect(() => {
    setValueState((state) => {
      if (
        valueTransformed.parsed !== state.parsed &&
        valueTransformed.parsed?.getTime() !== state.parsed?.getTime()
      ) {
        return valueTransformed;
      }
      return state;
    });
  }, [valueTransformed]);

  useEnhancedEffect(() => {
    if (hasFocus) {
      inputRef.current!.focus();
    }
  }, [hasFocus]);
  return (
    <StyledInputBase
      as={rootProps.slots.baseInput}
      inputRef={inputRef}
      fullWidth
      className={classes.root}
      type={isDateTime ? 'datetime-local' : 'date'}
      value={valueState.formatted}
      onChange={handleChange}
      {...other}
      {...slotProps?.root}
      slotProps={{
        htmlInput: {
          max: isDateTime ? '9999-12-31T23:59' : '9999-12-31',
          ...slotProps?.root?.slotProps?.htmlInput,
        },
      }}
    />
  );
}

GridEditDateCell.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * GridApi that let you manipulate the grid.
   */
  api: PropTypes.object.isRequired,
  /**
   * The mode of the cell.
   */
  cellMode: PropTypes.oneOf(['edit', 'view']).isRequired,
  changeReason: PropTypes.oneOf(['debouncedSetEditCellValue', 'setEditCellValue']),
  /**
   * The column of the row that the current cell belongs to.
   */
  colDef: PropTypes.object.isRequired,
  /**
   * The column field of the cell that triggered the event.
   */
  field: PropTypes.string.isRequired,
  /**
   * The cell value formatted with the column valueFormatter.
   */
  formattedValue: PropTypes.any,
  /**
   * If true, the cell is the active element.
   */
  hasFocus: PropTypes.bool.isRequired,
  /**
   * The grid row id.
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  /**
   * If true, the cell is editable.
   */
  isEditable: PropTypes.bool,
  isProcessingProps: PropTypes.bool,
  isValidating: PropTypes.bool,
  /**
   * Callback called when the value is changed by the user.
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * @param {Date | null} newValue The value that is going to be passed to `apiRef.current.setEditCellValue`.
   * @returns {Promise<void> | void} A promise to be awaited before calling `apiRef.current.setEditCellValue`
   */
  onValueChange: PropTypes.func,
  /**
   * The row model of the row that the current cell belongs to.
   */
  row: PropTypes.any.isRequired,
  /**
   * The node of the row that the current cell belongs to.
   */
  rowNode: PropTypes.object.isRequired,
  slotProps: PropTypes.object,
  /**
   * the tabIndex value.
   */
  tabIndex: PropTypes.oneOf([-1, 0]).isRequired,
  /**
   * The cell value.
   * If the column has `valueGetter`, use `params.row` to directly access the fields.
   */
  value: PropTypes.any,
} as any;

export { GridEditDateCell };

export const renderEditDateCell = (params: GridRenderEditCellParams) => (
  <GridEditDateCell {...params} />
);

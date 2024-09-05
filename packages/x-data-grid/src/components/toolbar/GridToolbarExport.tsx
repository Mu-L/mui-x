import * as React from 'react';
import PropTypes from 'prop-types';
import { ButtonProps } from '@mui/material/Button';
import { TooltipProps } from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { GridCsvExportOptions, GridPrintExportOptions } from '../../models/gridExport';
import { GridToolbarExportContainer } from './GridToolbarExportContainer';

export interface GridExportDisplayOptions {
  /**
   * If `true`, this export option will be removed from the GridToolbarExport menu.
   * @default false
   */
  disableToolbarButton?: boolean;
}

export interface GridExportMenuItemProps<Options extends {}> {
  hideMenu?: () => void;
  options?: Options & GridExportDisplayOptions;
}

export type GridCsvExportMenuItemProps = GridExportMenuItemProps<GridCsvExportOptions>;

export type GridPrintExportMenuItemProps = GridExportMenuItemProps<GridPrintExportOptions>;

export interface GridToolbarExportProps {
  csvOptions?: GridCsvExportOptions & GridExportDisplayOptions;
  printOptions?: GridPrintExportOptions & GridExportDisplayOptions;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: { button?: Partial<ButtonProps>; tooltip?: Partial<TooltipProps> };
  [key: string]: any;
}

function GridCsvExportMenuItem(props: GridCsvExportMenuItemProps) {
  const apiRef = useGridApiContext();
  const { hideMenu, options, ...other } = props;

  return (
    <MenuItem
      onClick={() => {
        apiRef.current.exportDataAsCsv(options);
        hideMenu?.();
      }}
      {...other}
    >
      {apiRef.current.getLocaleText('toolbarExportCSV')}
    </MenuItem>
  );
}

GridCsvExportMenuItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  hideMenu: PropTypes.func,
  options: PropTypes.shape({
    allColumns: PropTypes.bool,
    delimiter: PropTypes.string,
    disableToolbarButton: PropTypes.bool,
    escapeFormulas: PropTypes.bool,
    fields: PropTypes.arrayOf(PropTypes.string),
    fileName: PropTypes.string,
    getRowsToExport: PropTypes.func,
    includeColumnGroupsHeaders: PropTypes.bool,
    includeHeaders: PropTypes.bool,
    shouldAppendQuotes: PropTypes.bool,
    utf8WithBom: PropTypes.bool,
  }),
} as any;

export { GridCsvExportMenuItem };

function GridPrintExportMenuItem(props: GridPrintExportMenuItemProps) {
  const apiRef = useGridApiContext();
  const { hideMenu, options, ...other } = props;

  return (
    <MenuItem
      onClick={() => {
        apiRef.current.exportDataAsPrint(options);
        hideMenu?.();
      }}
      {...other}
    >
      {apiRef.current.getLocaleText('toolbarExportPrint')}
    </MenuItem>
  );
}

GridPrintExportMenuItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  hideMenu: PropTypes.func,
  options: PropTypes.shape({
    allColumns: PropTypes.bool,
    bodyClassName: PropTypes.string,
    copyStyles: PropTypes.bool,
    disableToolbarButton: PropTypes.bool,
    fields: PropTypes.arrayOf(PropTypes.string),
    fileName: PropTypes.string,
    getRowsToExport: PropTypes.func,
    hideFooter: PropTypes.bool,
    hideToolbar: PropTypes.bool,
    includeCheckboxes: PropTypes.bool,
    pageStyle: PropTypes.oneOfType([
      PropTypes.shape({
        '__@hasInstance@645': PropTypes.func.isRequired,
        '__@metadata@647': PropTypes.any,
        apply: PropTypes.func.isRequired,
        arguments: PropTypes.any.isRequired,
        bind: PropTypes.func.isRequired,
        call: PropTypes.func.isRequired,
        caller: PropTypes.object.isRequired,
        length: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        prototype: PropTypes.any.isRequired,
        toString: PropTypes.func.isRequired,
      }),
      PropTypes.string,
    ]),
  }),
} as any;

export { GridPrintExportMenuItem };

const GridToolbarExport = React.forwardRef<HTMLButtonElement, GridToolbarExportProps>(
  function GridToolbarExport(props, ref) {
    const { csvOptions = {}, printOptions = {}, excelOptions, ...other } = props;

    const apiRef = useGridApiContext();

    const preProcessedButtons = apiRef.current
      .unstable_applyPipeProcessors('exportMenu', [], { excelOptions, csvOptions, printOptions })
      .sort((a, b) => (a.componentName > b.componentName ? 1 : -1));

    if (preProcessedButtons.length === 0) {
      return null;
    }

    return (
      <GridToolbarExportContainer {...other} ref={ref}>
        {preProcessedButtons.map((button, index) =>
          React.cloneElement(button.component, { key: index }),
        )}
      </GridToolbarExportContainer>
    );
  },
);

export { GridToolbarExport };

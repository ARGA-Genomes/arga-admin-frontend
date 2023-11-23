'use client';

import classes from "./TrackingSheet.module.css"

import { v4 as uuidv4 } from "uuid";
import { useEffect, useMemo, useState } from "react";
import { Button, Group, LoadingOverlay, Select, Stack } from "@mantine/core";

import { DataSheetGrid, Column, CellProps } from 'react-datasheet-grid'
import { Operation } from "react-datasheet-grid/dist/types";

import { useDatasetsQuery } from "@/services/admin";


type Choice = {
  label: string
  value: string
}

type SelectOptions = {
  choices: Choice[]
  placeholder?: string
  disabled?: boolean
}


function SheetSelect({ columnData, rowData, setRowData }: CellProps<string | null, SelectOptions>) {
  return (
    <Select
      className={classes.sheetSelect}
      placeholder={columnData.placeholder}
      data={columnData.choices}
      value={columnData.choices.find(({ value }) => value === rowData)?.value ?? null}
      onChange={setRowData}
    />
  );
}


function SheetDatasetSelect({ columnData, rowData, setRowData }: CellProps<string | null, SelectOptions>) {
  const { isFetching, data } = useDatasetsQuery();

  return (
    <Select
      className={classes.sheetSelect}
      placeholder={columnData.placeholder}
      data={data?.map(dataset => ({ label: dataset.name, value: dataset.id }))}
      value={data?.find(({ id }) => id === rowData)?.id ?? null}
      onChange={setRowData}
    />
  );
}


export const selectColumn = (options: SelectOptions): Column<string | null, SelectOptions> => ({
  component: SheetSelect,
  columnData: options,
  disableKeys: true,
  keepFocus: true,
  disabled: options.disabled,
  deleteValue: () => null,
  copyValue: ({ rowData }) =>
    options.choices.find((choice) => choice.value === rowData)?.label ?? null,
  pasteValue: ({ value }) =>
    options.choices.find((choice) => choice.label === value)?.value ?? null,
});

export const datasetColumn = (options: SelectOptions): Column<string | null, SelectOptions> => ({
  component: SheetDatasetSelect,
  columnData: options,
  disableKeys: true,
  keepFocus: true,
  disabled: options.disabled,
  deleteValue: () => null,
});


export interface TrackableRow {
  id: string,
}


function isDefined<T>(argument: T | undefined | null): argument is T {
    return argument !== undefined && argument !== null
}


interface TaxaSheetParams<Row extends TrackableRow> {
  data: Row[],
  columns: Column<Row>[],
  onCommit: (created: Row[], updated: Row[], deleted: Row[]) => Promise<void>,
  onCreateRow: () => Row,
  loading?: boolean,
}

export function TrackingSheet<Row extends TrackableRow>(props: TaxaSheetParams<Row>) {
  const { data, columns, onCommit, onCreateRow, loading } = props;

  const [rows, setRows] = useState<Row[]>(data)
  const [prevData, setPrevData] = useState(rows)
  const [commiting, setCommiting] = useState(false)

  useEffect(() => {
    if (!commiting) {
      setRows(data);
      setPrevData(data);
    }
  }, [data]);

  // tracked operations
  const createdRowIds = useMemo(() => new Set(), [])
  const updatedRowIds = useMemo(() => new Set(), [])
  const deletedRowIds = useMemo(() => new Set(), [])

  // track and process and changed data in the sheet
  const onDataChanged = (newValue: Row[], operations: Operation[]) => {
    for (const operation of operations) {
      const affected = newValue.slice(operation.fromRowIndex, operation.toRowIndex);

      if (operation.type === 'CREATE') {
        affected.forEach(row => createdRowIds.add(row.id));
      }

      if (operation.type === 'UPDATE') {
        affected.forEach(row => {
          // don't include redundant updates
          if (!createdRowIds.has(row.id) && !deletedRowIds.has(row.id)) {
            updatedRowIds.add(row.id);
          }
        });
      }

      if (operation.type === 'DELETE') {
        let kept = 0;
        rows.slice(operation.fromRowIndex, operation.toRowIndex).forEach((row, i) => {
          updatedRowIds.delete(row.id);

          if (createdRowIds.has(row.id)) {
            createdRowIds.delete(row.id);
          } else {
            deletedRowIds.add(row.id);

            // update the sheet data to reflect the deleted row
            newValue.splice(
              operation.fromRowIndex + kept++,
              0,
              rows[operation.fromRowIndex + i]
            );
          }
        })
      }
    }

    // update the store used in the sheet rendering
    setRows(newValue);
  };

  // undo all changes and clear all operations
  const cancel = () => {
    setRows(prevData)
    createdRowIds.clear()
    updatedRowIds.clear()
    deletedRowIds.clear()
  }

  const commit = async () => {
    setCommiting(true);
    const created = rows.filter(({ id }) => createdRowIds.has(id)).filter(isDefined)
    const updated = rows.filter(({ id }) => updatedRowIds.has(id)).filter(isDefined)
    const deleted = rows.filter(({ id }) => deletedRowIds.has(id)).filter(isDefined)

    // persist the changes
    await onCommit(created, updated, deleted);

    // 'reset' the grid with the latest changes
    const newData = rows.filter(({ id }) => !deletedRowIds.has(id))
    setRows(newData)
    setPrevData(newData)

    createdRowIds.clear()
    updatedRowIds.clear()
    deletedRowIds.clear()
    setCommiting(false)
  }


  return (
    <Stack>
      <LoadingOverlay visible={loading} />
      <DataSheetGrid
        value={rows}
        createRow={onCreateRow}
        duplicateRow={({ rowData }) => ({ ...rowData, id: uuidv4() })}
        columns={columns}
        onChange={onDataChanged}
        autoAddRow
        className={classes.dataSheet}
        rowClassName={({ rowData }) => {
          if (deletedRowIds.has(rowData.id)) return classes.rowDeleted;
          if (createdRowIds.has(rowData.id)) return classes.rowCreated;
          if (updatedRowIds.has(rowData.id)) return classes.rowUpdated;
        }}
      />

      <Group justify="end">
        <Button color="red" onClick={cancel}>Cancel</Button>
        <Button onClick={commit}>Save</Button>
      </Group>
    </Stack>
  )
}

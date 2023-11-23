'use client';

import { useEffect, useState } from "react";
import { Dataset, useDatasetsQuery } from "@/services/admin";
import { Grid, Loader, Paper, Select, TextInput} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";


export interface FilterItem {
  label: string,
  value: string,
}

type FilterProps = {
  onSearchChanged: (text: string) => void,
  onDatasetSelected: (filter: string) => void,
}

export function Filter(props: FilterProps) {
  const { isLoading, data } = useDatasetsQuery();
  const [datasets, setDatasets] = useState<FilterItem[]>([]);

  useEffect(() => {
    if (data) {
      const records = data.map((dataset: Dataset) => ({
        label: dataset.name,
        value: dataset.id,
      }));

      setDatasets(records);
    }
  }, [data, setDatasets]);

  const filterByDataset = (uuid: string | null) => {
    if (uuid) props.onDatasetSelected(uuid);
  }

  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 500);
  useEffect(() => props.onSearchChanged(debounced), [debounced, props]);

  return (
    <Paper p={20} my={20}>
      <Grid>
        <Grid.Col span={4}>
          <TextInput
            value={value}
            label="Search"
            placeholder="Search by scientific name"
            onChange={ev => setValue(ev.currentTarget.value)}
            rightSection={<IconSearch size={20} />}
            rightSectionWidth={50}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label="Datasets"
            placeholder="Filter by Dataset"
            data={datasets}
            searchable
            onChange={filterByDataset}
            rightSection={ isLoading ? <Loader variant="bars" /> : null }
            rightSectionWidth={100}
          />
        </Grid.Col>
      </Grid>
    </Paper>
  )
}

'use client';

import { useEffect, useState } from "react";
import { useUserTaxaListQuery } from "@/services/admin";
import { Grid, Loader, Paper, Select, TextInput} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";


export interface TaxaListFilter {
  source: string,
  uuid?: string,
}

export interface FilterItem {
  label: string,
  value: string,
  source: string,
}

type FilterProps = {
  onSearchChanged: (text: string) => void,
  onTaxaListSelected: (filter: TaxaListFilter) => void,
}

export function Filter(props: FilterProps) {
  const { isLoading, data } = useUserTaxaListQuery();
  const [sources, setSources] = useState<FilterItem[]>([]);

  useEffect(() => {
    if (data) {
      const records = data.records.map(list => ({
        label: list.name,
        value: list.id,
        source: 'user_taxa'
      }));

      const builtin = [{
        label: 'GBIF',
        value: 'gbif',
        source: 'gbif',
      }];

      setSources(builtin.concat(records));
    }
  }, [data, setSources]);

  const filterByTaxa = (val: string) => {
    if (val === 'gbif') {
      props.onTaxaListSelected({ source: 'gbif' });
    } else {
      props.onTaxaListSelected({ source: 'user_taxa', uuid: val });
    }
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
            label="Taxa List"
            placeholder="Filter by Taxa List"
            data={sources}
            searchable
            onChange={filterByTaxa}
            rightSection={ isLoading ? <Loader variant="bars" /> : null }
            rightSectionWidth={100}
          />
        </Grid.Col>
      </Grid>
    </Paper>
  )
}

'use client';

import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { Taxon, TaxonAttribute, useTaxaListQuery, useTaxonAttributesQuery, useUserTaxaListQuery } from "@/services/admin";
import { Box, Grid, Loader, Paper, Select, TextInput, Title, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";


const PAGE_SIZES = [10, 20, 50, 100];
const COLUMNS = [
  { noWrap: true, accessor: 'scientific_name', title: 'Scientific name' },
];


function isStringArray(value : any): value is string[]{
  return (value as string[]) !== undefined;
}

function attrValueToString(attr: TaxonAttribute): string {
  if (attr.data_type == 'Array' && isStringArray(attr.value)) {
    return attr.value.join(', ')
  }

  return typeof attr.value === 'string' ? attr.value : JSON.stringify(attr.value)
}


function AttributeRow({ name, value }: { name: string, value: string }) {
  return (
    <Grid>
      <Grid.Col span={2}>
        <Text fz="sm" fw={700}>{name}</Text>
      </Grid.Col>
      <Grid.Col span="auto">
        <Text fz="sm">{value}</Text>
      </Grid.Col>
    </Grid>
  )
}

function TaxonDetails({ taxon }: { taxon: Taxon }) {
  const { isFetching, data } = useTaxonAttributesQuery(taxon.id)

  return (
    <Paper p={20} radius="md">
      <Title order={3} mb={20}>{taxon.scientific_name || taxon.canonical_name}</Title>
      { taxon.scientific_name_authorship ? <AttributeRow name="Authorship" value={taxon.scientific_name_authorship} /> : null }
      { taxon.specific_epithet ? <AttributeRow name="Specific epithet" value={taxon.specific_epithet} /> : null }
      { taxon.taxon_rank ? <AttributeRow name="Rank" value={taxon.taxon_rank} /> : null }
      { taxon.taxonomic_status ? <AttributeRow name="Taxonomic status" value={taxon.taxonomic_status} /> : null }
      { taxon.name_according_to ? <AttributeRow name="According to" value={taxon.name_according_to} /> : null }
      { taxon.name_published_in ? <AttributeRow name="Published in" value={taxon.name_published_in} /> : null }
      { taxon.kingdom ? <AttributeRow name="Kingdom" value={taxon.kingdom} /> : null }
      { taxon.phylum ? <AttributeRow name="Phylum" value={taxon.phylum} /> : null }
      { taxon.class ? <AttributeRow name="Class" value={taxon.class} /> : null }
      { taxon.order ? <AttributeRow name="Order" value={taxon.order} /> : null }
      { taxon.family ? <AttributeRow name="Family" value={taxon.family} /> : null }
      { taxon.genus ? <AttributeRow name="Genus" value={taxon.genus} /> : null }
      {
        !data || isFetching ? "Loading attributes" : data.map(attr => (
          <AttributeRow key={attr.id} name={attr.name} value={attrValueToString(attr)} />
        ))
      }
    </Paper>
  )
}

function TaxaTable() {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [taxaList, setTaxaList] = useState<TaxaListFilter | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  useEffect(() => { setPage(1); }, [pageSize]);

  const [taxon, setTaxon] = useState<Taxon | undefined>(undefined);

  const { isFetching, data } = useTaxaListQuery({
    page,
    pageSize,
    search: search,
    source: taxaList?.source,
    taxaListsId: taxaList?.uuid,
  })

  return (
    <Box>
      <Filter
        onSearchChanged={setSearch}
        onTaxaListSelected={setTaxaList}
      />
      <Grid>
        <Grid.Col span={3}>
          <DataTable
            withBorder
            borderRadius="md"
            withColumnBorders
            minHeight={200}
            striped
            highlightOnHover
            records={data && data.records}
            columns={COLUMNS}
            fetching={isFetching}
            loaderVariant="bars"
            loaderSize="xl"
            loaderColor="green"
            totalRecords={data && data.total}
            recordsPerPage={pageSize}
            recordsPerPageOptions={PAGE_SIZES}
            page={page}
            onPageChange={(p) => setPage(p)}
            onRecordsPerPageChange={setPageSize}
            onRowClick={setTaxon}
          />
        </Grid.Col>
        <Grid.Col span="auto">
          { taxon ? <TaxonDetails taxon={taxon} /> : <Text>Select a taxon</Text> }
        </Grid.Col>
      </Grid>
    </Box>
  );
}


interface TaxaListFilter {
  source: string,
  uuid?: string,
}

interface FilterItem {
  label: string,
  value: string,
  source: string,
}

type FilterProps = {
  onSearchChanged: (text: string) => void,
  onTaxaListSelected: (filter: TaxaListFilter) => void,
}

function Filter(props: FilterProps) {
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


export default function TaxaList() {
  return (
    <Box>
      <Title mt={20}>Global Names List</Title>
      <TaxaTable />
    </Box>
  )
}

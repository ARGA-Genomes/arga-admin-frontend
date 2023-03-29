'use client';

import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useTaxaListQuery, useUserTaxaListQuery } from "@/services/admin";
import { Box, Grid, Loader, Paper, Select, TextInput, Title } from "@mantine/core";


const PAGE_SIZES = [10, 20, 50, 100];
const COLUMNS = [
  { noWrap: true, accessor: 'scientific_name', title: 'Scientific name' },
  { noWrap: true, accessor: 'scientific_name_authorship', title: 'Authorship' },
  { noWrap: true, accessor: 'canonical_name', title: 'Canonical name' },
  { noWrap: true, accessor: 'specific_epithet', title: 'Specific epithet' },
  { noWrap: true, accessor: 'intraspecific_epithet', title: 'Intraspecific epithet' },
  { noWrap: true, accessor: 'taxon_rank', title: 'Taxon rank' },
  { noWrap: true, accessor: 'name_according_to', title: 'Name according to' },
  { noWrap: true, accessor: 'name_published_in', title: 'Name published in' },
  { noWrap: true, accessor: 'taxonomic_status', title: 'Taxonomic status' },
  { noWrap: true, accessor: 'kingdom', title: 'Kingdom' },
  { noWrap: true, accessor: 'phylum', title: 'Phylum' },
  { noWrap: true, accessor: 'class', title: 'Class' },
  { noWrap: true, accessor: 'order', title: 'Order' },
  { noWrap: true, accessor: 'family', title: 'Family' },
  { noWrap: true, accessor: 'genus', title: 'Genus' },
  { noWrap: true, accessor: 'source', title: 'Source' },
];


interface TaxaListFilter {
  source: string,
  uuid?: string,
}

function TaxaTable() {
  const [taxaList, setTaxaList] = useState<TaxaListFilter | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  useEffect(() => { setPage(1); }, [pageSize]);

  const { isFetching, data } = useTaxaListQuery({
    page,
    pageSize,
    source: taxaList?.source,
    taxaListsId: taxaList?.uuid,
  })

  return (
    <Box>
      <Filter onTaxaListSelected={setTaxaList} />
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
      />
    </Box>
  );
}


interface FilterItem {
  label: string,
  value: string,
  source: string,
}

type FilterProps = {
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

  return (
    <Paper p={20} my={20}>
      <Grid>
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

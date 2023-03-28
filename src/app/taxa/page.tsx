'use client';

import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useTaxaListQuery } from "@/services/admin";
import { Box, Title } from "@mantine/core";


const PAGE_SIZES = [10, 20, 50, 100];
const COLUMNS = [
  { noWrap: true, accessor: 'scientific_name', title: 'Scientific name' },
  { noWrap: true, accessor: 'scientific_name_authorship', title: 'Authorship' },
  { noWrap: true, accessor: 'canonical_name', title: 'Canonical name' },
  { noWrap: true, accessor: 'generic_name', title: 'Generic name' },
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
];


function TaxaTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  useEffect(() => { setPage(1); }, [pageSize]);

  const { isFetching, data } = useTaxaListQuery({ page, pageSize })

  return (
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
  );
}


export default function TaxaList() {
  return (
    <Box>
      <Title p={20}>GBIF Taxa</Title>
      <TaxaTable />
    </Box>
  )
}

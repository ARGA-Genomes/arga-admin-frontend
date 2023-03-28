'use client';

import { DataTable, DataTableColumnTextAlignment } from "mantine-datatable";
import { useEffect, useState } from "react";
import { Box, Button, Grid, Title, Text, Group, ActionIcon, Notification, Affix, Alert, LoadingOverlay } from "@mantine/core";
import { IconAlertCircle, IconEdit, IconPlaylistAdd, IconTrash, IconX } from "@tabler/icons-react";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import Link from "next/link";

import { UserTaxa, UserTaxon, useDeleteUserTaxonMutation, useGetUserTaxaQuery, useUserTaxaItemsQuery } from "@/services/admin";
import { TableProvider, useTable } from "@/table_provider";
import { RequestErrorText, getErrorMessage } from "@/components/request-error";


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
  {
    accessor: 'actions',
    title: <Text mr="xs">Actions</Text>,
    textAlignment: 'right' as DataTableColumnTextAlignment,
    render: (record: UserTaxon) => <Actions record={record} />,
  }
];




function Actions({ record }: { record: UserTaxon }) {
  const { setIsDeleting, setError } = useTable();
  const [deleteUserTaxon, { isLoading, error }] = useDeleteUserTaxonMutation();

  useEffect(() => { setIsDeleting(isLoading) }, [isLoading, setIsDeleting]);
  useEffect(() => { setError(getErrorMessage(error)) }, [error, setError]);

  return (
    <Group spacing={4} position="right" noWrap>
      <Link href={`/user_taxa/${record.taxa_lists_id}/edit/${record.id}`}>
        <ActionIcon color="blue">
          <IconEdit size={16} />
        </ActionIcon>
      </Link>
      <ActionIcon color="red" onClick={() => deleteUserTaxon(record)}>
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  )
}


function Table({ userTaxa }: { userTaxa: UserTaxa }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  useEffect(() => { setPage(1); }, [pageSize]);

  const [bodyRef] = useAutoAnimate();
  const { isDeleting, setError } = useTable();
  const { isFetching, data, error } = useUserTaxaItemsQuery(userTaxa)

  useEffect(() => { setError(getErrorMessage(error)) }, [error, setError]);

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
      fetching={isFetching || isDeleting}
      loaderVariant="bars"
      loaderSize="xl"
      loaderColor={isDeleting ? "red" : "green"}
      totalRecords={data && data.total}
      recordsPerPage={pageSize}
      recordsPerPageOptions={PAGE_SIZES}
      page={page}
      onPageChange={(p) => setPage(p)}
      onRecordsPerPageChange={setPageSize}
      bodyRef={bodyRef}
    />
  );
}


function UserTaxa({ userTaxa }: { userTaxa: UserTaxa }) {
  const { error, setError } = useTable();
  const [parent] = useAutoAnimate();

  return (
    <Box>
      <Grid align="center" grow>
        <Grid.Col span="auto">
          <Title p={20}>{userTaxa.name}</Title>
        </Grid.Col>
        <Grid.Col span="content">
          <Link href={`/user_taxa/${userTaxa.id}/new`}>
            <Button leftIcon={<IconPlaylistAdd />}>New Taxon</Button>
          </Link>
        </Grid.Col>
      </Grid>

      <Table userTaxa={userTaxa} />

      <Affix>
        <ul ref={parent}>
          { error &&
            <Notification
              icon={<IconX size="1.1rem" />}
              radius="md"
              color="red"
              title="Request failed"
              onClose={() => setError(undefined)}
            >
              {error}
            </Notification>
          }
        </ul>
      </Affix>
    </Box>
  )
}

export default function Page({ params }: { params: { uuid: string } }) {
  const { isFetching, isSuccess, isError, error, data } = useGetUserTaxaQuery(params.uuid);

  return (
    <Box>
      {isError && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Loading failed!" color="red" radius="lg">
          <Text>The request failed to load the user taxa list for the following reason:</Text>
           <RequestErrorText error={error} />
        </Alert>
      )}

      <Box w="auto" p={40} pos="relative" mx="auto">
        <LoadingOverlay
          visible={isFetching}
          overlayBlur={2}
          loaderProps={{ size: 'xl', color: 'green', variant: 'bars' }}
        />
        <TableProvider>
          {isSuccess && <UserTaxa userTaxa={data} />}
        </TableProvider>
      </Box>
    </Box>
  )
}

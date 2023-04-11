'use client';

import { DataTable, DataTableColumnTextAlignment } from "mantine-datatable";
import { useEffect, useState } from "react";
import { Box, Button, Grid, Title, Text, Group, ActionIcon, Notification, Affix } from "@mantine/core";
import { IconEdit, IconEye, IconPlaylistAdd, IconTrash, IconX } from "@tabler/icons-react";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import Link from "next/link";

import { Attribute, useDeleteAttributeMutation, useAttributeListQuery } from "@/services/admin";
import { TableProvider, useTable } from "@/table_provider";
import { getErrorMessage } from "@/components/request-error";


const PAGE_SIZES = [10, 20, 50, 100];
const COLUMNS = [
  { accessor: 'name', title: 'Name', noWrap: true },
  { accessor: 'data_type', title: 'Type', noWrap: true },
  { accessor: 'reference_url', title: 'Reference URL' },
  { accessor: 'description', title: 'Description' },
  {
    accessor: 'actions',
    title: <Text mr="xs">Actions</Text>,
    textAlignment: 'right' as DataTableColumnTextAlignment,
    render: (record: Attribute) => <Actions record={record} />,
  }
];


function Actions({ record }: { record: Attribute }) {
  const { setIsDeleting, setError } = useTable();
  const [deleteAttribute, { isLoading, error }] = useDeleteAttributeMutation();

  useEffect(() => { setIsDeleting(isLoading) }, [isLoading, setIsDeleting]);
  useEffect(() => { setError(getErrorMessage(error)) }, [error, setError]);

  return (
    <Group spacing={4} position="right" noWrap>
      <Link href={`/attributes/edit/${record.id}`}>
        <ActionIcon color="blue">
          <IconEdit size={16} />
        </ActionIcon>
      </Link>
      <ActionIcon color="red" onClick={() => deleteAttribute(record)}>
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  )
}


function Table() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  useEffect(() => { setPage(1); }, [pageSize]);

  const [bodyRef] = useAutoAnimate();
  const { isDeleting } = useTable();
  const { isFetching, data } = useAttributeListQuery()

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


function AttributeList() {
  const { error, setError } = useTable();
  const [parent] = useAutoAnimate();

  return (
    <Box>
      <Grid align="center" grow>
        <Grid.Col span="auto">
          <Title p={20}>Attribute List</Title>
        </Grid.Col>
        <Grid.Col span="content">
          <Group position="right" spacing="xl">
            <Link href="/attributes/new">
              <Button leftIcon={<IconPlaylistAdd />}>New Attribute</Button>
            </Link>
          </Group>
        </Grid.Col>
      </Grid>

      <Table />

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

export default function Page() {
  return (
    <TableProvider>
      <AttributeList />
    </TableProvider>
  )
}

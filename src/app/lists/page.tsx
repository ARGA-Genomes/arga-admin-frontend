'use client';

import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { NameList, useNameListQuery } from "@/services/admin";
import { Box, Grid, Paper, Title, Text, Affix, Group, Button, Notification } from "@mantine/core";
import { TableProvider, useTable } from "@/table_provider";
import { IconTableImport, IconX } from "@tabler/icons-react";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import Link from "next/link";


const COLUMNS = [
  { noWrap: true, accessor: 'name', title: 'Name' },
];


function ListDetails({ list }: { list: NameList }) {
    /* const { isFetching, data } = useTaxonAttributesQuery(taxon.id) */

  return (
    <Paper p={20} radius="md">
      <Title order={3} mb={20}>{list.name}</Title>
      <Text>{list.description}</Text>
    </Paper>
  )
}

function ListTable() {
  const [list, setList] = useState<NameList | undefined>(undefined);
  const { isFetching, data } = useNameListQuery()

  return (
    <Box>
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
            onRowClick={setList}
          />
        </Grid.Col>
        <Grid.Col span="auto">
          { list ? <ListDetails list={list} /> : <Text>Select a list</Text> }
        </Grid.Col>
      </Grid>
    </Box>
  );
}


function List() {
  const { error, setError } = useTable();
  const [parent] = useAutoAnimate();

  return (
    <Box>
      <Grid align="center" grow>
        <Grid.Col span="auto">
          <Title p={20}>Name Lists</Title>
        </Grid.Col>
        <Grid.Col span="content">
          <Group position="right" spacing="xl">
            <Link href="/lists/import">
              <Button variant="outline" leftIcon={<IconTableImport />}>Import List</Button>
            </Link>
          </Group>
        </Grid.Col>
      </Grid>

      <ListTable />

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
      <List />
    </TableProvider>
  )
}

'use client';

import { Filter, TaxaListFilter } from "@/components/taxa-filter";
import { Media, Taxon, useMediaListQuery, useTaxaListQuery } from "@/services/admin";
import { Box, Container, Grid, Image, Title, Text, Skeleton, Card, SimpleGrid, Divider, Group } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import Link from "next/link";
import { useEffect, useState } from "react";


const PAGE_SIZES = [10, 20, 50, 100];
const COLUMNS = [
  { noWrap: true, accessor: 'scientific_name', title: 'Scientific name' },
];


function Layout() {
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
          { taxon ? <MediaEditor taxon={taxon} /> : null }
        </Grid.Col>
    </Grid>

    </Box>
  )
}

function MediaEditor({ taxon }: { taxon: Taxon }) {
  if (!taxon.canonical_name) {
    return <Text>The taxon must have a canonical name before it can search for media files</Text>
  }

  const { isFetching, data } = useMediaListQuery(taxon.canonical_name);

  return (
    <Container>
      <Skeleton visible={isFetching}>
        { data ? <MediaSelector taxon={taxon} media={data} /> : null }
      </Skeleton>
    </Container>
  )
}

function MediaSelector({ taxon, media }: { taxon: Taxon, media: Media[] }) {
  if (media.length == 0) {
    return <Text>No media images found</Text>
  }

  const [selected, setSelected] = useState(media[0])

  const large = (identifier: string) => {
    return identifier.replace("original", "medium");
  }

  return (
    <Card withBorder shadow="sm" radius="md">
      <Title order={4}>{taxon.canonical_name}</Title>
      <Group>
        <Text mt="sm" color="dimmed" size="sm">
          &copy; {selected.rights_holder} {selected.license}
        </Text>
        <Divider size="xs" orientation="vertical" />
        <Text mt="sm" color="dimmed" size="sm">
          <Link href={selected.references || "#"} target="_blank">{selected.publisher}</Link>
        </Text>
      </Group>

      <Card.Section mt="sm">
        <Image
          src={large(selected.identifier || '')}
          radius="sm"
          height={500}
          fit="contain"
        />
      </Card.Section>

      <Card.Section inheritPadding mt="sm" pb="md">
        <SimpleGrid cols={10}>
          {media.map((image) => <ImageLink media={image} onSelected={setSelected} key={image.id}  />)}
        </SimpleGrid>
      </Card.Section>
    </Card>
  )
}

interface ImageLinkProps {
  media: Media,
  onSelected: (media: Media) => void,
}

function ImageLink(props: ImageLinkProps) {
  if (!props.media.identifier) return null

  const thumb = (identifier: string) => {
    return identifier.replace("original", "square");
  }

  return (
    <Link href="#" onClick={(ev) => { ev.preventDefault(); props.onSelected(props.media) }}>
      <Image src={thumb(props.media.identifier)} radius="sm" />
    </Link>
  )
}


export default function MediaPage() {
  return (
    <Box>
      <Title mt={20}>Taxa Media</Title>
      <Layout />
    </Box>
  )
}

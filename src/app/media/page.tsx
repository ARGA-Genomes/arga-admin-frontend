'use client';

import { Filter, TaxaListFilter } from "@/components/taxa-filter";
import { Media, Taxon, useMainMediaQuery, useMediaListQuery, useSetMainMediaMutation, useTaxaListQuery } from "@/services/admin";
import { Box, Grid, Image, Title, Text, Card, Divider, Group, Stack, Button, Indicator, Loader, LoadingOverlay } from "@mantine/core";
import { IconPinned } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { getImageSize } from 'react-image-size';
import PhotoAlbum from "react-photo-album";
import InfiniteScroll from 'react-infinite-scroller';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useListState } from "@mantine/hooks";


const COLUMNS = [
  { noWrap: true, accessor: 'scientific_name', title: 'Scientific name' },
];

interface Photo {
  src: string,
  width: number,
  height: number,
  key: string,
  media: Media,
}




function Layout() {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [taxaList, setTaxaList] = useState<TaxaListFilter | null>(null);
  const [page, setPage] = useState(1);

  const [taxon, setTaxon] = useState<Taxon | undefined>(undefined);
  const [records, handlers] = useListState<Taxon>([]);

  useEffect(() => {
    handlers.setState([])
    setPage(1)
  }, [search, taxaList])

  const { isFetching, isSuccess, data } = useTaxaListQuery({
    page,
    pageSize: 100,
    search: search,
    source: taxaList?.source,
    taxaListsId: taxaList?.uuid,
  })

  useEffect(() => {
    if (!isFetching && isSuccess && data) {
      for (const record of data.records) {
        handlers.append(record);
      }
    }
  }, [data, isFetching, isSuccess])

  const loadMoreRecords = () => {
    if (!isFetching && data?.total && data.total > records.length) {
      setPage(page + 1);
    }
  };

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
            height={800}
            striped
            highlightOnHover
            records={records}
            columns={COLUMNS}
            fetching={isFetching}
            loaderVariant="bars"
            loaderSize="xl"
            loaderColor="green"
            totalRecords={data && data.total}
            onRowClick={setTaxon}
            onScrollToBottom={loadMoreRecords}
          />
        </Grid.Col>
        <Grid.Col span="auto">
          { taxon ? <MediaEditor taxon={taxon} key={taxon.id} /> : null }
        </Grid.Col>
    </Grid>

    </Box>
  )
}

function MediaEditor({ taxon }: { taxon: Taxon }) {
  const [curated, setCurated] = useState<Media | undefined>(undefined)
  const [selected, setSelected] = useState<Media | undefined>(undefined)

  const large = (identifier: string) => {
    return identifier.replace("original", "medium");
  }

  const { data, isLoading } = useMainMediaQuery(taxon.canonical_name || '')
  useEffect(() => {
    setCurated(data)
    setSelected(data)
  }, [data])


  const [mut, mutResult] = useSetMainMediaMutation()

  const setMainMedia = () => {
    if (selected && taxon.canonical_name) {
      mut({ media_uuid: selected.id, species: taxon.canonical_name });
    }
  }


  return (
    <Card withBorder shadow="sm" radius="md">
    <LoadingOverlay visible={isLoading}/>
      <Group position="apart">
        <Stack spacing="xs" align="flex-start" justify="flex-start">
          <Title order={4}>{taxon.canonical_name}</Title>
          { selected ?
          <Group>
            <Text color="dimmed" size="sm">&copy; {selected.rights_holder} {selected.license}</Text>
            <Divider size="xs" orientation="vertical" />
            <Text color="dimmed" size="sm">
              <Link href={selected.references || "#"} target="_blank">{selected.publisher}</Link>
            </Text>
          </Group>
          : null }
        </Stack>
        { selected ?
        <Button onClick={setMainMedia} loading={mutResult.isLoading}>Set as main</Button>
        : null }
      </Group>

      <Card.Section mt="sm">
        { selected ?
        <Image
          src={large(selected.identifier || '')}
          radius="sm"
          height={500}
          fit="contain"
          alt="Selected image"
        />
        :
        <Text align="center">No media images found</Text>
        }
      </Card.Section>

      <Card.Section inheritPadding mt="sm" pb="md">
        <MediaGallery
          taxon={taxon}
          key={taxon.id}
          mainMedia={curated}
          onSelected={(photo) => setSelected(photo.media)}
        />
      </Card.Section>
    </Card>
  )
}


interface MediaGalleryProps {
  taxon: Taxon,
  mainMedia?: Media,
  onSelected: (photo: Photo) => void,
}

function MediaGallery(props: MediaGalleryProps) {
  const { taxon, onSelected } = props;

  const [page, setPage] = useState(1)
  const { isFetching, data } = useMediaListQuery({
    scientificName: taxon.canonical_name || '',
    page: page,
    pageSize: 5,
  });

  const [gallery, handlers] = useListState<Photo[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    if (!data) return;

    let promises = data.records.map(async media => {
      const url = media.identifier?.replace("original", "small") || '';
      const dimensions = await getImageSize(url)
      return {
        src: url,
        key: url,
        width: dimensions.width,
        height: dimensions.height,
        media: media,
      };
    });

    Promise.all(promises).then((photos) => {
      handlers.append(photos)
      setLoaded(loaded + photos.length)
      setHasMore(loaded < data.total)
      setCanLoadMore(true)
    });
  }, [data, loaded])

  function loadMedia(page: number) {
    if (!isFetching && hasMore && setCanLoadMore) {
      setCanLoadMore(false)
      setPage(page)
    }
  }


  return (
    <Box>
      <InfiniteScroll
        pageStart={1}
        loadMore={loadMedia}
        hasMore={!isFetching && hasMore && canLoadMore}
        loader={(
          <Box key={taxon.id}>
            <Loader size="xl" variant="bars" />
          </Box>
        )}
      >
        { gallery.map((photos, index) => (
          <PhotoAlbum
            key={`${taxon.id}-${index}`}
            layout="rows"
            photos={photos}
            spacing={5}
            targetRowHeight={200}
            componentsProps={{ containerProps: { style: { paddingBottom: 5 } } }}
            onClick={({ photo }) => onSelected(photo)}
            renderPhoto={({ photo, wrapperStyle, renderDefaultPhoto }) => (
              <div style={{ position: "relative", ...wrapperStyle }}>
                <PhotoPreview photo={photo} showPin={props.mainMedia?.id == photo.media.id} >
                  {renderDefaultPhoto({ wrapped: true })}
                </PhotoPreview>
              </div>
            )}
          />
        ))}
      </InfiniteScroll>
    </Box>
  )
}

interface PhotoPreviewProps {
  photo: Photo,
  showPin: boolean,
  children: React.ReactNode,
}

function PhotoPreview(props: PhotoPreviewProps) {
  return (
    <Indicator
      color="green"
      position="top-center"
      size={30}
      label={<IconPinned/>}
      disabled={!props.showPin}
    >
      { props.children }
    </Indicator>
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

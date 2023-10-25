'use client';

import { Filter } from "@/components/taxa-filter";
import { Taxon, UploadMainMedia, useMainMediaQuery, useMediaListQuery, useSetMainMediaMutation, useTaxaQuery, useUploadMainMediaMutation } from "@/services/admin";
import { Box, Grid, Image, Title, Text, Divider, Group, Stack, Button, Indicator, Loader, LoadingOverlay, Center, Modal, Alert, TextInput, Select, Tabs, Paper } from "@mantine/core";
import { IconAlertCircle, IconDeviceFloppy, IconPinned } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { getImageSize } from 'react-image-size';
import PhotoAlbum from "react-photo-album";
import InfiniteScroll from 'react-infinite-scroller';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDisclosure, useListState } from "@mantine/hooks";
import { usePhotoListQuery } from "@/services/inaturalist";

import { FilePond } from 'react-filepond'
import { FilePondFile } from 'filepond'
import 'filepond/dist/filepond.min.css'
import { FormErrors, isNotEmpty, useForm } from "@mantine/form";
import { RequestErrorText } from "@/components/request-error";


const SERVER_CONFIG = {
  url: process.env.NEXT_PUBLIC_ARGA_API_URL,
  process: {
    url: '/media/upload',
    withCredentials: true,
  },
  revert: null,
  restore: null,
  load: null,
  fetch: null,
};


const COLUMNS = [
  { noWrap: true, accessor: 'scientific_name', title: 'Scientific name' },
];

interface Photo {
  src: string,
  width: number,
  height: number,
  key: string,
  license?: string,
  rights_holder?: string,
  publisher?: string,
  creator?: string,
  reference_url?: string,
  source?: string,
}


function Layout() {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [dataset, setDataset] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const [taxon, setTaxon] = useState<Taxon | undefined>(undefined);
  const [records, handlers] = useListState<Taxon>([]);

  useEffect(() => {
    handlers.setState([])
    setPage(1)
  }, [search, dataset])

  const { isFetching, isSuccess, data } = useTaxaQuery({
    page,
    pageSize: 100,
    search: search,
    datasetId: dataset,
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
        onDatasetSelected={setDataset}
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

function extractRightsHolder(attribution?: string) {
  if (!attribution) return "";

  attribution = attribution.replaceAll("(c)", "")
  const idx = attribution.indexOf(", some rights reserved");
  if (idx > 0) attribution = attribution.substring(0, idx);

  return attribution;
}

function MediaEditor({ taxon }: { taxon: Taxon }) {
  const [curated, setCurated] = useState<Photo | undefined>(undefined)
  const [selected, setSelected] = useState<Photo | undefined>(undefined)

  const large = (identifier: string) => {
    return identifier.replace("original", "medium");
  }

  const { data, isLoading } = useMainMediaQuery(taxon.scientific_name || '')
  useEffect(() => {
    if (data) {
      const photo = {
        id: 0,
        src: data.url,
        width: 0,
        height: 0,
        key: data.id,
        license: data.license,
        rights_holder: data.rights_holder,
        publisher: data.publisher,
        source: data.source,
      };
      setCurated(photo)
      setSelected(photo)
    } else {
      setCurated(undefined)
      setSelected(undefined)
    }
  }, [data])


  const [mut, mutResult] = useSetMainMediaMutation()

  const setMainMedia = () => {
    if (selected && taxon.canonical_name) {
      mut({
        url: selected.src.replaceAll("small", "original"),
        scientific_name: taxon.scientific_name || '',
        publisher: selected.publisher || "",
        rights_holder: extractRightsHolder(selected.rights_holder),
        license: selected.license || "",
        source: selected.reference_url || "",
      });
    }
  }

  const [opened, { open, close }] = useDisclosure(false);


  return (
    <Paper withBorder shadow="sm" radius="md" p="lg">
      <LoadingOverlay visible={isLoading}/>
      <Modal opened={opened} onClose={close} title="Upload custom image">
        <ImageUpload scientificName={taxon.scientific_name || ''} onUploaded={() => close()} />
      </Modal>

      <Group position="apart">
        <Stack spacing="xs" align="flex-start" justify="flex-start">
          <Title order={4}>{taxon.canonical_name}</Title>
          { selected ?
          <Group>
            <Text color="dimmed" size="sm">&copy; {extractRightsHolder(selected.rights_holder)} ({selected.license})</Text>
            <Divider size="xs" orientation="vertical" />
            <Text color="dimmed" size="sm">
              <Link href={selected.reference_url || selected.src} target="_blank">{selected.publisher}</Link>
            </Text>
          </Group>
          : null }
        </Stack>

        <Group>
          { selected ? <Button onClick={setMainMedia} loading={mutResult.isLoading}>Set as main</Button> : null }
          <Button onClick={open}>Upload image</Button>
        </Group>
      </Group>

      <Box my="lg">
        { selected ?
        <Image
          src={large(selected.src.replaceAll("small", "medium") || '')}
          radius="sm"
          height={500}
          fit="contain"
          alt="Selected image"
        />
        : null
        }
      </Box>

      <Box my="lg">
        <Tabs defaultValue="vic_museum">
          <Tabs.List>
            <Tabs.Tab value="vic_museum">Vic Museum</Tabs.Tab>
            <Tabs.Tab value="inaturalist">iNaturalist</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="vic_museum">
            <MediaGallery
              taxon={taxon}
              key={taxon.id}
              mainMedia={curated}
              onSelected={(photo) => setSelected(photo)}
            />
          </Tabs.Panel>

          <Tabs.Panel value="inaturalist">
            <INaturalistMediaGallery
              taxon={taxon}
              key={taxon.id}
              mainMedia={curated}
              onSelected={(photo) => setSelected(photo)}
            />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Paper>
  )
}


interface MediaGalleryProps {
  taxon: Taxon,
  mainMedia?: Photo,
  onSelected: (photo: Photo) => void,
}

function MediaGallery(props: MediaGalleryProps) {
  const { taxon, onSelected } = props;

  const [page, setPage] = useState(1)

  const { isFetching, data } = useMediaListQuery({
    scientificName: taxon.scientific_name || '',
    page: page,
    pageSize: 10,
  });

  const [gallery, handlers] = useListState<Photo[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [loaded, setLoaded] = useState(0);

  function loadMedia(page: number) {
    if (!isFetching && hasMore && setCanLoadMore) {
      setCanLoadMore(false)
      setShowLoading(true)
      setPage(page)
    }
  }

  useEffect(() => {
    if (!data) return;

    let photos = data.records.map(media => {
      return {
        src: media.url,
        key: media.id,
        width: media.width || 100,
        height: media.height || 100,
        reference_url: media.reference_url,
        source: media.source,
        creator: media.creator,
        publisher: media.publisher,
        license: media.license,
        rights_holder: media.rights_holder,
      }
    });

    handlers.append(photos);
    setLoaded(loaded + photos.length)
    setHasMore(loaded < data.total)
    setCanLoadMore(true)
    setShowLoading(false)
  }, [data]);

  return (
    <Box>
      { data && data.total === 0 && loaded === 0 ? <Text>No media images found</Text> : null }

      <InfiniteScroll pageStart={1} loadMore={loadMedia} hasMore={!isFetching && hasMore && canLoadMore}>
        { gallery?.map((photos, index) => (
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
                <PhotoPreview photo={photo} showPin={props.mainMedia?.src == photo.src} >
                  {renderDefaultPhoto({ wrapped: true })}
                </PhotoPreview>
              </div>
            )}
          />
        ))}
      </InfiniteScroll>

      <Box key={taxon.id}>
        <Center>
          { (!data || isFetching || showLoading) ? <Loader size="xl" variant="bars" /> : null }
        </Center>
      </Box>
    </Box>
  )
}


interface INaturalistMediaGalleryProps {
  taxon: Taxon,
  mainMedia?: Photo,
  onSelected: (photo: Photo) => void,
}

function INaturalistMediaGallery(props: INaturalistMediaGalleryProps) {
  const { taxon, onSelected } = props;

  const [page, setPage] = useState(1)

  const { isFetching, data } = usePhotoListQuery({
    scientificName: taxon.canonical_name || '',
    page: page,
    pageSize: 10,
  });

  const [gallery, handlers] = useListState<Photo[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    if (!data) return;

    let all = data.results.map(observation => {
      return observation.photos.map(media => {return {
        id: media.id,
        license_code: media.license_code,
        url: media.url.replace("square", "small") || '',
        attribution: media.attribution,
        source: observation.uri,
      }})
    }).flat();

    let promises = all.map(async media => {
      const dimensions = await getImageSize(media.url)
      return {
        src: media.url,
        key: media.url,
        width: dimensions.width,
        height: dimensions.height,
        license: media.license_code,
        rights_holder: media.attribution,
        reference_url: media.source,
      };
    });

    Promise.all(promises).then((photos) => {
      handlers.append(photos)
      setLoaded(loaded + photos.length)
      setHasMore(loaded < data.total_results)
      setCanLoadMore(true)
      setShowLoading(false)
    });
  }, [data])

  function loadMedia(page: number) {
    if (!isFetching && hasMore && setCanLoadMore) {
      setCanLoadMore(false)
      setShowLoading(true)
      setPage(page)
    }
  }


  return (
    <Box>
      { data && data.total_results == 0 ? <Text>No media images found</Text> : null }

      <InfiniteScroll pageStart={1} loadMore={loadMedia} hasMore={!isFetching && hasMore && canLoadMore}>
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
                <PhotoPreview photo={photo} showPin={props.mainMedia?.src == photo.src} >
                  {renderDefaultPhoto({ wrapped: true })}
                </PhotoPreview>
              </div>
            )}
          />
        ))}
      </InfiniteScroll>

      <Box key={taxon.id}>
        <Center>
          { (!data || isFetching || showLoading) ? <Loader size="xl" variant="bars" /> : null }
        </Center>
      </Box>
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


interface ImageUploadProps {
  scientificName: string,
  onUploaded: () => void,
}

function ImageUpload({ scientificName, onUploaded }: ImageUploadProps) {
  const [newMedia, { isLoading, isSuccess, isError, data, error }] = useUploadMainMediaMutation();

  useEffect(() => {
    if (isSuccess) onUploaded();
  }, [data, isSuccess]);

  const form = useForm({
    initialValues: {
      file: '',
      publisher: '',
      rights_holder: '',
      license: '',
      source: undefined,
      scientific_name: scientificName,
    } as UploadMainMedia,

    validate: {
      publisher: isNotEmpty('Enter a publisher for the image. eg. "iNaturalist"'),
      rights_holder: isNotEmpty('Enter a rights holder for the image. eg. "Mary Photographer"'),
      license: isNotEmpty('Enter a license for the image. eg. "cc-by"'),
    },

    transformValues: (values) => {
      let elements = document.getElementsByName("fileUuid");
      return {
        ...values,
        file: elements[0]?.getAttribute("value") || '',
      }
    },
  });

  const [files, setFiles] = useState<FilePondFile[]>([])
  const [processed, setProcessed] = useState<boolean>(false)
  const [fileError, setFileError] = useState<string | undefined>(undefined)

  const formErrors = (errors: FormErrors) => {
    if (errors.file) {
      setFileError(errors.file.toString());
    }
  };

  const label = 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>';
  return (
    <form onSubmit={form.onSubmit(newMedia, formErrors)}>
        <FilePond
          required={false}
          allowMultiple={false}
          server={SERVER_CONFIG}
          name="fileUuid"
          onupdatefiles={files => { setFiles(files); setProcessed(false) }}
          onprocessfiles={() => setProcessed(true)}
          labelIdle={label}
        />
        {fileError && <Text fz="xs" c="red" mb={20}>{fileError}</Text> }


        {isError &&
         <Alert icon={<IconAlertCircle />} title="Failed!" color="red" radius="md">
           <Text>Could not save image due to the following reason:</Text>
           <RequestErrorText error={error} />
         </Alert>
        }

        {processed && files.length > 0 &&
        <Box maw={600} mx="auto">
          <TextInput
            required
            withAsterisk
            label="Publisher"
            placeholder="Publisher"
            {...form.getInputProps('publisher')}
          />
          <TextInput
            required
            withAsterisk
            label="Rights Holder"
            placeholder="Rights Holder"
            {...form.getInputProps('rights_holder')}
          />

          <Select
            required
            withAsterisk
            label="License"
            data={[
              { value: 'cc-by', label: 'CC BY' },
              { value: 'cc-by-sa', label: 'CC BY-SA' },
              { value: 'cc-by-nc', label: 'CC BY-NC' },
              { value: 'cc-by-nc-sa', label: 'CC BY-NC-SA' },
              { value: 'cc-by-nd', label: 'CC BY-ND' },
              { value: 'cc-by-nc-nd', label: 'CC BY-NC-ND' },
              { value: 'cc0', label: 'CC0' },
            ]}
            {...form.getInputProps('license')}
          />

          <TextInput
            label="Source"
            placeholder="Source"
            {...form.getInputProps('source')}
          />

          <Group position="right" mt="md">
            <Button type="submit" leftIcon={<IconDeviceFloppy />} loading={isLoading || isSuccess}>Save</Button>
          </Group>
        </Box>
        }
    </form>
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

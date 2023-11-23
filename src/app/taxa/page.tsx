'use client';

import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef, useState } from "react";
import { Classification, useClassificationOptionsQuery, useClassificationsQuery, useCreateClassificationsMutation, useDeleteClassificationsMutation, useUpdateClassificationsMutation } from "@/services/admin";
import { Box, Paper, Title, Stack, Select, Alert } from "@mantine/core";

import {
  Column,
  textColumn,
  keyColumn,
} from 'react-datasheet-grid'
import { TrackingSheet, datasetColumn, selectColumn } from "./TrackingSheet";
import { IconExclamationCircle } from "@tabler/icons-react";


type Row = {
  id: string,
  datasetId: string | null,
  rank: string | null,
  parentId: string | null,
  status: string | null,
  canonicalName: string | null,
  authorship: string | null,
  acceptedName: string | null,
  originalName: string | null,
  nomenclaturalCode: string | null,
  citation: string | null,
  vernacularNames: string | null,
  alternativeNames: string | null,
  description: string | null,
  remarks: string | null,
}


const TAXONOMIC_STATUS = [
  { label: 'Accepted', value: 'Accepted' },
  { label: 'Undescribed', value: 'Undescribed' },
  { label: 'Species Inquirenda', value: 'SpeciesInquirenda' },
  { label: 'Manuscript Name', value: 'ManuscriptName' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'Synonym', value: 'Synonym' },
  { label: 'Unaccepted', value: 'Unaccepted' },
  { label: 'Informal', value: 'Informal' },
]

const TAXONOMIC_RANK = [
  { label: 'Domain', value: 'Domain' },
  { label: 'Superkingdom', value: 'Superkingdom' },
  { label: 'Kingdom', value: 'Kingdom' },
  { label: 'Subkingdom', value: 'Subkingdom' },
  { label: 'Phylum', value: 'Phylum' },
  { label: 'Subphylum', value: 'Subphylum' },
  { label: 'Superclass', value: 'Superclass' },
  { label: 'Class', value: 'Class' },
  { label: 'Superorder', value: 'Superorder' },
  { label: 'Order', value: 'Order' },
  { label: 'Suborder', value: 'Suborder' },
  { label: 'Superfamily', value: 'Superfamily' },
  { label: 'Family', value: 'Family' },
  { label: 'Subfamily', value: 'Subfamily' },
  { label: 'Supertribe', value: 'Supertribe' },
  { label: 'Tribe', value: 'Tribe' },
  { label: 'Subtribe', value: 'Subtribe' },
  { label: 'Genus', value: 'Genus' },
  { label: 'Subgenus', value: 'Subgenus' },
  { label: 'Species', value: 'Species' },
  { label: 'Subspecies', value: 'Subspecies' },
  { label: 'Unranked', value: 'Unranked' },
  { label: 'HigherTaxon', value: 'HigherTaxon' },
]


const columns: Column<Row>[] = [
  {
    ...keyColumn('status', selectColumn({ choices: TAXONOMIC_STATUS })),
    title: 'Taxonomic status',
    minWidth: 200,
  },
  {
    ...keyColumn('datasetId', datasetColumn({ choices: [] })),
    title: 'Dataset',
    minWidth: 200,
  },
  {
    ...keyColumn('rank', selectColumn({ choices: TAXONOMIC_RANK })),
    title: 'Taxonomic rank',
    minWidth: 200,
  },
  { ...keyColumn<Row, 'canonicalName'>('canonicalName', textColumn), title: 'Canonical name', minWidth: 400 },
  { ...keyColumn<Row, 'authorship'>('authorship', textColumn), title: 'Authorship', minWidth: 200 },
  { ...keyColumn<Row, 'acceptedName'>('acceptedName', textColumn), title: 'Accepted name usage', minWidth: 400 },
  { ...keyColumn<Row, 'originalName'>('originalName', textColumn), title: 'Original name usage', minWidth: 400 },
  { ...keyColumn<Row, 'nomenclaturalCode'>('nomenclaturalCode', textColumn), title: 'Nomenclatural code', minWidth: 200 },
  { ...keyColumn<Row, 'citation'>('citation', textColumn), title: 'Citation', minWidth: 400 },
  { ...keyColumn<Row, 'vernacularNames'>('vernacularNames', textColumn), title: 'Vernacular names', minWidth: 400 },
  { ...keyColumn<Row, 'alternativeNames'>('alternativeNames', textColumn), title: 'Alternative names', minWidth: 400 },
  { ...keyColumn<Row, 'description'>('description', textColumn), title: 'Description', minWidth: 400 },
  { ...keyColumn<Row, 'remarks'>('remarks', textColumn), title: 'Remarks', minWidth: 400 },
];


interface GroupItem {
  group: string,
  items: string[],
}

interface ClassificationItem {
  value: string,
  label: string,
}

function ClassificationSelect({ onSelect }: { onSelect: (value: string | null) => void }) {
    /* const [options, setOptions] = useState<GroupItem[]>([]); */
  const [options, setOptions] = useState<ClassificationItem[]>([]);
  const { isFetching, data } = useClassificationOptionsQuery()

  useEffect(() => {
    if (!data) return;

      /* let items: GroupItem[] = []; */
    let items: ClassificationItem[] = [];
    for (const rank of Object.keys(data)) {
        /* items.push({ group: rank, items: data[rank] }) */
      data[rank].forEach(item => items.push({
        label: item.scientific_name,
        value: item.id,
      }));
    }

    setOptions(items);
  }, [data]);

  return (
    <Paper p={20} my={20}>
      <Select
        label="taxon"
        placeholder="filter by taxon"
        data={options}
        onChange={onSelect}
        limit={5}
        searchable
      />
    </Paper>
  )
}


function rowToClassification(row: Row): Partial<Classification> {
  return {
    id: row.id,
    dataset_id: row.datasetId || undefined,
    parent_id: row.parentId || undefined,
    rank: row.rank || undefined,
    accepted_name_usage: row.acceptedName || undefined,
    original_name_usage: row.originalName || undefined,
    canonical_name: row.canonicalName || undefined,
    scientific_name_authorship: row.authorship || undefined,
    nomenclatural_code: row.nomenclaturalCode || undefined,
    status: row.status || undefined,
    citation: row.citation || undefined,
    vernacular_names: row.vernacularNames || undefined,
    alternative_names: row.alternativeNames || undefined,
    description: row.description || undefined,
    remark: row.remarks || undefined,
  }
}

function classificationToRow(classification: Classification): Row {
  return {
    id: classification.id,
    status: classification.status,
    datasetId: classification.dataset_id,
    parentId: classification.parent_id,
    rank: classification.rank,
    canonicalName: classification.canonical_name,
    authorship: classification.scientific_name_authorship || null,
    acceptedName: classification.accepted_name_usage || null,
    originalName: classification.original_name_usage || null,
    nomenclaturalCode: classification.nomenclatural_code || null,
    citation: classification.citation || null,
    vernacularNames: classification.vernacular_names || null,
    alternativeNames: classification.alternative_names || null,
    description: classification.description || null,
    remarks: classification.remark || null,
  }
}


function TaxaDataSheet() {
  const [classification, setClassification] = useState<string|null>(null);
  const classificationRef = useRef(classification);
  classificationRef.current = classification;

  const [isSaving, setIsSaving] = useState(false);

  const { isFetching, data, refetch } = useClassificationsQuery({
    parent: encodeURIComponent(classification || ''),
  })

  const [createClassifications, createResult] = useCreateClassificationsMutation();
  const [updateClassifications, updateResult] = useUpdateClassificationsMutation();
  const [deleteClassifications, deleteResult] = useDeleteClassificationsMutation();

  const commit = async (created: Row[], updated: Row[], deleted: Row[]) => {
    setIsSaving(true);

    // persist the changes
    const createdRecords = created.map(rowToClassification);
    const updatedRecords = updated.map(rowToClassification);
    const deletedRecords = deleted.map(row => row.id);

    try { await createClassifications(createdRecords) }
    catch (err) { console.error(err) }

    try { await updateClassifications(updatedRecords) }
    catch (err) { console.error(err) }

    try { await deleteClassifications(deletedRecords) }
    catch (err) { console.error(err) }

    refetch();
    setIsSaving(false);
  }

  const createRow = (): Row => {
    return {
      id: uuidv4(),
      datasetId: null,
      parentId: classificationRef.current,
      status: null,
      rank: null,
      canonicalName: null,
      authorship: null,
      acceptedName: null,
      originalName: null,
      nomenclaturalCode: null,
      citation: null,
      vernacularNames: null,
      alternativeNames: null,
      description: null,
      remarks: null,
    }
  }

  return (
    <Stack>
      <ClassificationSelect onSelect={setClassification} />

      {createResult.isError &&
      <Alert variant="light" color="red" radius="md" withCloseButton title="Failed to create" icon={<IconExclamationCircle/>}>
        {(createResult.error as { data: string }).data}
      </Alert>
      }
      {updateResult.isError &&
      <Alert variant="light" color="red" radius="md" withCloseButton title="Failed to update" icon={<IconExclamationCircle/>}>
        {(updateResult.error as { data: string }).data}
      </Alert>
      }
      {deleteResult.isError &&
      <Alert variant="light" color="red" radius="md" withCloseButton title="Failed to delete" icon={<IconExclamationCircle/>}>
        {(deleteResult.error as { data: string }).data}
      </Alert>
      }

      <TrackingSheet
        loading={isFetching || isSaving}
        data={data?.map(classificationToRow) || []}
        columns={columns}
        onCommit={commit}
        onCreateRow={() => createRow()}
      />
    </Stack>
  )
}


export default function TaxaList() {
  return (
    <Box>
      <Title mt={20}>Global Names List</Title>
      <TaxaDataSheet />
    </Box>
  )
}

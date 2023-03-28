'use client';

import { UserTaxon, useGetUserTaxonQuery, useUpdateUserTaxonMutation } from "@/services/admin";
import { Alert, Box, Button, Group, TextInput, Textarea, Title, Text, LoadingOverlay, Paper } from "@mantine/core";
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


function Form({ userTaxon }: { userTaxon: UserTaxon }) {
  const router = useRouter();

  const [updateUserTaxon, { isLoading, isSuccess, isError, data, error }] = useUpdateUserTaxonMutation();

  useEffect(() => {
    if (isSuccess) router.push(`user_taxa/${userTaxon.taxa_lists_id}`);
  }, [data, isSuccess, router]);

  const form = useForm({
    initialValues: { ...userTaxon } as UserTaxon,
  });

  return (
    <Box mx="auto">
      <form onSubmit={form.onSubmit(updateUserTaxon)}>
        <Group grow align="top">
          <Paper shadow="md" radius="md" p="md">
            <TextInput label="Scientific name" description="http://rs.tdwg.org/dwc/terms/scientificName" {...form.getInputProps('scientific_name')}/>
            <TextInput label="Scientific name authorship" description="http://rs.tdwg.org/dwc/terms/scientificNameAuthorship" {...form.getInputProps('scientific_name_authorship')}/>
            <TextInput label="Canonical name" description="http://rs.gbif.org/terms/1.0/canonicalName" {...form.getInputProps('canonical_name')}/>
            <TextInput label="Specific epithet" description="http://rs.tdwg.org/dwc/terms/specificEpithet" {...form.getInputProps('specific_epithet')}/>
            <TextInput label="Intraspecific epithet" description="http://rs.tdwg.org/dwc/terms/infraspecificEpithet" {...form.getInputProps('intraspecific_epithet')}/>
          </Paper>
          <Paper shadow="md" radius="md" p="md">
            <TextInput label="Kingdom" description="http://rs.tdwg.org/dwc/terms/kingdom" {...form.getInputProps('kingdom')} />
            <TextInput label="Phylum" description="http://rs.tdwg.org/dwc/terms/phylum" {...form.getInputProps('phylum')}/>
            <TextInput label="Class" description="http://rs.tdwg.org/dwc/terms/class" {...form.getInputProps('class')}/>
            <TextInput label="Order" description="http://rs.tdwg.org/dwc/terms/order" {...form.getInputProps('order')}/>
            <TextInput label="Family" description="http://rs.tdwg.org/dwc/terms/family" {...form.getInputProps('family')}/>
            <TextInput label="Genus" description="http://rs.tdwg.org/dwc/terms/genus" {...form.getInputProps('genus')}/>
          </Paper>
          <Paper shadow="md" radius="md" p="md">
            <TextInput label="Taxon rank" description="http://rs.tdwg.org/dwc/terms/taxonRank" {...form.getInputProps('taxon_rank')}/>
            <TextInput label="Name according to" description="http://rs.tdwg.org/dwc/terms/nameAccordingTo" {...form.getInputProps('name_according_to')}/>
            <TextInput label="Name published in" description="http://rs.tdwg.org/dwc/terms/namePublishedIn" {...form.getInputProps('name_published_in')}/>
            <TextInput label="Taxonomic status" description="http://rs.tdwg.org/dwc/terms/taxonomicStatus" {...form.getInputProps('taxonomic_status')}/>
            <Textarea autosize minRows={5} label="Taxon remarks" description="http://rs.tdwg.org/dwc/terms/taxonRemarks" {...form.getInputProps('taxon_remarks')}/>
          </Paper>
        </Group>

        {isError && error &&
         <Alert icon={<IconAlertCircle />} title="Failed!" color="red" radius="md">
           <Text>Could not save the new user taxa due to the following reason:</Text>
           <Text c="dimmed">{error.status}</Text>
           <Text c="dimmed">{error.data || error.error}</Text>
         </Alert>
        }

        <Group position="right" mt="md">
          <Button type="submit" leftIcon={<IconDeviceFloppy />} loading={isLoading || isSuccess}>Save</Button>
        </Group>
      </form>
    </Box>
  )
}


export default function EditUserTaxon({ params }: { params: { taxon_id: string } }) {
  const { isFetching, isSuccess, isError, error, data } = useGetUserTaxonQuery(params.taxon_id);

  return (
    <Box>
      <Title p={20}>{data?.scientific_name}</Title>

      {isError && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Loading failed!" color="red" radius="lg">
          <Text>The request failed to load the user taxa list for the following reason:</Text>
          <Text c="dimmed">{error.status}</Text>
          <Text c="dimmed">{error.data || error.error}</Text>
        </Alert>
      )}

      <Box w="auto" p={40} pos="relative" mx="auto">
        <LoadingOverlay
          visible={isFetching}
          overlayBlur={2}
          loaderProps={{ size: 'xl', color: 'green', variant: 'bars' }}
        />
        {isSuccess && <Form userTaxon={data} />}
      </Box>
    </Box>
  )
}

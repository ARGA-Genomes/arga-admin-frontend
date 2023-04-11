'use client';

import { RequestErrorText } from "@/components/request-error";
import { Attribute, useGetAttributeQuery, useUpdateAttributeMutation } from "@/services/admin";
import { Alert, Box, Button, Group, TextInput, Textarea, Title, Text, LoadingOverlay, Select } from "@mantine/core";
import { isNotEmpty, useForm } from '@mantine/form';
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


const DATA_TYPES = [
    'String',
    'Text',
    'Integer',
    'Boolean',
    'Timestamp',
    'Array',
];

function Form({ attribute }: { attribute: Attribute }) {
  const router = useRouter();

  const [updateAttribute, { isLoading, isSuccess, isError, data, error }] = useUpdateAttributeMutation();

  useEffect(() => {
    if (isSuccess) router.push(`/attributes`);
  }, [data, isSuccess, router]);

  const form = useForm({
    initialValues: {
      id: attribute.id,
      name: attribute.name,
      data_type: attribute.data_type,
      reference_url: attribute.reference_url,
      description: attribute.description,
    } as Attribute,

    validate: {
      name: isNotEmpty('Enter a name for the list'),
      data_type: isNotEmpty('Select a data type'),
    },
  });

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(updateAttribute)}>
        <TextInput
          withAsterisk
          label="Name"
          placeholder="The attribute name"
          {...form.getInputProps('name')}
        />

        <Select
          withAsterisk
          label="Data type"
          data={DATA_TYPES}
          {...form.getInputProps('data_type')}
        />

        <TextInput
          label="Reference URL"
          placeholder="http://gnl.arga.org.au/exampleAttribute"
          {...form.getInputProps('reference_url')}
        />

        <Textarea
          autosize
          minRows={5}
          placeholder="Describe what the data associated with this attribute represents"
          label="Description"
          {...form.getInputProps('description')}
        />


        {isError &&
         <Alert icon={<IconAlertCircle />} title="Failed!" color="red" radius="md">
           <Text>Could not save changes to the attribute due to the following reason:</Text>
           <RequestErrorText error={error} />
         </Alert>
        }

        <Group position="right" mt="md">
          <Button type="submit" leftIcon={<IconDeviceFloppy />} loading={isLoading || isSuccess}>Save</Button>
        </Group>
      </form>
    </Box>
  )
}


export default function EditAttribute({ params }: { params: { uuid: string } }) {
  const { isFetching, isSuccess, isError, error, data } = useGetAttributeQuery(params.uuid);

  return (
    <Box>
      <Title p={20}>Edit Attribute</Title>

      {isError &&
        <Alert icon={<IconAlertCircle size="1rem" />} title="Loading failed!" color="red" radius="lg">
          <Text>The request failed to load the attribute for the following reason:</Text>
          <RequestErrorText error={error} />
        </Alert>
      }

      <Box w="auto" p={40} pos="relative" mx="auto">
        <LoadingOverlay
          visible={isFetching}
          overlayBlur={2}
          loaderProps={{ size: 'xl', color: 'green', variant: 'bars' }}
        />
        {isSuccess && <Form attribute={data} />}
      </Box>
    </Box>
  )
}

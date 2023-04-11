'use client';

import { RequestErrorText } from "@/components/request-error";
import { Attribute, useCreateAttributeMutation } from "@/services/admin";
import { Alert, Box, Button, Group, TextInput, Textarea, Title, Text, Select } from "@mantine/core";
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

function Form() {
  const router = useRouter();

  const [newAttribute, { isLoading, isSuccess, isError, data, error }] = useCreateAttributeMutation();

  useEffect(() => {
    if (isSuccess) router.push(`/attributes`);
  }, [data, isSuccess, router]);

  const form = useForm({
    initialValues: {
      name: '',
      data_type: 'String',
      reference_url: '',
      description: '',
    } as Attribute,

    validate: {
      name: isNotEmpty('Enter a name for the attribute'),
      data_type: isNotEmpty('Select a data type'),
    },
  });

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(newAttribute)}>
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
           <Text>Could not save the new attribute due to the following reason:</Text>
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


export default function NewAttribute() {
  return (
    <Box>
      <Title p={20}>New Attribute</Title>
      <Form />
    </Box>
  )
}

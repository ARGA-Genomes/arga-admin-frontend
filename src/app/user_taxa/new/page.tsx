'use client';

import { RequestErrorText } from "@/components/request-error";
import { UserTaxa, useCreateUserTaxaMutation } from "@/services/admin";
import { Alert, Box, Button, Group, TextInput, Textarea, Title, Text } from "@mantine/core";
import { isNotEmpty, useForm } from '@mantine/form';
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


function Form() {
  const router = useRouter();

  const [newUserTaxa, { isLoading, isSuccess, isError, data, error }] = useCreateUserTaxaMutation();

  useEffect(() => {
    if (isSuccess) router.push(`/user_taxa`);
  }, [data, isSuccess, router]);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    } as UserTaxa,

    validate: {
      name: isNotEmpty('Enter a name for the list'),
    },
  });

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(newUserTaxa)}>
        <TextInput
          withAsterisk
          label="Name"
          placeholder="Taxa list name"
          {...form.getInputProps('name')}
        />

        <Textarea
          autosize
          minRows={5}
          placeholder="Description"
          label="Describe the type of data the taxa list contains"
          {...form.getInputProps('description')}
        />

        {isError &&
         <Alert icon={<IconAlertCircle />} title="Failed!" color="red" radius="md">
           <Text>Could not save the new user taxa due to the following reason:</Text>
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


export default function NewTaxaList() {
  return (
    <Box>
      <Title p={20}>New Taxa List</Title>
      <Form />
    </Box>
  )
}

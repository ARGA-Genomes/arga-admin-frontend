'use client';

import { RequestErrorText } from "@/components/request-error";
import { UserTaxa, useGetUserTaxaQuery, useUpdateUserTaxaMutation } from "@/services/admin";
import { Alert, Box, Button, Group, TextInput, Textarea, Title, Text, LoadingOverlay } from "@mantine/core";
import { isNotEmpty, useForm } from '@mantine/form';
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


function Form({ userTaxa }: { userTaxa: UserTaxa }) {
  const router = useRouter();

  const [updateUserTaxa, { isLoading, isSuccess, isError, data, error }] = useUpdateUserTaxaMutation();

  useEffect(() => {
    if (isSuccess) router.push(`user_taxa`);
  }, [data, isSuccess, router]);

  const form = useForm({
    initialValues: {
      id: userTaxa.id,
      name: userTaxa.name,
      description: userTaxa.description,
    } as UserTaxa,

    validate: {
      name: isNotEmpty('Enter a name for the list'),
    },
  });

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(updateUserTaxa)}>
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
           <Text>Could not save changes to the user taxa due to the following reason:</Text>
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


export default function EditTaxaList({ params }: { params: { uuid: string } }) {
  const { isFetching, isSuccess, isError, error, data } = useGetUserTaxaQuery(params.uuid);

  return (
    <Box>
      <Title p={20}>Edit Taxa List</Title>

      {isError &&
        <Alert icon={<IconAlertCircle size="1rem" />} title="Loading failed!" color="red" radius="lg">
          <Text>The request failed to load the user taxa list for the following reason:</Text>
          <RequestErrorText error={error} />
        </Alert>
      }

      <Box w="auto" p={40} pos="relative" mx="auto">
        <LoadingOverlay
          visible={isFetching}
          overlayBlur={2}
          loaderProps={{ size: 'xl', color: 'green', variant: 'bars' }}
        />
        {isSuccess && <Form userTaxa={data} />}
      </Box>
    </Box>
  )
}

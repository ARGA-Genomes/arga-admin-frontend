'use client';

import { Alert, Box, Button, Container, Group, Paper, Text, TextInput, Textarea, Title } from "@mantine/core";
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { FilePond } from 'react-filepond'
import { FilePondFile } from 'filepond'
import 'filepond/dist/filepond.min.css'
import { useRouter } from "next/navigation";
import { ListImport, useCreateListImportMutation } from "@/services/admin";
import { FormErrors, isNotEmpty, useForm } from "@mantine/form";
import { RequestErrorText } from "@/components/request-error";


const SERVER_CONFIG = {
  url: process.env.NEXT_PUBLIC_ARGA_API_URL,
  process: {
    url: '/upload',
    withCredentials: true,
  },
  revert: null,
  restore: null,
  load: null,
  fetch: null,
};


function FileUpload() {
  const router = useRouter();

  const [newImport, { isLoading, isSuccess, isError, data, error }] = useCreateListImportMutation();

  useEffect(() => {
    if (isSuccess) router.push(`/lists`);
  }, [data, isSuccess, router]);

  const form = useForm({
    initialValues: {
      file: '',
      name: '',
      worker: 'import_conservation_status',
      description: undefined,
    } as ListImport,

    validate: {
      name: isNotEmpty('Enter a name for the new list'),
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

  return (
    <Paper p={40} radius="lg">
      <form onSubmit={form.onSubmit(newImport, formErrors)}>
        <FilePond
          required={true}
          allowMultiple={false}
          server={SERVER_CONFIG}
          name="fileUuid"
          onupdatefiles={files => { setFiles(files); setProcessed(false) }}
          onprocessfiles={() => setProcessed(true)}
          labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        />
        {fileError && <Text fz="xs" c="red" mb={20}>{fileError}</Text> }


        {isError &&
         <Alert icon={<IconAlertCircle />} title="Failed!" color="red" radius="md">
           <Text>Could not create a new import job due to the following reason:</Text>
           <RequestErrorText error={error} />
         </Alert>
        }

        {processed && files.length > 0 &&
        <Box maw={600} mx="auto">
          <TextInput
            withAsterisk
            label="Name"
            placeholder="List name"
            {...form.getInputProps('name')}
          />

          <Textarea
            autosize
            minRows={5}
            placeholder="Description"
            label="Describe the type of data the list contains"
            {...form.getInputProps('description')}
          />

          <Group position="right" mt="md">
            <Button type="submit" leftIcon={<IconDeviceFloppy />} loading={isLoading || isSuccess}>Save</Button>
          </Group>
        </Box>
        }
      </form>
    </Paper>
  )
}


export default function UploadPage() {
  return (
    <>
      <Title p={20}>Import List</Title>
      <Container>
        <FileUpload />
      </Container>
    </>
  )
}

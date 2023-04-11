'use client';

import { Alert, Box, Button, Container, Group, Paper, Text, TextInput, Textarea, Title } from "@mantine/core";
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { FilePond } from 'react-filepond'
import { FilePondFile } from 'filepond'
import 'filepond/dist/filepond.min.css'
import { useRouter } from "next/navigation";
import { TaxaImport, useCreateTaxaImportMutation } from "@/services/admin";
import { FormErrors, isNotEmpty, useForm } from "@mantine/form";
import { RequestErrorText } from "@/components/request-error";


const FILE_UPLOAD_URL = process.env.NEXT_PUBLIC_ARGA_API_URL;


function FileUpload() {
  const router = useRouter();

  const [newImport, { isLoading, isSuccess, isError, data, error }] = useCreateTaxaImportMutation();

  useEffect(() => {
    if (isSuccess) router.push(`/user_taxa`);
  }, [data, isSuccess, router]);

  const form = useForm({
    initialValues: {
      file: '',
      name: '',
      description: '',
    } as TaxaImport,

    validate: {
      name: isNotEmpty('Enter a name for the new taxa list'),
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
          server={`${FILE_UPLOAD_URL}/upload`}
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
      <Title p={20}>Import Taxa List</Title>
      <Container>
        <FileUpload />
      </Container>
    </>
  )
}

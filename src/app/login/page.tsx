'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Container, Group, Paper, PasswordInput, TextInput, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconLogin } from "@tabler/icons-react";
import { useLoginMutation } from "@/services/admin";
import { RequestErrorText } from "@/components/request-error";


export default function Login() {
  const router = useRouter();

  const [login, { isLoading, isSuccess, isError, data, error }] = useLoginMutation();

  useEffect(() => {
    if (isSuccess) router.push(`/`);
  }, [data, isSuccess, router]);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    }
  });

  return (
    <Container maw={600}>
      <Title align="center" py={30}>Login</Title>
      <Paper p={80} radius="xl">
        <form onSubmit={form.onSubmit(login)}>
          <TextInput pb={20} label="Email" placeholder="your@email.com" {...form.getInputProps('email')} />
          <PasswordInput pb={20} label="Password" placeholder="******" {...form.getInputProps('password')} />

          <Group position="right" mt="md">
            <Button type="submit" leftIcon={<IconLogin />} loading={isLoading || isSuccess}>Login</Button>
          </Group>

        {isError &&
         <Alert icon={<IconAlertCircle />} title="Failed!" color="red" radius="md">
           <Text>Login failed due to the following reason:</Text>
           <RequestErrorText error={error} />
         </Alert>
        }
        </form>
      </Paper>
    </Container>
  )
}

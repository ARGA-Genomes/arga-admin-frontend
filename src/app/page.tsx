'use client';

import { Container, Paper, Space, Stack, Text, Title } from "@mantine/core";

export default function Home() {
  return (
    <Container>
      <Title>Home</Title>
      <Paper p={50} mt={50} radius="xl">
        <Stack>
          <Title order={4}>Taxa</Title>
          <Text>The ARGA global names list</Text>
          <Space h="xl" />

          <Title order={4}>User Taxa</Title>
          <Text>Custom lists added by users to extend the ARGA global names list</Text>
          <Space h="xl" />

          <Title order={4}>Attributes</Title>
          <Text>Defined data types that can be used in imports</Text>
        </Stack>
      </Paper>
    </Container>
  )
}

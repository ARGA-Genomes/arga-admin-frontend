'use client';

import { store } from '@/store';
import {
  AppShell,
  Group,
  MantineProvider,
  Navbar,
  ThemeIcon,
  UnstyledButton,
  Text,
  Switch,
  useMantineColorScheme,
  useMantineTheme,
  ColorSchemeProvider,
  ColorScheme
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { IconBinaryTree2, IconList, IconMoonStars, IconSun, IconTags } from '@tabler/icons-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Provider } from 'react-redux';


interface NavLinkProps {
  icon: React.ReactNode;
  color: string;
  label: string;
}

function NavLink({ icon, color, label }: NavLinkProps) {
  return (
    <UnstyledButton
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
      })}
    >
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>

        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}


function SideNav() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <Navbar p="xs" width={{ base: 300 }}>
      <Navbar.Section grow mt="md">
        <Link href="/taxa">
          <NavLink color="blue" label="Taxa" icon={<IconBinaryTree2/>} />
        </Link>
        <Link href="/user_taxa">
          <NavLink color="violet" label="User Taxa" icon={<IconList/>} />
        </Link>
        <Link href="/attributes">
          <NavLink color="green" label="Attributes" icon={<IconTags/>} />
        </Link>
      </Navbar.Section>

      <Navbar.Section>
        <Group position="center" my={30}>
          <Switch
            checked={colorScheme === 'dark'}
            onChange={() => toggleColorScheme()}
            size="lg"
            onLabel={<IconSun color={theme.white} size="1.25rem" stroke={1.5} />}
            offLabel={<IconMoonStars color={theme.colors.gray[6]} size="1.25rem" stroke={1.5} />}
          />
        </Group>
      </Navbar.Section>
    </Navbar>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      padding="md"
      navbar={<SideNav/>}
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
      })}
    >
      {children}
    </AppShell>
  );
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()

  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme);
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <html lang="en">
      <head/>
      <body>
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
            <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <Shell>
                {children}
              </Shell>
            </QueryClientProvider>
            </Provider>
          </MantineProvider>
        </ColorSchemeProvider>
      </body>
    </html>
  )
}

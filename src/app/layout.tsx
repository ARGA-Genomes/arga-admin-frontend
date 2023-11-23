'use client';

import '@mantine/core/styles.css';
import 'react-datasheet-grid/dist/style.css'
import classes from './layout.module.css';

import { store } from '@/store';
import {
  AppShell,
  MantineProvider,
  ThemeIcon,
  useMantineColorScheme,
  useMantineTheme,
  NavLink,
  useComputedColorScheme,
  ActionIcon,
  Center,
} from '@mantine/core';
import cx from 'clsx';
import { IconBinaryTree2, IconMoon, IconPhoto, IconSun } from '@tabler/icons-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';
import { Provider } from 'react-redux';


function Shell({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <AppShell padding="md" navbar={{ width: 300, breakpoint: 'sm' }}>
      <AppShell.Navbar p="xs">
        <AppShell.Section grow mt="md">
          <NavLink
            label="Taxa"
            description="View and edit taxa"
            leftSection={<ThemeIcon color="blue" variant="light"><IconBinaryTree2 /></ThemeIcon>}
            component={Link}
            href="/taxa"
          />
          <NavLink
            label="Media"
            description="Assign photos to species"
            leftSection={<ThemeIcon color="orange" variant="light"><IconPhoto /></ThemeIcon>}
            component={Link}
            href="/media"
          />
        </AppShell.Section>

        <AppShell.Section>
          <Center>
            <ActionIcon
              onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
              variant="default"
              size="xl"
              aria-label="Toggle color scheme"
            >
              <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
              <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
            </ActionIcon>
          </Center>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()

  return (
    <html lang="en">
      <head/>
      <body>
        <MantineProvider defaultColorScheme="light">
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <Shell>
                {children}
              </Shell>
            </QueryClientProvider>
            </Provider>
        </MantineProvider>
      </body>
    </html>
  )
}

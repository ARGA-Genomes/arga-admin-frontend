import { Text } from "@mantine/core";


export function RequestErrorText(error: any) {
  if (error?.status && (error?.data || error?.error)) {
    return (
      <>
        <Text c="dimmed">{error.status}</Text>
        <Text c="dimmed">{error.data || error.error}</Text>
      </>
    )
  } else {
    return (
      <>
        <Text c="dimmed">Unknown error</Text>
        <Text c="dimmed">{`An unknown error has occurred (status: ${error?.status})`}</Text>
      </>
    )
  }
}


export function getErrorMessage(error: any) {
  return error?.data || error?.error || error?.status.toString();
}

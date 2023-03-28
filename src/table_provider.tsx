import React, { useState } from 'react';

type TableState = {
  isDeleting: boolean,
  setIsDeleting: (isDeleting: boolean) => void,

  error?: string,
  setError: (error: string | undefined) => void,
}


const TableContext = React.createContext<TableState>({
  isDeleting: false,
  setIsDeleting: () => {},
  setError: () => {},
});

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  return (
    <TableContext.Provider value={{
      isDeleting,
      setIsDeleting,
      error,
      setError,
    }}>
      {children}
    </TableContext.Provider>
  )
}

export const useTable = () => React.useContext(TableContext);

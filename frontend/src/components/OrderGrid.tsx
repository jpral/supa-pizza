import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';
import { EuiDataGrid, EuiEmptyPrompt, EuiLoadingSpinner } from '@elastic/eui';

/* Simple example for a data grid, to be replaced by a live feed from the order table - See below
  supabase.channel('*').on('postgres_changes', { event: '*', schema: '*' }, payload => {
    console.log('Change received!', payload)
  }).subscribe(); */

export const OrderGrid = () => {
  type Client = Database['public']['Tables']['client']['Row'];
  type ClientIndex = keyof Client;

  const columns = [{ id: 'id' }, { id: 'name' }];
  const [visibleColumns, setVisibleColumns] = useState(['id', 'name']);
  const { isLoading, data } = useQuery<Client[], Error>(['clients'], async () => {
    const { data, error } = await supabase.from('client').select('id,name');
    if (error) {
      throw error;
    }
    return data as Client[];
  }, { refetchInterval: 10000 })

  return (<>
    {isLoading &&
      <EuiEmptyPrompt icon={<EuiLoadingSpinner size="m" />}>
      </EuiEmptyPrompt>
    }
    {data &&
      <EuiDataGrid
        inMemory={{ level: 'enhancements' }}
        aria-label={'Live orders'}
        columns={columns}
        columnVisibility={{ visibleColumns, setVisibleColumns }}
        rowCount={data.length}
        renderCellValue={({ rowIndex, columnId }) => {
          let val = data[rowIndex][columnId as ClientIndex];
          return val;
        }}
      />}

  </>
  )
}
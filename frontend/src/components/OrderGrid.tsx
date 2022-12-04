import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';
import { EuiButtonIcon, EuiDataGrid, EuiEmptyPrompt, EuiLoadingSpinner, EuiScreenReaderOnly } from '@elastic/eui';

export const OrderGrid = () => {

  type Order = Database['public']['Tables']['order']['Row'];

  // Initial data fetch, first 50 records
  const [visibleColumns, setVisibleColumns] = useState(['id', 'client_id', 'delivery_status', 'created_at']);
  const { isLoading, data } = useQuery<Order[], Error>(['live_orders'], async () => {
    const { data, error } = await supabase.from('order').select('*, client(*)').limit(50).order('id', { ascending: false });
    if (error) {
      throw error;
    }
    return data as Order[];
  })
  const queryClient = useQueryClient();

  // Real time data fetch
  useEffect(() => {
    const liveFeed = supabase.channel('*').on('postgres_changes', { event: 'UPDATE', schema: '*' }, payload => {
      // @ts-ignore -> types are outdated?
      const newRecord = payload.record;
      // We add any new orders, fulfilled or undelivered, to the data array 
      // and invalidate the cache so the component refreshes.
      if (data) {
        data.unshift(newRecord);
        queryClient.invalidateQueries({ queryKey: ['live_orders'] });
      }
    }).subscribe();
    return () => {
      liveFeed.unsubscribe();
    }
  }, [queryClient, data]);

  // Pagination functions for the datagrid
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const onChangeItemsPerPage = useCallback(
    (pageSize: number) =>
      setPagination((pagination) => ({
        ...pagination,
        pageSize,
        pageIndex: 0,
      })),
    [setPagination]
  );
  const onChangePage = useCallback(
    (pageIndex: number) =>
      setPagination((pagination) => ({ ...pagination, pageIndex })),
    [setPagination]
  );

  return (<>
    {isLoading &&
      <EuiEmptyPrompt icon={<EuiLoadingSpinner size="m" />}>
      </EuiEmptyPrompt>
    }
    {data &&
      <EuiDataGrid
        height={500}
        pagination={{
          ...pagination,
          pageSizeOptions: [10, 50, 100],
          onChangeItemsPerPage: onChangeItemsPerPage,
          onChangePage: onChangePage,
        }}
        inMemory={{ level: 'pagination' }}
        aria-label={'Live orders'}
        columns={[
          { id: 'id', initialWidth: 100 },
          { id: 'delivery_status', display: 'Status' },
          { id: 'created_at', display: 'Date ordered' },
        ]}
        trailingControlColumns={[{
          id: 'actions',
          width: 80,
          headerCellRender: () => (
            <EuiScreenReaderOnly><span>Controls</span></EuiScreenReaderOnly>
          ),
          rowCellRender: ({ rowIndex }) => {

            return (
              <>
                <EuiButtonIcon
                  aria-label="User data"
                  iconType="user"
                  color="text"
                  onClick={() => alert('fetch-user-data TODO!')} />
                <EuiButtonIcon
                  aria-label="Pizza details"
                  iconType="layers"
                  color="text"
                  onClick={() => alert('fetch-pizza-data TODO!')} />
              </>
            )
          }
        }]}
        columnVisibility={{ visibleColumns, setVisibleColumns }}
        rowCount={data.length}
        renderCellValue={({ rowIndex, columnId }) => {
          if (columnId === 'created_at') {
            let date = data[rowIndex][columnId as keyof Order] as string;
            let timeFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long' });
            date = timeFormatter.format(new Date(date));
            return date
          }
          return data[rowIndex][columnId as keyof Order];
        }}
      />}

  </>
  )
}
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';
import { EuiButtonEmpty, EuiButtonIcon, EuiDataGrid, EuiEmptyPrompt, EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle, EuiText, EuiTitle, useEuiTheme } from '@elastic/eui';

import { useCustomStyle } from '../hooks/useCustomStyle';
import { useOrderData } from '../hooks/useOrderData';
import { ModalForm } from './ModalForm';

import PizzaIcon from './../assets/pizza.svg';

export const OrderGrid = () => {
  const { euiTheme } = useEuiTheme();
  const { titleStyle, subtitleStyle } = useCustomStyle();
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const closeModal = () => setIsExtraModalOpen(false);
  const showModal = () => setIsExtraModalOpen(true);

  const [currentOrderId, setCurrentOrderId] = useState<number>();
  const { data: orderData, refetch } = useOrderData({ orderId: currentOrderId ?? 0 });

  type Order = Database['public']['Tables']['order']['Row'];

  // Initial data fetch, first 50 records
  const [visibleColumns, setVisibleColumns] = useState(['id', 'client_id', 'delivery_status', 'created_at']);
  const { isLoading, data } = useQuery<Order[], Error>(['live_orders'], async () => {
    const { data, error } = await supabase.from('order').select('*, client(*)').limit(50).order('id', { ascending: false });
    if (error) {
      throw error;
    }
    return data as Order[];
  }, { staleTime: Infinity })
  const queryClient = useQueryClient();

  // Extra details fetching on demand
  useEffect(() => {
    refetch();
  }, [currentOrderId, refetch])

  // Real time data fetch
  useEffect(() => {
    const liveFeed = supabase.channel('*').on('postgres_changes', { event: 'UPDATE', schema: '*' }, payload => {
      // @ts-ignore -> types are outdated?
      const newRecord = payload.record;
      // We add any new orders, fulfilled or undelivered, to the data array 
      // and invalidate the cache so the component refreshes.
      if (data) {
        queryClient.setQueryData(['live_orders'], [newRecord].concat(data));
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
    {data && <>
      <div style={{ marginBottom: euiTheme.size.s }}>
        <EuiTitle css={titleStyle}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <h3>Live feed</h3>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <ModalForm />
            </EuiFlexItem>
          </EuiFlexGroup>

        </EuiTitle>
        <EuiText css={subtitleStyle}><span>Keep an eye on all the new orders as they come</span></EuiText>
      </div>
      {isExtraModalOpen && (
        <EuiModal onClose={closeModal}>
          <EuiModalHeader><EuiModalHeaderTitle css={titleStyle}><h1>Order details</h1></EuiModalHeaderTitle></EuiModalHeader>
          <EuiModalBody>
            <EuiText size='s'><b>Order ID:</b> {currentOrderId}</EuiText>
            {(orderData && orderData.length) && (
              <>
                <EuiText size='s'><b>Dough: </b>{orderData[0].order_dough[0].dough.name}</EuiText>
                <EuiText size='s'><b>Ingredients: </b>
                  {orderData[0].order_ingredient.reduce((acc, current) => {
                    return acc + current.ingredient.name + ', ';
                  }, '').slice(0, -2)}
                </EuiText>
                <EuiText size='s'><b>Ordered by:</b> {orderData[0].client.name} {orderData[0].client.surname}</EuiText>

              </>
            )}
          </EuiModalBody>
          <EuiModalFooter><EuiButtonEmpty onClick={closeModal}>Close</EuiButtonEmpty></EuiModalFooter>
        </EuiModal>
      )}
      <EuiDataGrid
        height={250}
        toolbarVisibility={{ showFullScreenSelector: false }}
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
          { id: 'delivery_status', display: 'Status', initialWidth: 120 },
          { id: 'created_at', display: 'Date ordered' },
        ]}
        trailingControlColumns={[{
          id: 'actions',
          width: 65,
          headerCellRender: () => (
            <span>Details</span>
          ),
          rowCellRender: ({ rowIndex }) => {

            return (
              <>
                <EuiButtonIcon onClick={() => { setCurrentOrderId(data[rowIndex].id); showModal() }} iconType={PizzaIcon} aria-label={'Show pizza details'} />
              </>
            )
          }
        }]}
        columnVisibility={{ visibleColumns, setVisibleColumns }}
        rowCount={data.length}
        renderCellValue={({ rowIndex, columnId }) => {
          if (columnId === 'created_at') {
            let date = data[rowIndex][columnId as keyof Order] as string;
            let timeFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'medium' });
            date = timeFormatter.format(new Date(date));
            return date
          }
          return data[rowIndex][columnId as keyof Order];
        }}
      /></>}

  </>
  )
}
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

import { OrderRatio } from './OrderRatio'
import { Database } from '../types/database';

import { EuiEmptyPrompt, EuiLoadingSpinner } from '@elastic/eui';

type OrderSuccessType = Database['public']['Functions']['fn_get_ratio_success_deliveries']['Returns'];

export const OrderRatioContainer = () => {
  const TIME_WINDOW_SECONDS = 120;

  const queryFn = async () => {
    const { data, error } = await supabase.rpc('fn_get_ratio_success_deliveries', { seconds: TIME_WINDOW_SECONDS });
    if (error) {
      throw error;
    }

    return data as OrderSuccessType[];
  }
  const { isLoading, data, isError } = useQuery<OrderSuccessType[], Error>(['ratio_orders'], queryFn, { refetchInterval: 10000 })

  if (isError) {
    return <EuiEmptyPrompt title={<h3 data-testid="error-prompt">There was an error fetching this data</h3>} />;
  }
  if (isLoading) {
    return <EuiEmptyPrompt icon={<EuiLoadingSpinner size="m" />} />;
  }

  return <OrderRatio orderData={data} />
}
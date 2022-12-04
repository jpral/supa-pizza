import { EuiEmptyPrompt, EuiLoadingSpinner, EuiTitle } from '@elastic/eui';
import { useQuery } from '@tanstack/react-query';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';

export const OrderRatio = () => {
  const TIME_WINDOW_SECONDS = 120;

  type ResponseOrder = Database['public']['Functions']['fn_get_ratio_success_deliveries']['Returns'];

  const { isLoading, data } = useQuery<ResponseOrder[], Error>(['ratio_orders'], async () => {
    const { data, error } = await supabase.rpc('fn_get_ratio_success_deliveries', { seconds: TIME_WINDOW_SECONDS });
    if (error) {
      throw error;
    }
    return data as ResponseOrder[];
  }, { refetchInterval: 10000 })

  if (isLoading) {
    return <EuiEmptyPrompt icon={<EuiLoadingSpinner size="m" />} />;
  }

  return <>
    <EuiTitle size='xs'><h3>Order ratio</h3></EuiTitle>
    {data && data.map((v, i) => <p key={i}>{v.label}: {v.percent}%</p>)}
  </>
}
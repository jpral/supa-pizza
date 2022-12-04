import { EuiEmptyPrompt, EuiLoadingSpinner, EuiTitle } from '@elastic/eui';
import { useQuery } from '@tanstack/react-query';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';

export const HappiestBelly = () => {
  const TIME_WINDOW_SECONDS = 300;
  type ResponseCustomer = Database['public']['Functions']['fn_get_best_customer']['Returns'];

  const { isLoading, data } = useQuery<ResponseCustomer[], Error>(['best_customer'], async () => {
    const { data, error } = await supabase.rpc('fn_get_best_customer', { seconds: TIME_WINDOW_SECONDS }).limit(1);
    if (error) {
      throw error;
    }
    return data as ResponseCustomer[];
  }, { refetchInterval: 10000 })


  if (isLoading) {
    return <EuiEmptyPrompt icon={<EuiLoadingSpinner size="m" />} />;
  }

  return <>
    <EuiTitle size='xs'><h3>Best customer</h3></EuiTitle>
    {data && data.map((v, i) => <p key={i}>{v.name} {v.surname}: {v.count} eaten ingredients</p>)}
  </>
}
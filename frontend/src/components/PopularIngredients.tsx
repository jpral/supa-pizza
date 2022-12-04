import { EuiEmptyPrompt, EuiLoadingSpinner, EuiTitle } from '@elastic/eui';
import { useQuery } from '@tanstack/react-query';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';

export const PopularIngredients = () => {
  const TIME_WINDOW_SECONDS = 300;

  type ResponseIngredients = Database['public']['Functions']['fn_get_most_popular_ingredient']['Returns'];

  const { isLoading, data } = useQuery<ResponseIngredients[], Error>(['popular_ingredients'], async () => {
    const { data, error } = await supabase.rpc('fn_get_most_popular_ingredient', { seconds: TIME_WINDOW_SECONDS }).limit(3);
    if (error) {
      throw error;
    }
    return data as ResponseIngredients[];
  }, { refetchInterval: 10000 })

  if (isLoading) {
    return <EuiEmptyPrompt icon={<EuiLoadingSpinner size="m" />} />;
  }

  return <>
    <EuiTitle size='xs'><h3>Top ingredients</h3></EuiTitle>
    {data && data.map((v, i) => <p key={i}>{v.name}: Ordered {v.count} times</p>)}
  </>
}
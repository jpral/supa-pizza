import { useQuery } from '@tanstack/react-query'
import { Database } from '../types/database'
import { supabase } from '../utils/supabase'

export const useStockData = () => {
  type Stock = Database['public']['Functions']['fn_get_stock_items']['Returns']
  return useQuery<Stock[]>(['stock-data'], async () => {
    const { error, data } = await supabase.rpc('fn_get_stock_items').select('*');
    if (error) {
      throw error;
    }
    return data as Stock[];
  }, { refetchInterval: 10000 })
}
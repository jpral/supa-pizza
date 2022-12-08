import { useQuery } from '@tanstack/react-query'
import { Database } from '../types/database'
import { supabase } from '../utils/supabase'

export const useOwnerData = () => {
  type Owner = Database['public']['Tables']['client']['Row']
  return useQuery<Owner>(['owner-data'], async () => {
    const { error, data } = await supabase.from('client').select('*').eq('id', 1);
    if (error) {
      throw error;
    }
    return data[0] as Owner;
  })
}
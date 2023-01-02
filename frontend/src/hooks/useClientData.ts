import { useQuery } from '@tanstack/react-query'
import { Database } from '../types/database'
import { supabase } from '../utils/supabase'

export const useClientData = ({ clientId }: { clientId: number }) => {
  type Client = Database['public']['Tables']['client']['Row']

  return useQuery<Client>(['client-data'], async () => {
    const { error, data } = await supabase.from('client').select('*').eq('id', clientId);
    if (error) {
      throw error;
    }
    return data[0] as Client;
  }, { enabled: !!clientId });
}
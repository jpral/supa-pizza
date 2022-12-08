import { useQuery } from '@tanstack/react-query'
import { supabase } from '../utils/supabase'

// Returns extra details of an order
export const useOrderData = ({ orderId }: { orderId: number }) => {

  type OrderDetails = {
    id: number
    order_dough: {
      dough: { name: string }
    }[]
    order_ingredient: {
      ingredient: { name: string }
    }[]
    client: { name: string, surname: string }
  }
  return useQuery<OrderDetails[], Error>(['order_details'], async () => {
    const { data, error } = await supabase.from('order').select('id, order_dough(dough(name)), order_ingredient(ingredient(name)), client(name, surname)').eq('id', orderId);
    if (error) {
      throw error;
    }
    return data as OrderDetails[];
  }, { enabled: false, staleTime: Infinity });
}
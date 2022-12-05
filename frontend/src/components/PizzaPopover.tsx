import { EuiButtonEmpty, EuiLoadingSpinner, EuiPopover, EuiText } from '@elastic/eui';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '../utils/supabase';
import Pizza from './../assets/pizza.svg';

export const PizzaPopover = ({ id }: { id: number }) => {
  type OrderDetails = {
    id: number
    order_dough: {
      dough: { name: string }
    }[]
    order_ingredient: {
      ingredient: { name: string }
    }[]
  }
  const { isLoading, data, refetch } = useQuery<OrderDetails[], Error>(['order_details'], async () => {
    const { data, error } = await supabase.from('order').select('id, order_dough(dough(name)), order_ingredient(ingredient(name))').eq('id', id);
    if (error) {
      throw error;
    }
    console.log(data);
    return data as OrderDetails[];
  }, { enabled: false, staleTime: Infinity });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onButtonClick = () => {
    if (!isPopoverOpen) {
      refetch();
    }
    setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);

  }
  const closePopover = () => setIsPopoverOpen(false);
  return (
    <EuiPopover
      button={
        <EuiButtonEmpty
          iconType={Pizza}
          iconSide="right"
          onClick={onButtonClick}
          textProps={{ style: { margin: 0 } }}
        />
      }
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition="leftCenter"
    >
      {isLoading && <EuiLoadingSpinner size="m" />}
      {data &&
        <>
          <EuiText size='s'><b>Dough:</b></EuiText>
          <EuiText size='s'>{data[0].order_dough[0].dough.name}</EuiText>
          <EuiText size='s'><b>Ingredients:</b></EuiText>
          {data[0].order_ingredient.reduce((acc, current) => {
            return acc + current.ingredient.name + ', ';
          }, '').slice(0, -2)}
        </>
      }
    </EuiPopover>
  );
}
import { EuiButtonEmpty, EuiLoadingSpinner, EuiPopover, EuiText } from '@elastic/eui';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';
import User from './../assets/user.svg';

export const UserPopover = ({ id }: { id: number }) => {
  type ClientDetails = Database['public']['Tables']['client']['Row'];
  const { isLoading, data, refetch } = useQuery<ClientDetails[], Error>(['client_details'], async () => {
    const { data, error } = await supabase.from('client').select('*').eq('id', id);
    if (error) {
      throw error;
    }
    console.log(data);
    return data as ClientDetails[];
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
          iconType={User}
          iconSide="right"
          onClick={onButtonClick}
        />
      }
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition="leftCenter"
    >
      {isLoading && <EuiLoadingSpinner size="m" />}
      {data &&
        <>
          <EuiText size='s'><b>Ordered by:</b></EuiText>
          <EuiText size='s'>{data[0].name} {data[0].surname}</EuiText>
          <EuiText size='s'>{data[0].email}</EuiText>
        </>
      }
    </EuiPopover>
  );
}
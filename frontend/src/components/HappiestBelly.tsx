import { EuiAvatar, EuiEmptyPrompt, EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner, EuiText, EuiTitle, useEuiTheme } from '@elastic/eui';
import { useQuery } from '@tanstack/react-query';
import { useCustomStyle } from '../hooks/useCustomStyle';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';

export const HappiestBelly = () => {
  const { euiTheme } = useEuiTheme();
  const { titleStyle, subtitleStyle, numberStyle } = useCustomStyle();

  const TIME_WINDOW_SECONDS = 300;
  type ResponseCustomer = Database['public']['Functions']['fn_get_best_customer']['Returns'];

  const { isLoading, data } = useQuery<ResponseCustomer[], Error>(['best_customer'], async () => {
    const { data, error } = await supabase.rpc('fn_get_best_customer', { seconds: TIME_WINDOW_SECONDS }).limit(10);
    if (error) {
      throw error;
    }
    return data as ResponseCustomer[];
  }, { refetchInterval: 10000 })

  if (isLoading) {
    return <EuiEmptyPrompt icon={<EuiLoadingSpinner size="m" />} />;
  }

  return (
    <EuiFlexGroup wrap style={{ justifyContent: 'space-between' }}>
      <EuiFlexItem style={{ alignItems: 'flex-start', flexBasis: '180px', justifyContent: 'space-between', gap: euiTheme.size.s }}>
        <div>
          <EuiTitle css={titleStyle}><h3>Best customer</h3></EuiTitle>
          <EuiText css={subtitleStyle}><span>Customer with most ingredients eaten in the last {TIME_WINDOW_SECONDS / 60} minutes</span></EuiText>
        </div>
        <div style={{ gap: euiTheme.size.s, display: 'flex', flexDirection: 'row' }}>
          {(data && data.length > 0) && <>
            <EuiAvatar size='l' imageUrl={data[0].avatar_url} name={data[0].name + ' ' + data[0].surname} />
            <EuiText css={subtitleStyle}>
              <b>{data[0].name + ' ' + data[0].surname}</b><br />
              {data[0].email}
            </EuiText>
          </>
          }
        </div>
      </EuiFlexItem>
      <EuiFlexItem style={{ alignItems: 'center', height: '150px', justifyContent: 'center', borderRadius: euiTheme.size.xs }}>
        {(data && data.length > 0) && <>
          <EuiText css={numberStyle}><span>{data[0].count}</span></EuiText>
          <EuiText css={subtitleStyle}><span>Ingredients</span></EuiText>
        </>
        }
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}
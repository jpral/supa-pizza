import { BarSeries, Chart, Settings } from '@elastic/charts';
import { EuiEmptyPrompt, EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner, EuiText, EuiTitle, useEuiTheme } from '@elastic/eui';
import { useQuery } from '@tanstack/react-query';
import { useCustomStyle } from '../hooks/useCustomStyle';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';
export const PopularIngredients = () => {
  const TIME_WINDOW_SECONDS = 300;

  const { euiTheme } = useEuiTheme();
  const { titleStyle, subtitleStyle, chartColors } = useCustomStyle();

  type ResponseIngredients = Database['public']['Functions']['fn_get_most_popular_ingredient']['Returns'] & { group: string };

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

  return (<>
    <EuiFlexGroup wrap style={{ justifyContent: 'space-between' }}>
      <EuiFlexItem style={{ alignItems: 'flex-start', flexBasis: '180px', justifyContent: 'space-between', gap: euiTheme.size.s }}>
        <div>
          <EuiTitle css={titleStyle}><h3>Top ingredients</h3></EuiTitle>
          <EuiText css={subtitleStyle}><span>Our most beloved ingredients for the last {TIME_WINDOW_SECONDS / 60} minutes</span></EuiText>
        </div>
        <Chart {...{ size: { height: 100 } }}>
          <Settings rotation={90}
            showLegend
            theme={{
              colors: { vizColors: chartColors },
              background: { color: euiTheme.colors.emptyShade },
              chartMargins: { left: 0, bottom: 0, right: 0 },
              scales: { barsPadding: 0 }
            }}
          />
          {(data && data.length > 0) &&
            <BarSeries
              id='Ingredients'
              name="Times ordered:"
              xAccessor={"group"}
              yAccessors={["count"]}
              data={data.map(d => { d.group = 'Top ingredients'; return d })}
              splitSeriesAccessors={["name"]}
              tickFormat={(d) => `${d} orders`}

            />
          }</Chart>
      </EuiFlexItem>
    </EuiFlexGroup>

  </>
  )
}
import { EuiEmptyPrompt, EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner, EuiText, EuiTitle, useEuiTheme } from '@elastic/eui';
import { Chart, Datum, Partition, PartitionLayout, Settings } from '@elastic/charts';

import { useQuery } from '@tanstack/react-query';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';

import { useCustomStyle } from '../hooks/useCustomStyle';

export const OrderRatio = () => {
  const { euiTheme } = useEuiTheme();
  const { chartColors, titleStyle, subtitleStyle, numberStyle, taglineStyle } = useCustomStyle();

  const TIME_WINDOW_SECONDS = 1200000;

  type ResponseOrder = Database['public']['Functions']['fn_get_ratio_success_deliveries']['Returns'];

  const { isLoading, data } = useQuery<ResponseOrder[], Error>(['ratio_orders'], async () => {
    const { data, error } = await supabase.rpc('fn_get_ratio_success_deliveries', { seconds: TIME_WINDOW_SECONDS });
    if (error) {
      throw error;
    }

    return data as ResponseOrder[];
  }, { refetchInterval: 10000 })

  // Defaults in case no perfect orders are found
  const parseData = () => {
    if (!data || !data.length) return { percentPerfect: 0, countPerfect: 0, countTotal: 0 }
    const perfect = data.find(el => el.label === 'perfect');
    const percentPerfect = perfect?.percent || 0;
    const countPerfect = perfect?.ctorder || 0;
    const countTotal = data.reduce((acc, current) => acc + current.ctorder, 0);
    return { percentPerfect, countPerfect, countTotal }
  }

  const parsedData = parseData();

  if (isLoading) {
    return <EuiEmptyPrompt icon={<EuiLoadingSpinner size="m" />} />;
  }

  return (
    <EuiFlexGroup wrap style={{ justifyContent: 'space-between' }}>
      <EuiFlexItem style={{ alignItems: 'flex-start', flexBasis: '180px', justifyContent: 'space-between' }}>
        <div>
          <EuiTitle css={titleStyle}><h3>Success ratio</h3></EuiTitle>
          <EuiText css={subtitleStyle}><span>Ratio of perfect / good pizzas in the last {TIME_WINDOW_SECONDS / 60} minutes</span></EuiText>
        </div>
        <div>
          <EuiText css={numberStyle}><span>{Math.round(parsedData.percentPerfect)}%</span></EuiText>
          <EuiText css={taglineStyle}><span>{parsedData.countPerfect} perfect deliveries of {parsedData.countTotal} orders</span></EuiText>
        </div>
      </EuiFlexItem>
      <EuiFlexItem style={{ flexBasis: '120px' }}>
        <Chart {...{ size: { height: 150 } }}>
          <Settings
            theme={{
              background: { color: euiTheme.colors.emptyShade },
              chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
              partition: {
                linkLabel: { maximumSection: Infinity, maxCount: 0 },
                circlePadding: 4,
                outerSizeRatio: 0.9,
                emptySizeRatio: 0.4,
              }
            }}
            showLegend={false}
            showLegendExtra={false}
          />
          <Partition
            id="success_rate_chart"
            data={data ? data : []}
            layout={PartitionLayout.sunburst}
            valueAccessor={(d: ResponseOrder) => { return d.ctorder; }}
            valueFormatter={(d: number) => `${d} orders`}
            layers={[{
              groupByRollup: (d: ResponseOrder) => d.label,
              nodeLabel: (d: Datum) => {
                switch (d) {
                  case 'fail': return 'Not delivered: ';
                  case 'good': return 'Good enough: ';
                  case 'perfect': return 'Perfect: ';
                  default: return '';
                }
              },
              shape: {
                fillColor: (e) => { return chartColors[e.sortIndex] },
              }
            }]}
          />
        </Chart>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle, useEuiTheme } from '@elastic/eui';
import { Chart, Datum, Partition, PartitionLayout, Settings } from '@elastic/charts';

import { Database } from '../types/database';
import { useCustomStyle } from '../hooks/useCustomStyle';

type OrderSuccessType = Database['public']['Functions']['fn_get_ratio_success_deliveries']['Returns'];

export const OrderRatio = ({ orderData }: { orderData: OrderSuccessType[] }) => {
  const { euiTheme } = useEuiTheme();
  const { chartColors, titleStyle, subtitleStyle, numberStyle, taglineStyle } = useCustomStyle();

  const TIME_WINDOW_SECONDS = 120;

  return (
    <EuiFlexGroup wrap style={{ justifyContent: 'space-between' }}>
      <EuiFlexItem style={{ alignItems: 'flex-start', flexBasis: '180px', justifyContent: 'space-between' }}>
        <div>
          <EuiTitle css={titleStyle}><h3>Success ratio</h3></EuiTitle>
          <EuiText css={subtitleStyle}><span>Ratio of perfect / good pizzas in the last {TIME_WINDOW_SECONDS / 60} minutes</span></EuiText>
        </div>
        <div>
          {orderData.length ?
            <>
              <EuiText css={numberStyle}><span>{Math.round((orderData.filter(c => c.label === 'Perfect')[0].percent))}%</span></EuiText>
              <EuiText css={taglineStyle}><span>{orderData.filter(c => c.label === 'Perfect')[0].ctorder} perfect deliveries of {orderData.reduce((prev, r) => prev + r.ctorder, 0)} orders</span></EuiText>
            </>
            :
            <>
              <EuiText css={numberStyle}><span>0%</span></EuiText>
              <EuiText css={taglineStyle}><span>No orders found</span></EuiText>
            </>
          }
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
            data={orderData}
            layout={PartitionLayout.sunburst}
            valueAccessor={(d: OrderSuccessType) => d.ctorder}
            valueFormatter={(d: number) => `${d} orders`}
            layers={[{
              groupByRollup: (d: OrderSuccessType) => d.label,
              nodeLabel: (d: Datum) => `${d}:`,
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
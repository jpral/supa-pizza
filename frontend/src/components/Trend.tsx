import { Chart, Axis, Position, ScaleType, AreaSeries, Settings } from "@elastic/charts";
import { EuiEmptyPrompt, EuiLoadingSpinner, EuiText, EuiTitle } from '@elastic/eui';
import { useQuery } from '@tanstack/react-query';
import { useCustomStyle } from '../hooks/useCustomStyle';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';

export const Trend = () => {
  const { titleStyle, subtitleStyle } = useCustomStyle();
  const INTERVAL_SECONDS = 15;
  const { chartColors } = useCustomStyle();
  type ResponseTimeSeries = Database['public']['Functions']['fn_get_timed_deliveries']['Returns'];

  const { isLoading, data } = useQuery<ResponseTimeSeries[], Error>(['timed_deliveries'], async () => {
    const { data, error } = await supabase.rpc('fn_get_timed_deliveries', { seconds: INTERVAL_SECONDS });
    if (error) {
      throw error;
    }
    return data as ResponseTimeSeries[];
  }, { refetchInterval: 10000 })

  const charProps = { size: { height: 250 } };

  if (isLoading) {
    return <EuiEmptyPrompt icon={<EuiLoadingSpinner size="m" />} />;
  }

  return (<>
    {data && <>
      <div>
        <EuiTitle css={titleStyle}><h3>Orders over time</h3></EuiTitle>
        <EuiText css={subtitleStyle}><span>An overview of the total number of orders in {INTERVAL_SECONDS} seconds intervals</span></EuiText>
      </div>
      <Chart {...charProps}>
        <Settings />
        <Axis id="cnt" title="Orders" position={Position.Left} />
        <Axis
          id="interval_alias"
          title="Date"
          position={Position.Bottom}
          tickFormat={(t) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(t * 1000))}
          labelFormat={(t) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(t * 1000))}
        />
        <AreaSeries
          id="area"
          name="Orders"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor="interval_alias"
          yAccessors={["count"]}
          color={chartColors[1]}
          data={data}
        />
      </Chart></>}
  </>
  )
}
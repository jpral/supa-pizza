import { Chart, Axis, Position, ScaleType, AreaSeries, Settings } from "@elastic/charts";
import { EuiEmptyPrompt, EuiLoadingSpinner } from '@elastic/eui';
import { useQuery } from '@tanstack/react-query';

import { Database } from '../types/database';
import { supabase } from '../utils/supabase';

export const Trend = () => {
  const INTERVAL_SECONDS = 10;

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

  return (
    <Chart {...charProps}>
      <Settings />
      <Axis id="cnt" title="count" position={Position.Left} />
      <Axis id="interval_alias" title="Date" position={Position.Bottom} showGridLines />
      <AreaSeries
        id="area"
        name="Orders"
        xScaleType={ScaleType.Time}
        xAccessor="interval_alias"
        yAccessors={["count"]}
        data={data!}
      />
    </Chart>
  )
}
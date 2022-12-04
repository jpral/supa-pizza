import { EuiFlexGroup, EuiFlexItem, EuiPage, EuiPanel } from '@elastic/eui';

import { Header } from './components/Header';
import { Trend } from './components/Trend'
import { OrderRatio } from './components/OrderRatio';
import { HappiestBelly } from './components/HappiestBelly';
import { PopularIngredients } from './components/PopularIngredients';
import { OrderGrid } from './components/OrderGrid';

export const App = () => {
  return (<>
    <Header />
    <EuiPage paddingSize='m'>

      <EuiFlexGroup wrap style={{ width: '100%' }}>
        <EuiFlexItem>
          <EuiPanel>
            <OrderRatio />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <HappiestBelly />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <PopularIngredients />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem style={{ minWidth: '100%' }}>
          <EuiPanel>
            <Trend />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem style={{ minWidth: '100%' }}>
          <EuiPanel>
            <OrderGrid />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPage>
  </>
  )
};
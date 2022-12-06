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
        <EuiFlexItem style={{ minWidth: '30%' }}>
          <EuiPanel hasShadow={false} hasBorder={true}>
            <OrderRatio />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem style={{ minWidth: '30%' }}>
          <EuiPanel hasShadow={false} hasBorder={true}>
            <HappiestBelly />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem style={{ minWidth: '30%' }}>
          <EuiPanel hasShadow={false} hasBorder={true}>
            <PopularIngredients />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel hasShadow={false} hasBorder={true}>
            <Trend />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel hasShadow={false} hasBorder={true}>
            <OrderGrid />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPage>
  </>
  )
};
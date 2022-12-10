import { EuiFlexGroup, EuiFlexItem, EuiPage, EuiPanel, EuiTitle, useEuiFontSize, useEuiTheme } from '@elastic/eui';

import { Header } from './components/Header';
import { Trend } from './components/Trend'
import { OrderRatioContainer } from './components/OrderRatioContainer';
import { HappiestBelly } from './components/HappiestBelly';
import { PopularIngredients } from './components/PopularIngredients';
import { OrderGrid } from './components/OrderGrid';
import { css } from '@emotion/react';
import { useCustomStyle } from './hooks/useCustomStyle';
import { useOwnerData } from './hooks/useOwnerData';

export const App = () => {
  const { isLoading: ownerLoading, data: ownerData } = useOwnerData();
  const { chartColors } = useCustomStyle();
  const { euiTheme } = useEuiTheme();

  const greetingStyle = css`
    padding: ${euiTheme.size.l};
    ${useEuiFontSize('xl')};
    color: ${euiTheme.colors.lightestShade};
    font-weight: ${euiTheme.font.weight.medium};
    letter-spacing: -0.02em;
  `
  const heroStyle = css`
    margin-top: 10px;
    margin-bottom: 20px;
    width: 100%;
  `

  const pageStyle = css`
    background-image: linear-gradient(45deg, ${chartColors[0]}, ${chartColors[1]});
    background-position: top center;
    background-size: 100% 200px;
    background-repeat: no-repeat;
    padding: ${euiTheme.size.l};
  `

  return (<>
    <Header />
    <EuiPage css={pageStyle}>
      <EuiFlexGroup wrap style={{ width: '100%' }}>
        <EuiFlexItem css={heroStyle}>
          <EuiTitle css={greetingStyle}>
            <h3>{ownerLoading ? 'Loading...' : `Welcome back, ${ownerData?.name}`}</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem style={{ minWidth: '30%' }}>
          <EuiPanel hasShadow={false} hasBorder={true}>
            <OrderRatioContainer />
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
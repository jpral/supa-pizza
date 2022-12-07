import { EuiAvatar, EuiHeader, EuiHeaderLogo, EuiHeaderSection, EuiHeaderSectionItem } from '@elastic/eui'
import PizzaLogo from '../assets/logo.svg'
export const Header = () => {
  return <EuiHeader theme='dark'>
    <EuiHeaderSection>
      <EuiHeaderSectionItem>
        <EuiHeaderLogo iconType={PizzaLogo}>Pi • za</EuiHeaderLogo>
      </EuiHeaderSectionItem>
    </EuiHeaderSection>
    <EuiHeaderSection side="right">
      <EuiHeaderSectionItem css={{ gap: '10px', color: 'white' }}>
        <span>Proud Owner</span>
        <EuiAvatar name='Proud Owner' />
      </EuiHeaderSectionItem>
    </EuiHeaderSection>
  </EuiHeader>;
}
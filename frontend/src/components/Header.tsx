import { EuiAvatar, EuiHeader, EuiHeaderLogo, EuiHeaderSection, EuiHeaderSectionItem } from '@elastic/eui'
import PizzaLogo from '../assets/logo.svg'
import { useOwnerData } from '../hooks/useOwnerData';

export const Header = () => {
  const { data } = useOwnerData();
  return <EuiHeader theme='dark'>
    <EuiHeaderSection>
      <EuiHeaderSectionItem>
        <EuiHeaderLogo iconType={PizzaLogo}>Pi • za</EuiHeaderLogo>
      </EuiHeaderSectionItem>
    </EuiHeaderSection>
    <EuiHeaderSection side="right">
      <EuiHeaderSectionItem css={{ gap: '10px', color: 'white' }}>
        {data && <>
          <span>{data.name} {data.surname}</span>
          <EuiAvatar imageUrl={data.avatar_url} name={`${data.name} ${data.surname}`} />
        </>
        }
      </EuiHeaderSectionItem>
    </EuiHeaderSection>
  </EuiHeader>;
}
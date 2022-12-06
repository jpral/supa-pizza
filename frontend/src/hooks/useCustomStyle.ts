import { useEuiTheme, useEuiFontSize } from '@elastic/eui';
import { css } from '@emotion/react';

export const useCustomStyle = () => {
  const { euiTheme } = useEuiTheme();

  const titleStyle = css`
    ${useEuiFontSize('l')};
    color: ${euiTheme.colors.text};
    font-weight: ${euiTheme.font.weight.semiBold};
    letter-spacing: -0.03em;
    margin-bottom: ${euiTheme.size.xs};
  `;

  const subtitleStyle = css`
    ${useEuiFontSize('s')};
    color: ${euiTheme.colors.subduedText};
    font-weight: ${euiTheme.font.weight.regular};
    letter-spacing: -0.01em;
  `;

  const numberStyle = css`
    ${useEuiFontSize('xxl')};
    font-weight: ${euiTheme.font.weight.bold};
    letter-spacing: -0.04em;
    margin-bottom: ${euiTheme.size.xs};
    margin-top: ${euiTheme.size.xs};
  `;

  const taglineStyle = css`
    ${useEuiFontSize('xs')};
    font-weight: ${euiTheme.font.weight.medium};
    color: ${euiTheme.colors.subduedText};
  `;

  const chartColors = ['#2D3862', '#59499A', '#BBAFEC']

  return {
    chartColors,
    titleStyle,
    subtitleStyle,
    numberStyle,
    taglineStyle
  }
}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from "@testing-library/react";
import { OrderRatio } from '../components/OrderRatio';
import { Database } from '../types/database';

type OrderSuccessType = Database['public']['Functions']['fn_get_ratio_success_deliveries']['Returns'];

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockedData: OrderSuccessType[] = [{
  label: 'Perfect',
  delivery_status: 'delivered',
  percent: 75,
  ctorder: 25
}];

describe('Success ratio component', () => {
  it('Includes a title', async () => {
    render(<OrderRatio orderData={[]} />, { wrapper })
    expect(screen.getByText(/success ratio/i)).toBeInTheDocument();
  });
  it('shows an empty state when no data was found', async () => {
    render(<OrderRatio orderData={[]} />, { wrapper })
    expect(screen.getByText(/0%/i)).toBeInTheDocument();
    expect(screen.getByText(/no orders found/i)).toBeInTheDocument();
  });

  it('shows the right percentage when perfect orders are found', async () => {
    render(<OrderRatio orderData={mockedData} />, { wrapper })
    expect(screen.getByText(/%/i)).toHaveTextContent(`${mockedData[0].percent}%`);
  });
})
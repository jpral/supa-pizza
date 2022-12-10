import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from "@testing-library/react";
import { Header } from '../components/Header';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Header component', () => {
  it('Shows an avatar with the user component', async () => {
    render(<Header />, { wrapper })
    expect(await screen.findByText(/Pi.*za/)).toBeInTheDocument();
  })
  it('Shows the name and surname of the owner', async () => {
    render(<Header />, { wrapper })
    expect(await screen.findByText(/proud owner/i)).toBeInTheDocument();
  })
});
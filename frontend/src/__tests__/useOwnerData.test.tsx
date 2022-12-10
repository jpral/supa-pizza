
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from "@testing-library/react";
import { useOwnerData } from '../hooks/useOwnerData';

import nock from 'nock';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "accept-profile,apikey,authorization,x-client-info",
};
const mockResultData = { id: 1, name: 'John', surname: 'Smith' };

describe('useOwnerData hook', () => {

  it('throws when a request fails', async () => {
    nock(/localhost/)
      .intercept(/rest/, "OPTIONS")
      .reply(200, undefined, corsHeaders)
      .get(/rest/)
      .reply(500, undefined, corsHeaders);
    const { result } = renderHook(() => useOwnerData(), { wrapper });
    await waitFor(() => { return expect(result.current.failureCount).toBe(1) });
    expect(useOwnerData).toThrow();
  });

  it('returns client data when a request is successful', async () => {
    nock(/localhost/)
      .intercept(/rest/, "OPTIONS")
      .reply(200, undefined, corsHeaders)
      .get(/rest/)
      .reply(200, [mockResultData], corsHeaders);
    const { result } = renderHook(() => useOwnerData(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject(mockResultData);
  });

})
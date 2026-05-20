import { renderHook, waitFor } from '@testing-library/react-native';
import { useHealthCheck, HealthResponse } from './health';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Create a fresh QueryClient for each test to avoid state leakage
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
        retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('useHealthCheck', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches health status successfully', async () => {
        const mockData: HealthResponse = { status: 'ok', db: 'connected' };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const { result } = renderHook(() => useHealthCheck(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        
        expect(result.current.data).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/health'));
    });
});
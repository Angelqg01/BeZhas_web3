// AppWithWeb3.jsx - wagmi 3.x compatible (Optimizado)
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './App';
import { config } from './lib/web3/wagmiConfig';
// Web3Modal ya está inicializado en wagmiConfig.js

// QueryClient optimizado
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
            gcTime: 300_000,
        },
    },
});

function AppWithWeb3() {
    // NO limpiar cache - permitir reconexión suave sin bloquear UI
    // La reconexión ocurre en background sin afectar la carga inicial

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default AppWithWeb3;

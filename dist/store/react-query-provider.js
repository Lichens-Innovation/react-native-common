import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
export const queryClient = new QueryClient();
export const TanstackQueryProvider = ({ children }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
//# sourceMappingURL=react-query-provider.js.map
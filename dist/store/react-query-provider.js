import { jsx as _jsx } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
export const queryClient = new QueryClient();
export const TanstackQueryProvider = ({ children }) => {
    return _jsx(QueryClientProvider, { client: queryClient, children: children });
};
//# sourceMappingURL=react-query-provider.js.map
export interface DiscoveredDevice {
    fullName: string;
    name: string;
    host: string;
    port: number;
    addresses: string[];
    txt: Record<string, string>;
}

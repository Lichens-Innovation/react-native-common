declare module 'react-native-zeroconf' {
  interface ZeroconfDevice {
    name: string;
    host: string;
    port: number;
    addresses: string[];
    txt: Record<string, string>;
  }

  class Zeroconf {
    constructor();
    scan(type: string, protocol: string, domain?: string): void;
    stop(): void;
    on(event: 'start' | 'stop' | 'found' | 'remove' | 'error' | 'resolved', callback: (data: any) => void): void;
    removeDeviceListeners(): void;
  }

  export default Zeroconf;
} 
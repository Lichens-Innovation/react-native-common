export interface DiscoveredDevice {
  fullName: string; // full name of the device
  name: string; // name of the device
  host: string; // host address of the device
  port: number; // port number the device is listening on
  addresses: string[]; // list of IP addresses associated with the device
  txt: Record<string, string>; // additional text records associated with the device
}

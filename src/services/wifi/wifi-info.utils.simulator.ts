import { sleep } from '@lichens-innovation/ts-common';

import { WifiInfo } from './wifi-info.types';

const randomIpSegment = () => Math.floor(Math.random() * 255);
const randomLanIp = () => `192.168.${randomIpSegment()}.${randomIpSegment()}`;

export const fetchWifiInfosSimulator = async (): Promise<WifiInfo> => {
  await sleep(Math.random() * 100);

  const randomNumber = Math.floor(Math.random() * 100);

  return {
    signalStrength: randomNumber,
    ssid: `Simulated WiFi ${randomNumber}`,
    ip: randomLanIp(),
  };
};

export const fetchAvailableWifiListSimulator = async (): Promise<WifiInfo[]> => {
  await sleep(Math.random() * 100);

  const numberOfNetworks = Math.floor(Math.random() * 30) + 2;
  const networks = Array.from({ length: numberOfNetworks }, (_, index) => ({
    ssid: `Simulated WiFi ${index + 1}`,
    signalStrength: Math.floor(Math.random() * 100),
    ip: randomLanIp(),
  }));

  return networks;
};

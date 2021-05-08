import { INetworkDevice } from './config';

export const ANY_SENSOR: INetworkDevice = {
  name: 'Any',
  ip: '',
  mac: '00:00:00:00:00:01',
};

export const NONE_SENSOR: INetworkDevice = {
  name: 'None',
  ip: '',
  mac: '00:00:00:00:00:00',
};

export const DEFAULT_POLLING_INTERVAL = 60 * 5 * 1000; // 5 minutes

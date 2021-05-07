import { INetworkDevice } from './broker/broker-config';

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

import { PlatformConfig } from 'homebridge';
import { IClientOptions } from 'mqtt';

export interface INetworkDevices {
    name: string;
    ip: string;
    mac: string;
}

export interface IBrokerConfig extends PlatformConfig {
    brokerClientOptions?: IClientOptions;
    devices?: INetworkDevices;
}

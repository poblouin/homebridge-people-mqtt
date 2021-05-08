import { PlatformConfig } from 'homebridge';
import { IClientOptions } from 'mqtt';

export interface INetworkDevice {
    name: string;
    ip: string;
    mac: string;
}

export interface IPeopleMqttConfig extends PlatformConfig {
    brokerClientOptions?: IClientOptions;
    devices?: Array<INetworkDevice>;
    enableAnySensor?: boolean;
    enableNoneSensor?: boolean;
    pollingIntervalMs?: number;
}

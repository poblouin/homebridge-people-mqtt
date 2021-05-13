<p align="center">
    <img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">
</p>

# Homebridge People MQTT plugin

[![npm version](https://img.shields.io/npm/v/@poblouin/homebridge-people-mqtt)](https://www.npmjs.com/package/@poblouin/homebridge-people-mqtt) [![npm downloads](https://img.shields.io/npm/dt/@poblouin/homebridge-people-mqtt)](https://www.npmjs.com/package/@poblouin/homebridge-people-mqtt) [![Build and Lint](https://github.com/poblouin/homebridge-people-mqtt/actions/workflows/build.yml/badge.svg)](https://github.com/poblouin/homebridge-people-mqtt/actions/workflows/build.yml)

This plugin is used to detect occupancy using network devices like phones, watches and others. It syncs the state in a MQTT broker.

This is for my personnal use, but I let the repo public if it could be of use to someone else.

## Config

You'll find the most up to date config in `src/config.ts`.

This is the basic config you should provide to this plugin to work.

```js
interface INetworkDevice {
    name: string;
    ip: string;
    mac: string;
}

interface IPeopleMqttConfig extends PlatformConfig {
    brokerClientOptions: IClientOptions;
    devices: Array<INetworkDevice>;
    enableAnySensor?: boolean; // defaults to false
    enableNoneSensor?: boolean; // defaults to false
    pollingIntervalMs?: number; // defaults to 5 minutes
}
```

Note: You will find the IClientOptions [on the MQTT library's documentation](https://github.com/mqttjs/MQTT.js/#mqttclientstreambuilder-options)

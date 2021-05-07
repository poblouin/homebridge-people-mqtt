import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { PeopleMqttAccessory } from './platformAccessory';
import { BrokerClient } from './broker/broker-client';
import { INetworkDevice, IPeopleMqttConfig } from './broker/broker-config';
import { ANY_SENSOR, NONE_SENSOR } from './constants';


export class HomebridgePeopleMqtt implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly brokerClient: BrokerClient;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: IPeopleMqttConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // Initialize the broker client's connection
    this.brokerClient = new BrokerClient(config.brokerClientOptions, this.log);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');

      // Remove all devices that were removed from the config.
      this.removeDevices(config.devices);

      // Discover new devices or load from cache
      this.discoverDevices(config);
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices(config: IPeopleMqttConfig) {
    if (!config.devices) {
      this.log.info('INFO: No devices to register, did you forgot to add them in the config?');
      return;
    }

    const devicesList = [
      ...config.devices,
      ...(config.enableAnySensor ? [ANY_SENSOR] : []),
      ...(config.enableNoneSensor ? [NONE_SENSOR] : []),
    ];

    devicesList.forEach(device => {
      const uuid = this.api.hap.uuid.generate(device.mac);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
      const pingIPs = device.ip === '' ? config.devices?.map(device => device.ip) : [device.ip];

      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        // Keep the IP address in sync with the config
        existingAccessory.context.device = device;
        this.api.updatePlatformAccessories([existingAccessory]);

        // Create platform accessory
        new PeopleMqttAccessory(this, existingAccessory, pingIPs);
      } else {
        this.log.info('Adding new accessory:', device.name);

        // create a new accessory
        const accessory = new this.api.platformAccessory(device.name, uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        accessory.context.device = device;

        // create the accessory handler for the newly create accessory
        // this is imported from `platformAccessory.ts`
        new PeopleMqttAccessory(this, accessory, pingIPs);

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    });
  }

  removeDevices(devices: Array<INetworkDevice> | undefined) {
    if (!devices) {
      return;
    }

    const devicesUUID = devices.map(device => this.api.hap.uuid.generate(device.mac));
    const accessoriesToRemove = this.accessories.filter(accessory => !devicesUUID.includes(accessory.UUID));

    accessoriesToRemove.forEach(accessory => {
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.log.info('Removing existing accessory from cache:', accessory.displayName);
    });
  }
}

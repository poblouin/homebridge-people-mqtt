import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import ping from 'ping';

import { ANY_SENSOR, NONE_SENSOR } from './constants';
import { HomebridgePeopleMqtt } from './platform';
import { PLUGIN_NAME } from './settings';

export class PeopleMqttAccessory {
  private ipList: Array<string>;
  private service: Service;
  private state: number;
  private topic: string;

  constructor(
    private readonly platform: HomebridgePeopleMqtt,
    private readonly accessory: PlatformAccessory,
    private readonly pingIPs: Array<string> | undefined,
  ) {
    this.ipList = this.pingIPs || [];
    this.state = this.platform.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED;
    this.topic = `${PLUGIN_NAME}/${this.accessory.displayName}`;

    // Init OccupancySensor Service
    this.service =
      this.accessory.getService(this.platform.Service.OccupancySensor) ||
      this.accessory.addService(this.platform.Service.OccupancySensor);

    // Init handlers
    this.service
      .getCharacteristic(this.platform.Characteristic.OccupancyDetected)
      .onGet(this.handleOccupancyDetectedGet.bind(this))
      .onSet(this.handleOccupancyDetectedSet.bind(this));

    // Init broker subscription
    this.platform.brokerClient.subscribe(this.topic, (err) => {
      if (err) {
        this.platform.log.error(
          `Error with broker subscription: ${err}`,
        );
        return;
      }

      this.publishState();
    });

    // Init onMessage handler
    this.platform.brokerClient.onEvent('message', (topic, message) => {
      if (topic === this.topic) {
        const parsedMessage = JSON.parse(message);

        if (this.state !== parsedMessage.state) {
          this.state = parsedMessage.state;
          this.service.setCharacteristic(this.platform.Characteristic.OccupancyDetected, this.state);
        }
      }
    });

    // Init ping interval
    setInterval(() => this.publishState(), 15000);
  }

  handleOccupancyDetectedGet() {
    this.platform.log.debug('Triggered GET OccupancyDetected');

    return this.service.getCharacteristic(
      this.platform.Characteristic.OccupancyDetected,
    ).value;
  }

  handleOccupancyDetectedSet(value: CharacteristicValue) {
    this.platform.log.debug(
      `Triggered SET OccupancyDetected with value ${value}`,
    );

    this.service.updateCharacteristic(
      this.platform.Characteristic.OccupancyDetected,
      value,
    );
  }

  async isDeviceAlive() {
    this.platform.log.debug(`Pinging IP(s) ${this.ipList}`);
    const allRes = await Promise.all(
      this.ipList.map(ip => ping.promise.probe(ip)),
    );

    this.platform.log.debug(`Ping result = ${allRes.map(res => res.alive)}`);

    if (this.accessory.displayName === ANY_SENSOR.name) {
      return allRes.some(res => res.alive);
    } else if (this.accessory.displayName === NONE_SENSOR.name) {
      return allRes.every(res => !res.alive);
    }

    return allRes[0].alive;
  }

  async publishState() {
    const state = (await this.isDeviceAlive())
      ? this.platform.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
      : this.platform.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED;

    if (state === this.state) {
      this.platform.log.debug(`State is still the same for ${this.accessory.displayName} == ${this.state}`);
      return;
    }

    this.platform.brokerClient.publish(
      this.topic,
      JSON.stringify({
        name: this.accessory.context.device.name,
        ip: this.accessory.context.device.ip,
        state,
      }),
    );
  }
}

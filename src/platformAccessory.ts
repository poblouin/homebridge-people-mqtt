import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import ping from 'ping';

import { HomebridgePeopleMqtt } from './platform';

export class PeopleMqttAccessory {
  private service: Service;

  constructor(
    private readonly platform: HomebridgePeopleMqtt,
    private readonly accessory: PlatformAccessory,
  ) {
    // Init OccupancySensor Service
    this.service =
      this.accessory.getService(this.platform.Service.OccupancySensor) ||
      this.accessory.addService(this.platform.Service.OccupancySensor);

    // Init handlers
    this.service
      .getCharacteristic(this.platform.Characteristic.OccupancyDetected)
      .onGet(this.handleOccupancyDetectedGet.bind(this))
      .onSet(this.handleOccupancyDetectedSet.bind(this));

    // Init ping interval
    setInterval(async () => {
      const res = await ping.promise.probe(this.accessory.context.device.ip, {
        timeout: 5,
      });

      this.service.setCharacteristic(this.platform.Characteristic.OccupancyDetected, res?.alive);
    }, 50000);
  }

  handleOccupancyDetectedGet() {
    this.platform.log.debug('Triggered GET OccupancyDetected');

    return this.service.getCharacteristic(this.platform.Characteristic.OccupancyDetected).value;
  }

  handleOccupancyDetectedSet(value: CharacteristicValue) {
    this.platform.log.debug(
      `Triggered SET OccupancyDetected with value ${value}`,
    );

    this.service.updateCharacteristic(
      this.platform.Characteristic.OccupancyDetected,
      this.platform.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED,
    );
  }
}

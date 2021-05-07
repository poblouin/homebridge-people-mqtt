import { Logger } from 'homebridge';
import { IClientOptions, MqttClient, connect } from 'mqtt';

export class BrokerClient {
  private brokerClient: MqttClient;
  private log: Logger;

  constructor(config: IClientOptions | undefined, log: Logger) {
    this.brokerClient = connect(null, config);
    this.log = log;
  }

  connected() {
    return this.brokerClient.connected;
  }

  publish(topic: string, message: string | Buffer) {
    this.log.info(`Publishing message ${message} on topic ${topic}`);
    this.brokerClient.publish(topic, message);
  }

  subscribe(topic: string, cb) {
    this.log.debug(`Subscribing on topic ${topic}`);
    this.brokerClient.subscribe(topic, { qos: 0 }, cb);
  }

  onEvent(event: string, cb) {
    this.log.debug(`Registring callback for event ${event}`);
    this.brokerClient.on(event, cb);
  }
}

import { Logger } from 'homebridge';
import { IClientOptions, MqttClient, connect } from 'mqtt';

export class BrokerClient {
  private brokerClient: MqttClient;
  private log: Logger;

  constructor(config: IClientOptions | undefined, log: Logger) {
    this.brokerClient = connect('mqtt://test.mosquitto.org');
    this.log = log;

    this.initClient();
  }

  connected() {
    return this.brokerClient.connected;
  }

  private initClient() {
    this.brokerClient.on('connect', () => {
      this.log.info('INFO: Broker Client connected');
      // this.brokerClient.subscribe('presence', (err) => {
      //   if (!err) {
      //     this.brokerClient.publish('presence', 'Hello mqtt');
      //   }
      // });
    });

    // this.brokerClient.on('message', (topic, message) => {
    //   // message is Buffer
    //   console.log(message.toString());
    //   // this.brokerClient.end();
    // });
  }

}

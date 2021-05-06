import { MqttClient, connect } from 'mqtt';
import { IBrokerConfig } from './broker-config';


export class BrokerClient {
  private brokerClient: MqttClient;

  constructor(config: IBrokerConfig) {
    console.log(config.test);
    this.brokerClient = connect('mqtt://test.mosquitto.org');

    // this.initClient();
  }

  connected() {
    return this.brokerClient.connected;
  }

  private initClient() {
    this.brokerClient.on('connect', () => {
      this.brokerClient.subscribe('presence', (err) => {
        if (!err) {
          this.brokerClient.publish('presence', 'Hello mqtt');
        }
      });
    });

    this.brokerClient.on('message', (topic, message) => {
      // message is Buffer
      console.log(message.toString());
      // this.brokerClient.end();
    });
  }

}

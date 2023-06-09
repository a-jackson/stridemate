import { inject, injectable } from 'inversify';
import { Client, connect } from 'mqtt';
import { Config } from '../config';
import Types from '../types';

export interface Location {
  user: string;
  device: string;
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  velocity: number;
  time: Date;
}

export type OnLocationCallback = (location: Location) => void;

export interface Mqtt {
  connect(): void;
  onLocation(callback: OnLocationCallback): void;
}

@injectable()
export class MqttClient implements Mqtt {
  private client?: Client;
  private callbacks: OnLocationCallback[] = [];
  private lastLocation?: Location;

  constructor(@inject(Types.Config) private config: Config) {}

  public connect() {
    this.client = connect(this.config.mqtt.url, {
      username: this.config.mqtt.user,
      password: this.config.mqtt.password,
    });

    this.client.subscribe(`${this.config.mqtt.baseTopic}/+/+`, {
      qos: 2,
    });

    this.client.on('message', (topic, payload) =>
      this.onMessage(topic, payload),
    );

    console.log('connected');
  }

  public onLocation(callback: OnLocationCallback) {
    this.callbacks.push(callback);
  }

  private onMessage(topic: string, payload: Buffer) {
    const parts = topic.split('/');
    const user = parts[1];
    const device = parts[2];
    const message = JSON.parse(payload.toString());

    if (message._type !== 'location') {
      return;
    }

    const time = new Date(message.tst * 1000);

    const location: Location = {
      user,
      device,
      time,
      accuracy: message.acc,
      altitude: message.alt,
      latitude: message.lat,
      longitude: message.lon,
      velocity: message.vel,
    };

    if (
      this.lastLocation &&
      this.lastLocation.time.getTime() === location.time.getTime()
    ) {
      return;
    }

    this.lastLocation = location;

    this.callbacks.forEach(callback => {
      callback(location);
    });
  }
}

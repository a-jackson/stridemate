import { injectable } from 'inversify';

@injectable()
export class EnvConfig implements Config {
  public readonly mqtt: Mqtt;
  public readonly databaseUrl: string;

  constructor() {
    this.mqtt = {
      url: process.env.MQTT_URL,
      user: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD,
      baseTopic: process.env.MQTT_BASE_TOPIC || 'owntracks',
    };

    if (!this.mqtt.url) {
      throw new Error('MQTT_URL not specified');
    }

    this.databaseUrl = process.env.DATABASE_URL;

    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL not specified');
    }
  }
}

export interface Mqtt {
  readonly url: string;
  readonly baseTopic: string;
  readonly user?: string;
  readonly password?: string;
}

export interface Config {
  readonly mqtt: Mqtt;
  readonly databaseUrl: string;
}

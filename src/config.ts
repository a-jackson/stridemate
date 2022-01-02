import { injectable } from 'inversify';

@injectable()
export class EnvConfig implements Config {
  public readonly mqtt: Mqtt;
  public readonly database: Database;
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

    this.database = {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      name: process.env.POSTGRES_DB,
      port: parseInt(process.env.POSTGRES_PORT) ?? 5432,
    };

    this.databaseUrl = `postgres://${this.database.user}:${this.database.password}@${this.database.host}:${this.database.port}/${this.database.name}`;
  }
}

export interface Mqtt {
  readonly url: string;
  readonly baseTopic: string;
  readonly user?: string;
  readonly password?: string;
}

export interface Database {
  readonly host: string;
  readonly user: string;
  readonly password: string;
  readonly name: string;
  readonly port: number;
}

export interface Config {
  readonly mqtt: Mqtt;
  readonly database: Database;
  readonly databaseUrl: string;
}

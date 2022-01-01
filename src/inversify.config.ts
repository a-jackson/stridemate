import { Container } from 'inversify';
import 'reflect-metadata';
import { Config, EnvConfig } from './config';
import { Mqtt, MqttClient } from './mqtt';
import Types from './types';

const container = new Container();

container.bind<Config>(Types.Config).to(EnvConfig).inSingletonScope();
container.bind<Mqtt>(Types.Mqtt).to(MqttClient).inSingletonScope();

export { container };

import { Container } from 'inversify';
import 'reflect-metadata';
import { Config, EnvConfig } from './config';
import {
  ConnectionManager,
  ConnectionManagerImpl,
} from './data/connection-manager';
import {
  DeviceRepository,
  DeviceRepositoryImpl,
} from './data/device-repository';
import {
  LocationRepository,
  LocationRepositoryImpl,
} from './data/location-repository';
import { UserRepository, UserRepositoryImpl } from './data/user-repository';
import { Mqtt, MqttClient } from './mqtt/mqtt';
import TYPES from './types';

const container = new Container();

container.bind<Config>(TYPES.Config).to(EnvConfig).inSingletonScope();
container.bind<Mqtt>(TYPES.Mqtt).to(MqttClient).inSingletonScope();
container
  .bind<ConnectionManager>(TYPES.ConnectionManager)
  .to(ConnectionManagerImpl)
  .inRequestScope();
container
  .bind<UserRepository>(TYPES.UserRepository)
  .to(UserRepositoryImpl)
  .inTransientScope();
container
  .bind<DeviceRepository>(TYPES.DeviceRepository)
  .to(DeviceRepositoryImpl)
  .inTransientScope();
container
  .bind<LocationRepository>(TYPES.LocationRepository)
  .to(LocationRepositoryImpl)
  .inTransientScope();

export { container };

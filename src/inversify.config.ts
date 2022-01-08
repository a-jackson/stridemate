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
import {
  UnitOfWorkFactory,
  UnitOfWorkFactoryImpl,
  UnitOfWorkImpl,
} from './data/unit-of-work';
import { UserRepository, UserRepositoryImpl } from './data/user-repository';
import { Mqtt, MqttClient } from './mqtt/mqtt';
import { SaveLocations, SaveLocationsImpl } from './save-locations';
import { DataTracker } from './tracking/data-tracker';
import { Tracker, TrackerImpl } from './tracking/tracker';
import {
  TrackerStateMachine,
  TrackerStateMachineImpl,
} from './tracking/tracker-state-machine';
import TYPES from './types';

const container = new Container();

container.bind<Config>(TYPES.Config).to(EnvConfig).inSingletonScope();
container.bind<Mqtt>(TYPES.Mqtt).to(MqttClient).inSingletonScope();
container
  .bind<ConnectionManager>(TYPES.ConnectionManager)
  .to(ConnectionManagerImpl)
  .inSingletonScope();
container
  .bind<UnitOfWorkFactory>(TYPES.UnitOfWorkFactory)
  .to(UnitOfWorkFactoryImpl)
  .inSingletonScope();
container
  .bind<UnitOfWorkImpl>(TYPES.UnitOfWork)
  .to(UnitOfWorkImpl)
  .inTransientScope();
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
container
  .bind<SaveLocations>(TYPES.SaveLocations)
  .to(SaveLocationsImpl)
  .inSingletonScope();
container
  .bind<TrackerStateMachine>(TYPES.TrackerStateMachine)
  .to(TrackerStateMachineImpl)
  .inRequestScope();
container.bind<Tracker>(TYPES.Tracker).to(TrackerImpl).inSingletonScope();
container.bind<DataTracker>(TYPES.DataTracker).to(DataTracker).inRequestScope();

export { container };

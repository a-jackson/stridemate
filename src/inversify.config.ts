import { Container } from 'inversify';
import 'reflect-metadata';
import { Config, EnvConfig } from './config';
import {
  ConnectionManager,
  ConnectionManagerImpl,
} from './data/connection-manager';
import { UnitOfWorkFactory, UnitOfWorkFactoryImpl } from './data/unit-of-work';
import { Mqtt, MqttClient } from './mqtt/mqtt';
import { SaveLocations, SaveLocationsImpl } from './tracking/save-locations';
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
  .bind<SaveLocations>(TYPES.SaveLocations)
  .to(SaveLocationsImpl)
  .inSingletonScope();
container
  .bind<TrackerStateMachine>(TYPES.TrackerStateMachine)
  .to(TrackerStateMachineImpl)
  .inRequestScope();
container.bind<Tracker>(TYPES.Tracker).to(TrackerImpl).inSingletonScope();

export { container };

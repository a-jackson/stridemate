import { config as loadDotenv } from 'dotenv';
import migrate, { RunnerOption } from 'node-pg-migrate';
import { Config } from './config';
import { container } from './inversify.config';
import { Mqtt } from './mqtt/mqtt';
import { SaveLocations } from './tracking/save-locations';
import { Tracker } from './tracking/tracker';
import TYPES from './types';

(async () => {
  loadDotenv();

  await migrate({
    databaseUrl: container.get<Config>(TYPES.Config).databaseUrl,
    dir: 'migrations',
    direction: 'up',
    migrationsTable: 'versions',
  } as RunnerOption);

  const saveLocations = container.get<SaveLocations>(TYPES.SaveLocations);
  saveLocations.start();

  const tracker = container.get<Tracker>(TYPES.Tracker);
  tracker.start();

  const mqtt = container.get<Mqtt>(TYPES.Mqtt);
  mqtt.connect();

  await import('./server');
})().catch(e => console.error(e));

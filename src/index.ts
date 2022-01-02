import { config as loadDotenv } from 'dotenv';
import migrate, { RunnerOption } from 'node-pg-migrate';
import { Config } from './config';
import { UserRepository } from './data/user-repository';
import { container } from './inversify.config';
import { Mqtt } from './mqtt/mqtt';
import TYPES from './types';

(async () => {
  loadDotenv();

  await migrate({
    databaseUrl: container.get<Config>(TYPES.Config).databaseUrl,
    dir: 'migrations',
    direction: 'up',
    migrationsTable: 'versions',
  } as RunnerOption);
  const mqtt = container.get<Mqtt>(TYPES.Mqtt);

  mqtt.onLocation(async location => {
    console.log(JSON.stringify(location));
    const userRepo = container.get<UserRepository>(TYPES.UserRepository);

    let user = await userRepo.getByName(location.user);
    if (!user) {
      user = await userRepo.insert({ name: location.user });
    }

    console.log(JSON.stringify(user));
  });

  mqtt.connect();
})().catch(e => console.error(e));

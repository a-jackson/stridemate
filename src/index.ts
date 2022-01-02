import { config as loadDotenv } from 'dotenv';
import migrate, { RunnerOption } from 'node-pg-migrate';
import { Config } from './config';
import { DeviceRepository } from './data/device-repository';
import { LocationRepository } from './data/location-repository';
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
    const deviceRepo = container.get<DeviceRepository>(TYPES.DeviceRepository);
    const locationRepo = container.get<LocationRepository>(
      TYPES.LocationRepository,
    );

    let user = await userRepo.getByName(location.user);
    if (!user) {
      user = await userRepo.insert({ name: location.user });
    }

    console.log(JSON.stringify(user));

    let device = await deviceRepo.getByName(location.device, user.userId);
    if (!device) {
      device = await deviceRepo.insert({
        name: location.device,
        userId: user.userId,
      });
    }

    console.log(JSON.stringify(device));

    await locationRepo.insert({
      deviceId: device.deviceId,
      latitude: location.lat,
      longitude: location.lon,
      altitude: location.alt,
      accuracy: location.acc,
      velocity: location.vel,
      time: location.time,
    });
  });

  mqtt.connect();
})().catch(e => console.error(e));

import { config as loadDotenv } from 'dotenv';
import migrate, { RunnerOption } from 'node-pg-migrate';
import { Config } from './config';
import { UnitOfWorkFactory } from './data/unit-of-work';
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

  const unitOfWorkFactory = container.get<UnitOfWorkFactory>(
    TYPES.UnitOfWorkFactory,
  );

  mqtt.onLocation(async location => {
    console.log(JSON.stringify(location));

    const unitOfWork = await unitOfWorkFactory.createUnitOfWork();
    await unitOfWork.complete(async () => {
      let user = await unitOfWork.userRepository.getByName(location.user);
      if (!user) {
        user = await unitOfWork.userRepository.insert({ name: location.user });
      }

      console.log(JSON.stringify(user));

      let device = await unitOfWork.deviceRepository.getByName(
        location.device,
        user.userId,
      );
      if (!device) {
        device = await unitOfWork.deviceRepository.insert({
          name: location.device,
          userId: user.userId,
        });
      }

      console.log(JSON.stringify(device));

      await unitOfWork.locationRepository.insert({
        deviceId: device.deviceId,
        latitude: location.lat,
        longitude: location.lon,
        altitude: location.alt,
        accuracy: location.acc,
        velocity: location.vel,
        time: location.time,
      });
    });
  });

  mqtt.connect();
})().catch(e => console.error(e));

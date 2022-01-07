import { config as loadDotenv } from 'dotenv';
import haversine from 'haversine';
import migrate, { RunnerOption } from 'node-pg-migrate';
import { Config } from './config';
import { UnitOfWorkFactory } from './data/unit-of-work';
import { container } from './inversify.config';
import { Location } from './models/location';
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

  // await findActivities2(unitOfWorkFactory);
})().catch(e => console.error(e));

const windowSizeMins = 10;
const boxSizeMeters = 20;

async function findActivities1(unitOfWorkFactory: UnitOfWorkFactory) {
  const unitOfWork = await unitOfWorkFactory.createUnitOfWork();

  let locations = await unitOfWork.locationRepository.getAll();
  locations = locations.filter(x => x.accuracy < 30);
  locations = locations.filter(
    (x, i) => i === 0 || locations[i - 1].time.getTime() !== x.time.getTime(),
  );
  const windowSize = windowSizeMins * 60 * 1000;
  let windowStart = 0;
  let activityStart = -1;
  for (let i = 1; i < locations.length - 1; i++) {
    const windowStartTime = locations[windowStart].time.getTime();

    // loop until the end of the window
    if (locations[i + 1].time.getTime() - windowStartTime < windowSize) {
      continue;
    }

    const windowEnd = i;
    if (windowStart === windowEnd) {
      windowStart++;
      continue;
    }

    const window = locations.slice(windowStart, windowEnd);
    const distance = getBoundingDistance(window);

    if (activityStart === -1) {
      if (distance < boxSizeMeters) {
        windowStart = i;
        continue;
      }

      // Find the first point in the window that extends it past 20m.
      for (let j = windowStart + 1; j <= windowEnd; j++) {
        const subWindow = locations.slice(windowStart, j);
        const subWindowDistance = getBoundingDistance(subWindow);
        if (subWindowDistance > boxSizeMeters) {
          activityStart = j;
          windowStart = j;
          break;
        }
      }
    } else {
      if (distance > boxSizeMeters) {
        windowStart = i;
        continue;
      }

      // Found activity!
      console.log(
        `Activity found: ${locations[activityStart].time} - ${locations[i].time}`,
      );
      activityStart = -1;
    }
  }
}

async function findActivities2(unitOfWorkFactory: UnitOfWorkFactory) {
  const unitOfWork = await unitOfWorkFactory.createUnitOfWork();

  let locations = await unitOfWork.locationRepository.getAll();
  locations = locations.filter(x => x.accuracy < 30);
  locations = locations.filter(
    (x, i) => i === 0 || locations[i - 1].time.getTime() !== x.time.getTime(),
  );
  const speeds = [];
  for (let i = 1; i < locations.length - 1; i++) {
    const last = locations[i - 1];
    const curr = locations[i];

    const distance = haversine(last, curr, { unit: 'meter' });
    const time = (curr.time.getTime() - last.time.getTime()) / 1000;
    const speed = distance / time;
    speeds.push({ time: curr.time, speed });
    console.log(`${curr.time.toISOString()},${speed}`);
  }
}

function getBoundingDistance(window: Location[]) {
  const min = {
    latitude: Math.min(...window.map(x => x.latitude)),
    longitude: Math.min(...window.map(x => x.longitude)),
  };
  const max = {
    latitude: Math.max(...window.map(x => x.latitude)),
    longitude: Math.max(...window.map(x => x.longitude)),
  };

  return haversine(min, max, { unit: 'meter' });
}

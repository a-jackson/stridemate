import haversine from 'haversine';
import { injectable } from 'inversify';
import { container } from '../inversify.config';
import { Location } from '../mqtt/mqtt';
import TYPES from '../types';
import { TrackerStateMachine } from './tracker-state-machine';

const MaxAccuracy = 30;

export interface Tracker {
  onLocation(location: Location): Promise<void>;
}

@injectable()
export class TrackerImpl implements Tracker {
  private readonly lastLocation: { [device: string]: Location } = {};
  private readonly stateMachines: { [device: string]: TrackerStateMachine } =
    {};

  public async onLocation(location: Location) {
    // Ignore low accuracy locations
    if (location.accuracy >= MaxAccuracy) {
      return;
    }

    const device = `${location.user}/${location.device}`;
    this.initialiseStateMachine(device, location);

    if (!this.lastLocation[device]) {
      this.lastLocation[device] = location;
      return;
    }

    const lastLocation = this.lastLocation[device];

    const timeDiff = location.time.getTime() - lastLocation.time.getTime();

    if (timeDiff <= 0) {
      // location is older than lastLocation so we're just going to ignore it
      return;
    }

    // lastLocation is older than a minute ago so we're going to assume we've been stationary since then
    // and just push through a 0 speed for every minute since.
    if (timeDiff > 60000) {
      await this.handleZeroMovement(lastLocation, location, device);
      return;
    }

    const speed = this.getSpeed(lastLocation, location);
    await this.stateMachines[device].newSpeed({
      speed: speed,
      time: location.time,
    });
  }

  private initialiseStateMachine(device: string, location: Location) {
    if (!this.stateMachines[device]) {
      this.stateMachines[device] = container.get<TrackerStateMachine>(
        TYPES.TrackerStateMachine,
      );
      this.stateMachines[device].setDevice(location.user, location.device);
    }
  }

  private async handleZeroMovement(
    lastLocation: Location,
    location: Location,
    device: string,
  ) {
    for (
      let time = lastLocation.time.getTime();
      time < location.time.getTime();
      time += 60000
    ) {
      await this.stateMachines[device].newSpeed({
        speed: 0,
        time: new Date(time),
      });
    }
    this.lastLocation[device] = location;
  }

  private getSpeed(lastLocation: Location, location: Location) {
    const distance = haversine(lastLocation, location, {
      unit: 'meter',
    });
    const timeDiff = location.time.getTime() - lastLocation.time.getTime();
    return distance / (timeDiff / 1000);
  }
}

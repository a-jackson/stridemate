import { CronJob } from 'cron';
import haversine from 'haversine';
import { inject, injectable } from 'inversify';
import { container } from '../inversify.config';
import { Location, Mqtt } from '../mqtt/mqtt';
import TYPES from '../types';
import { TrackerStateMachine } from './tracker-state-machine';

const MaxAccuracy = 30;

export interface Tracker {
  start(): void;
}

@injectable()
export class TrackerImpl implements Tracker {
  private job: CronJob;
  private readonly locations: { [device: string]: Location[] } = {};
  private readonly stateMachines: { [device: string]: TrackerStateMachine } =
    {};

  constructor(@inject(TYPES.Mqtt) private mqtt: Mqtt) {
    this.job = new CronJob('0 */1 * * * *', () => this.onTick());
  }

  public start() {
    this.mqtt.onLocation(x => this.onLocation(x));
    this.job.start();
  }

  private onLocation(location: Location) {
    if (location.accuracy < MaxAccuracy) {
      const device = `${location.user}/${location.device}`;
      if (!this.locations[device]) {
        this.locations[device] = [];
        this.stateMachines[device] = container.get<TrackerStateMachine>(
          TYPES.TrackerStateMachine,
        );
        this.stateMachines[device].setDevice(location.user, location.device);
      }
      this.locations[device].push(location);
    }
  }

  private onTick() {
    for (let device in this.locations) {
      const locations = this.locations[device];
      const averageSpeed =
        locations.length < 2 ? 0 : this.getAverageSpeed(locations);
      this.stateMachines[device].newSpeed({
        speed: averageSpeed,
        time: new Date(),
      });

      locations.length = 0;
    }
  }

  private getAverageSpeed(locations: Location[]) {
    if (locations.length < 2) {
      return 0;
    }

    let speedSum = 0;

    for (let i = 1; i < locations.length; i++) {
      const distance = haversine(locations[i - 1], locations[i], {
        unit: 'meter',
      });
      const timeDiff =
        locations[i].time.getTime() - locations[i - 1].time.getTime();
      speedSum += distance / (timeDiff / 1000);
    }

    return speedSum / (locations.length - 1);
  }
}

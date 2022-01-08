import haversine from 'haversine';
import { inject, injectable } from 'inversify';
import { UnitOfWorkFactory } from '../data/unit-of-work';
import { Location } from '../models/location';
import TYPES from '../types';
import { TrackerStateMachine } from './tracker-state-machine';

@injectable()
export class DataTracker {
  constructor(
    @inject(TYPES.UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(TYPES.TrackerStateMachine)
    private stateMachine: TrackerStateMachine,
  ) {}

  public async run() {
    const unitOfWork = await this.unitOfWorkFactory.createUnitOfWork();

    let locations = await unitOfWork.locationRepository.getAll();
    locations = locations.filter(x => x.accuracy < 30 && x.time.getDate() >= 3);

    let startTime = locations[0].time;
    const minuteLocations = [];
    for (let location of locations) {
      if (minuteLocations.length === 0) {
        startTime = location.time;
      }

      minuteLocations.push(location);
      if (location.time.getTime() < startTime.getTime() + 60000) {
        continue;
      }

      this.stateMachine.newSpeed({
        speed: this.getAverageSpeed(minuteLocations),
        time: location.time,
      });

      minuteLocations.length = 0;
    }

    console.log('complete');
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
      if (timeDiff > 0) {
        speedSum += distance / (timeDiff / 1000);
      }
    }

    return speedSum / (locations.length - 1);
  }
}

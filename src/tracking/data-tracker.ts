import { inject, injectable } from 'inversify';
import { UnitOfWorkFactory } from '../data/unit-of-work';
import TYPES from '../types';
import { Tracker } from './tracker';

// This the purpose of this is for debugging the activity tracker using
// previously saved data.
@injectable()
export class DataTracker {
  constructor(
    @inject(TYPES.UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(TYPES.Tracker)
    private tracker: Tracker,
  ) {}

  public async run() {
    const unitOfWork = await this.unitOfWorkFactory.createUnitOfWork();

    let locations = await unitOfWork.locationRepository.getTimeRange(
      new Date('2022-02-03T17:45:00Z'),
      new Date('2022-02-03T20:00:00Z'),
      1,
      30,
    );
    if (locations.length === 0) {
      return;
    }

    const user = `${new Date().getHours()}:${new Date().getMinutes()}`;

    for (const location of locations) {
      await this.tracker.onLocation({
        accuracy: location.accuracy,
        altitude: location.altitude,
        latitude: location.latitude,
        longitude: location.longitude,
        time: location.time,
        velocity: location.velocity,
        device: 'test',
        user: user,
      });
    }

    console.log('complete');
  }
}

import haversine from 'haversine';
import { inject, injectable } from 'inversify';
import { UnitOfWork, UnitOfWorkFactory } from '../data/unit-of-work';
import { Activity as DbActivity } from '../models/activity';
import { ActivityLocation } from '../models/activity-location';
import { Location } from '../mqtt/mqtt';
import TYPES from '../types';
import { KalmanFilter } from './kalman-filter';
import { Activity, Speed, State } from './states/base-state';
import { IdleState } from './states/idle-state';

export interface TrackerStateMachine {
  newLocation(location: Location): Promise<void>;
  setDevice(user: string, device: string): void;
}

type KalmanLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number;
  time: number;
};

@injectable()
export class TrackerStateMachineImpl implements TrackerStateMachine {
  private state: State;
  private user: string;
  private device: string;
  private currentActivityId?: number;
  private lastLocation?: KalmanLocation;
  private kalmanFilter: KalmanFilter;
  private activityLocations: KalmanLocation[] = [];

  constructor(
    @inject(TYPES.UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
  ) {
    this.state = new IdleState(
      async (activity, inProgress) =>
        await this.activityTracked(activity, inProgress),
    );

    this.kalmanFilter = new KalmanFilter(3);
  }

  public setDevice(user: string, device: string) {
    this.user = user;
    this.device = device;
  }

  public async newLocation(location: Location) {
    if (location.time.getTime() == this.kalmanFilter.timestamp) {
      return;
    }

    this.kalmanFilter.process(
      Number(location.latitude),
      Number(location.longitude),
      location.accuracy,
      location.time.getTime(),
    );

    const currentLocation = {
      latitude: this.kalmanFilter.latitude,
      longitude: this.kalmanFilter.longtiude,
      time: this.kalmanFilter.timestamp,
      accuracy: this.kalmanFilter.accuracy,
      altitude: location.altitude,
    } as KalmanLocation;

    this.activityLocations.push(currentLocation);

    if (this.lastLocation) {
      const timeDiff = currentLocation.time - this.lastLocation.time;
      if (timeDiff <= 0) {
        // location is older than lastLocation so we're just going to ignore it
        return;
      }

      // lastLocation is older than a minute ago so we're going to assume we've been stationary since then
      // and just push through a 0 speed for every minute since.
      if (timeDiff > 60000) {
        await this.handleZeroMovement(this.lastLocation, currentLocation);
        return;
      }

      const speed = {
        speed: this.getSpeed(this.lastLocation, currentLocation),
        time: location.time,
      } as Speed;

      if (isNaN(speed.speed)) {
        throw new Error(`Speed is NaN ${speed.time}`);
      }

      this.state = await this.state.newSpeed(speed);
    }

    this.lastLocation = currentLocation;
  }

  private async activityTracked(activity: Activity, inProgress: boolean) {
    if (!inProgress) {
      console.log(
        'Logged Activity: %s from %s to %s. Durations: %d min. Distance: %d km. Avg Speed: %d km/h',
        activity.name,
        activity.startTime.toISOString(),
        activity.endTime.toISOString(),
        (activity.durationSeconds / 60).toFixed(2),
        (activity.distanceM / 1000).toFixed(2),
        (activity.avgSpeedMpS * 3.6).toFixed(2),
      );
    }

    await this.saveActivity(activity, inProgress);
  }

  private async saveActivity(activity: Activity, inProgress: boolean) {
    await this.unitOfWorkFactory.execute(async unitOfWork => {
      let device = await this.getDevice(unitOfWork);

      const newActivity = {
        deviceId: device.deviceId,
        avgSpeedKm: activity.avgSpeedMpS * 3.6,
        distanceKm: activity.distanceM / 1000,
        startTime: activity.startTime,
        endTime: activity.endTime,
        name: activity.name,
      } as DbActivity;

      if (!this.currentActivityId) {
        // this is a new activity so drop all the location before the start time
        const startIndex = this.activityLocations.findIndex(
          x => x.time >= activity.startTime.getTime(),
        );
        this.activityLocations.splice(0, startIndex);

        const result = await unitOfWork.activityRepository.insert(newActivity);
        this.currentActivityId = result.activityId;
      } else {
        newActivity.activityId = this.currentActivityId;
        await unitOfWork.activityRepository.update(newActivity);
      }

      if (!inProgress) {
        // We're at the end of the activity so save the locations and reset the currentActivityId
        const activityEndLocationIndex = this.activityLocations.findIndex(
          x => x.time > activity.endTime.getTime(),
        );
        const activityLocations = this.activityLocations.splice(
          0,
          activityEndLocationIndex,
        );
        for (const location of activityLocations) {
          await unitOfWork.activityLocationRepository.insert(
            this.getActivityLocation(location),
          );
        }

        this.currentActivityId = undefined;
      }
    });
  }

  private async getDevice(unitOfWork: UnitOfWork) {
    let user = await unitOfWork.userRepository.getByName(this.user);
    if (!user) {
      user = await unitOfWork.userRepository.insert({ name: this.user });
    }

    let device = await unitOfWork.deviceRepository.getByName(
      this.device,
      user.userId,
    );
    if (!device) {
      device = await unitOfWork.deviceRepository.insert({
        name: this.device,
        userId: user.userId,
      });
    }
    return device;
  }

  private getSpeed(lastLocation: KalmanLocation, location: KalmanLocation) {
    const distance = haversine(lastLocation, location, {
      unit: 'meter',
    });
    const timeDiff = location.time - lastLocation.time;
    return distance / (timeDiff / 1000);
  }

  private getActivityLocation(location: KalmanLocation) {
    if (!this.currentActivityId) return;

    return {
      activityId: this.currentActivityId,
      latitude: location.latitude,
      longitude: location.longitude,
      time: new Date(location.time),
      accuracy: location.accuracy,
      altitude: location.altitude,
    } as Partial<ActivityLocation>;
  }

  private async handleZeroMovement(
    lastLocation: KalmanLocation,
    location: KalmanLocation,
  ) {
    for (let time = lastLocation.time; time < location.time; time += 60000) {
      this.state = await this.state.newSpeed({
        speed: 0,
        time: new Date(time),
      });
    }

    this.lastLocation = location;
  }
}

import { inject, injectable } from 'inversify';
import { UnitOfWorkFactory } from '../data/unit-of-work';
import TYPES from '../types';
import { Activity, Speed, State } from './states/base-state';
import { IdleState } from './states/idle-state';

export interface TrackerStateMachine {
  newSpeed(speed: Speed): Promise<void>;
  setDevice(user: string, device: string): void;
}

@injectable()
export class TrackerStateMachineImpl implements TrackerStateMachine {
  private state: State;
  private user: string;
  private device: string;

  constructor(
    @inject(TYPES.UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
  ) {
    this.state = new IdleState(async x => await this.activityTracked(x));
  }

  public setDevice(user: string, device: string) {
    this.user = user;
    this.device = device;
  }

  public async newSpeed(speed: Speed) {
    if (isNaN(speed.speed)) {
      throw new Error(`Speed is NaN ${speed.time}`);
    }

    this.state = await this.state.newSpeed(speed);
  }

  private async activityTracked(activity: Activity) {
    console.log(
      'Logged Activity: %s from %s to %s. Durations: %d min. Distance: %d km. Avg Speed: %d km/h',
      activity.name,
      activity.startTime.toISOString(),
      activity.endTime.toISOString(),
      (activity.durationSeconds / 60).toFixed(2),
      (activity.distanceM / 1000).toFixed(2),
      (activity.avgSpeedMpS * 3.6).toFixed(2),
    );

    await this.saveActivity(activity);
  }

  private async saveActivity(activity: Activity) {
    await this.unitOfWorkFactory.execute(async unitOfWork => {
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

      await unitOfWork.activityRepository.insert({
        deviceId: device.deviceId,
        avgSpeedKm: activity.avgSpeedMpS * 3.6,
        distanceKm: activity.distanceM / 1000,
        startTime: activity.startTime,
        endTime: activity.endTime,
        name: activity.name,
      });
    });
  }
}

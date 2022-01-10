import { injectable } from 'inversify';
import { Activity, Speed, State } from './states/base-state';
import { IdleState } from './states/idle-state';

export interface TrackerStateMachine {
  newSpeed(speed: Speed): void;
}

@injectable()
export class TrackerStateMachineImpl implements TrackerStateMachine {
  private state: State;

  constructor() {
    this.state = new IdleState(x => this.activityTracked(x));
  }

  public newSpeed(speed: Speed): void {
    if (isNaN(speed.speed)) {
      throw new Error(`Speed is NaN ${speed.time}`);
    }

    this.state = this.state.newSpeed(speed);
  }

  private activityTracked(activity: Activity) {
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
}

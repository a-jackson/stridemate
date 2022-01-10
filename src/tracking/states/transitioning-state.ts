import { ActivityDefinition } from './activity-definition';
import { ActivityCallback, BaseState, Speed, State } from './base-state';
import { IdleState } from './idle-state';
import { InActivityState } from './in-activity-state';

export class TransitioningState extends BaseState implements State {
  private readonly activity: ActivityDefinition;
  private readonly startTime: Date;

  constructor(
    activityCallback: ActivityCallback,
    private readonly speeds: Speed[],
  ) {
    super(activityCallback);

    this.activity = this.getActivity(speeds[0]);
    this.startTime = speeds[0].time;
  }

  public newSpeed(speed: Speed): State {
    this.speeds.push(speed);

    // Wait 5 minutes before we do anything.
    const timeSinceStartMs = speed.time.getTime() - this.startTime.getTime();
    if (timeSinceStartMs < this.TransitionTimeMs) {
      return this;
    }

    // Get the average speed over the transition period
    const activitySinceStart = this.getActivityOverTime(this.speeds);

    if (activitySinceStart.isIdle) {
      return new IdleState(this.activityCallback);
    }

    return new InActivityState(
      this.activityCallback,
      this.speeds,
      activitySinceStart,
      this.startTime,
    );
  }
}

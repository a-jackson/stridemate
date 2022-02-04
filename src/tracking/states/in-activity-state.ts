import { ActivityDefinition } from './activity-definition';
import { ActivityCallback, BaseState, Speed, State } from './base-state';
import { TransitioningState } from './transitioning-state';

export class InActivityState extends BaseState implements State {
  private timeActivityEnd?: Date;

  constructor(
    activityCallback: ActivityCallback,
    private readonly speeds: Speed[],
    private readonly activity: ActivityDefinition,
    private readonly startTime: Date,
  ) {
    super(activityCallback);
  }

  public async newSpeed(speed: Speed): Promise<State> {
    this.speeds.push(speed);

    if (!this.timeActivityEnd) {
      const activity = this.getActivity(speed);

      // We're still doing the thing we were doing
      if (activity.name === this.activity.name) {
        return this;
      }

      this.timeActivityEnd = speed.time;
    }

    // Wait 5 minutes before we do anything.
    const timeSinceEndMs =
      speed.time.getTime() - this.timeActivityEnd.getTime();
    if (timeSinceEndMs < this.TransitionTimeMs) {
      return this;
    }

    // Get the average speed since timeActivityEnd
    const speedsSinceEnd = this.speeds.filter(
      x => x.time.getTime() >= this.timeActivityEnd.getTime(),
    );

    const activitySinceEnd = this.getActivityOverTime(speedsSinceEnd);

    // If this works out to the same as we were doing befor then reset and stay in activity
    if (activitySinceEnd.name === this.activity.name) {
      // Ensure that there's not a smaller window with a different activity
      for (let i = 1; i < speedsSinceEnd.length; i++) {
        const activitySincePartialEnd = this.getActivityOverTime(
          speedsSinceEnd.slice(i),
        );
        if (activitySincePartialEnd.name !== this.activity.name) {
          this.timeActivityEnd = speedsSinceEnd[i].time;
          return this;
        }
      }

      this.timeActivityEnd = undefined;
      return this;
    }

    const stats = this.getStats(this.speeds, this.timeActivityEnd);

    await this.activityCallback({
      name: this.activity.name,
      startTime: this.startTime,
      endTime: this.timeActivityEnd,
      durationSeconds: stats.duration,
      distanceM: stats.distance,
      avgSpeedMpS: stats.avgSpeed,
    });

    return new TransitioningState(this.activityCallback, speedsSinceEnd);
  }
}

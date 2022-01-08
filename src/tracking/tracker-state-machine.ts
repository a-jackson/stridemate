import { injectable } from 'inversify';

const TransitionTimeMinutes = 5;
const TransitionTimeMs = TransitionTimeMinutes * 60 * 1000;

export type ActivityDefinition = {
  maxSpeed: number;
  name: string;
  isIdle?: boolean;
};

export type Speed = {
  speed: number;
  time: Date;
};

export const Activities: ActivityDefinition[] = [
  { maxSpeed: 0.6, name: 'Idle', isIdle: true },
  { maxSpeed: 1.7, name: 'Walking' },
  { maxSpeed: 3.5, name: 'Running' },
  { maxSpeed: 100, name: 'Driving' },
];

function getActivity(speed: Speed): ActivityDefinition {
  let activity: ActivityDefinition;
  for (activity of Activities) {
    if (speed.speed <= activity.maxSpeed) {
      return activity;
    }
  }

  return activity;
}

export interface TrackerStateMachine {
  newSpeed(speed: Speed): void;
}

@injectable()
export class TrackerStateMachineImpl implements TrackerStateMachine {
  private state: State;

  constructor() {
    this.state = new IdleState();
  }

  public newSpeed(speed: Speed): void {
    if (isNaN(speed.speed)) {
      throw new Error(`Speed is NaN ${speed.time}`);
    }

    this.state = this.state.newSpeed(speed);
  }
}

interface State {
  newSpeed(speed: Speed): State;
}

class IdleState implements State {
  public newSpeed(speed: Speed): State {
    if (speed.speed > Activities[0].maxSpeed) {
      return new TransitioningState(speed);
    }

    return this;
  }
}

class TransitioningState implements State {
  private readonly activity: ActivityDefinition;
  private readonly startTime: Date;
  private readonly speeds: Speed[];

  constructor(speed: Speed) {
    this.activity = getActivity(speed);
    this.startTime = speed.time;
    this.speeds = [speed];
  }

  public newSpeed(speed: Speed): State {
    this.speeds.push(speed);
    const activity = getActivity(speed);
    if (activity.name !== this.activity.name) {
      return new TransitioningState(speed);
    }

    if (speed.time.getTime() >= this.startTime.getTime() + TransitionTimeMs) {
      if (this.activity.isIdle) {
        return new IdleState();
      }

      return new InActivityState(this.speeds, this.activity, this.startTime);
    }

    return this;
  }
}

class InActivityState implements State {
  private timeActivityEnd?: Date;

  constructor(
    private readonly speeds: Speed[],
    private readonly activity: ActivityDefinition,
    private readonly startTime: Date,
  ) {}

  public newSpeed(speed: Speed): State {
    this.speeds.push(speed);

    if (!this.timeActivityEnd) {
      const activity = getActivity(speed);

      // We're still doing the thing we were doing
      if (activity.name === this.activity.name) {
        return this;
      }

      this.timeActivityEnd = speed.time;
    }

    // Wait 5 minutes before we do anything.
    const timeSinceEndMs =
      speed.time.getTime() - this.timeActivityEnd.getTime();
    if (timeSinceEndMs < TransitionTimeMs) {
      return this;
    }

    // Get the average speed since timeActivityEnd
    const speedsSinceEnd = this.speeds.filter(
      x => x.time.getTime() >= this.timeActivityEnd.getTime(),
    );
    const distanceSinceEnd = this.getDistance(speedsSinceEnd);
    const speedSinceEnd = distanceSinceEnd / (timeSinceEndMs / 1000);
    const activitySinceEnd = getActivity({
      speed: speedSinceEnd,
      time: speed.time,
    });

    // If this works out to the same as we were doing befor then reset and stay in activity
    if (activitySinceEnd.name === this.activity.name) {
      this.timeActivityEnd = undefined;
      return this;
    }

    const totalDistanceM = this.getTotalDistance();
    const durationSeconds =
      (this.timeActivityEnd.getTime() - this.startTime.getTime()) / 1000;
    const avgSpeedMpS = totalDistanceM / durationSeconds;

    console.log(
      'Logged Activity: %s from %s to %s. Durations: %d min. Distance: %d km. Avg Speed: %d km/h',
      this.activity.name,
      this.startTime.toISOString(),
      this.timeActivityEnd.toISOString(),
      (durationSeconds / 60).toFixed(2),
      (totalDistanceM / 1000).toFixed(2),
      (avgSpeedMpS * 3.6).toFixed(2),
    );

    return new TransitioningState(speed);
  }

  private getTotalDistance() {
    return this.getDistance(this.speeds, this.timeActivityEnd);
  }

  private getDistance(speeds: Speed[], endTime?: Date) {
    let totalDistance = 0;
    for (let i = 1; i < speeds.length; i++) {
      const speed = speeds[i];
      if (endTime && speed.time.getTime() > endTime.getTime()) {
        break;
      }

      const lastTime = speeds[i - 1].time.getTime();
      const timeDiffSeconds = (speed.time.getTime() - lastTime) / 1000;

      totalDistance += speed.speed * timeDiffSeconds;
    }

    return totalDistance;
  }
}

import { ActivityDefinition, getActivity } from './activity-definition';

export type Speed = {
  speed: number;
  time: Date;
};

export interface State {
  newSpeed(speed: Speed): Promise<State>;
}

export type Activity = {
  name: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  distanceM: number;
  avgSpeedMpS: number;
};

export type ActivityCallback = (activity: Activity) => Promise<void>;

export abstract class BaseState {
  protected TransitionTimeMinutes = 5;
  protected TransitionTimeMs = this.TransitionTimeMinutes * 60 * 1000;

  constructor(protected readonly activityCallback: ActivityCallback) {}

  protected getActivity(speed: Speed): ActivityDefinition {
    return getActivity(speed.speed);
  }

  protected getDistance(speeds: Speed[], endTime?: Date) {
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

  protected getStats(
    speeds: Speed[],
    endTime?: Date,
  ): { distance: number; duration: number; avgSpeed: number } {
    const distance = this.getDistance(speeds, endTime);
    const duration =
      ((endTime || speeds[speeds.length - 1].time).getTime() -
        speeds[0].time.getTime()) /
      1000;
    const avgSpeed = distance / duration;
    return { distance, duration, avgSpeed };
  }

  protected getActivityOverTime(speeds: Speed[]) {
    const stats = this.getStats(speeds);
    return this.getActivity({
      speed: stats.avgSpeed,
      time: speeds[0].time,
    });
  }
}

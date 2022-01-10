import { Activities } from './activity-definition';
import { ActivityCallback, BaseState, Speed, State } from './base-state';
import { TransitioningState } from './transitioning-state';

export class IdleState extends BaseState implements State {
  constructor(activityCallback: ActivityCallback) {
    super(activityCallback);
  }

  public newSpeed(speed: Speed): State {
    if (speed.speed > Activities[0].maxSpeed) {
      return new TransitioningState(this.activityCallback, [speed]);
    }

    return this;
  }
}

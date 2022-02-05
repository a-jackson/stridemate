import { injectable } from 'inversify';
import { container } from '../inversify.config';
import { Location } from '../mqtt/mqtt';
import TYPES from '../types';
import { TrackerStateMachine } from './tracker-state-machine';

const MaxAccuracy = 30;

export interface Tracker {
  onLocation(location: Location): Promise<void>;
}

@injectable()
export class TrackerImpl implements Tracker {
  private readonly stateMachines: { [device: string]: TrackerStateMachine } =
    {};

  public async onLocation(location: Location) {
    // Ignore low accuracy locations
    if (location.accuracy >= MaxAccuracy) {
      return;
    }

    const device = `${location.user}/${location.device}`;
    this.initialiseStateMachine(device, location);

    await this.stateMachines[device].newLocation(location);
  }

  private initialiseStateMachine(device: string, location: Location) {
    if (!this.stateMachines[device]) {
      this.stateMachines[device] = container.get<TrackerStateMachine>(
        TYPES.TrackerStateMachine,
      );
      this.stateMachines[device].setDevice(location.user, location.device);
    }
  }
}

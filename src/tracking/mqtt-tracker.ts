import { inject, injectable } from 'inversify';
import { Mqtt } from '../mqtt/mqtt';
import TYPES from '../types';
import { Tracker } from './tracker';

const MaxAccuracy = 30;

export interface MqttTracker {
  start(): void;
}

@injectable()
export class MqttTrackerImpl implements MqttTracker {
  constructor(
    @inject(TYPES.Mqtt) private mqtt: Mqtt,
    @inject(TYPES.Tracker) private tracker: Tracker,
  ) {}

  public start() {
    this.mqtt.onLocation(async x => await this.tracker.onLocation(x));
  }
}

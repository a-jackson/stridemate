import { inject, injectable } from 'inversify';
import { UnitOfWorkFactory } from '../data/unit-of-work';
import { Location, Mqtt } from '../mqtt/mqtt';
import TYPES from '../types';

export interface SaveLocations {
  start(): void;
}

@injectable()
export class SaveLocationsImpl implements SaveLocations {
  constructor(
    @inject(TYPES.Mqtt) private mqtt: Mqtt,
    @inject(TYPES.UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
  ) { }

  public start() {
    this.mqtt.onLocation(x => this.saveLocation(x));
  }

  private async saveLocation(location: Location) {
    await this.unitOfWorkFactory.execute(
      async unitOfWork => {
        let user = await unitOfWork.userRepository.getByName(location.user);
        if (!user) {
          user = await unitOfWork.userRepository.insert({ name: location.user });
        }

        let device = await unitOfWork.deviceRepository.getByName(
          location.device,
          user.userId,
        );
        if (!device) {
          device = await unitOfWork.deviceRepository.insert({
            name: location.device,
            userId: user.userId,
          });
        }

        await unitOfWork.locationRepository.insert({
          deviceId: device.deviceId,
          latitude: location.latitude,
          longitude: location.longitude,
          altitude: location.altitude,
          accuracy: location.accuracy,
          velocity: location.velocity,
          time: location.time,
        });
      });
  }
}

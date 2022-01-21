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
    const unitOfWork = await this.unitOfWorkFactory.createUnitOfWork();
    await unitOfWork.complete(async uow => {
      let user = await uow.userRepository.getByName(location.user);
      if (!user) {
        user = await uow.userRepository.insert({ name: location.user });
      }

      let device = await uow.deviceRepository.getByName(
        location.device,
        user.userId,
      );
      if (!device) {
        device = await uow.deviceRepository.insert({
          name: location.device,
          userId: user.userId,
        });
      }

      await uow.locationRepository.insert({
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

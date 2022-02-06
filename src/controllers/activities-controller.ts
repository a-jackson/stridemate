import * as express from 'express';
import haversine from 'haversine';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  interfaces,
  request,
  requestParam,
  response,
} from 'inversify-express-utils';
import { UnitOfWorkFactory } from '../data/unit-of-work';
import { ActivityFilter } from '../models/activity-filter';
import { getActivity } from '../tracking/states/activity-definition';
import TYPES from '../types';

@controller('/api/activities')
export class ActivitiesController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
  ) {}

  @httpGet('/')
  public async index(
    @request() req: express.Request,
    @response() res: express.Response,
  ) {
    const filter = req.query as ActivityFilter;
    return await this.unitOfWorkFactory.execute(
      async unitOfWork =>
        await unitOfWork.activityRepository.getByFilter(filter),
    );
  }

  @httpGet('/:id')
  public async getSingle(@requestParam('id') id: number) {
    return await this.unitOfWorkFactory.execute(
      async unitOfWork => await unitOfWork.activityRepository.getById(id),
    );
  }

  @httpGet('/:id/previous')
  public async getPrevious(@requestParam('id') id: number) {
    return await this.unitOfWorkFactory.execute(
      async unitOfWork => await unitOfWork.activityRepository.getPrevious(id),
    );
  }

  @httpGet('/:id/next')
  public async getNext(@requestParam('id') id: number) {
    return await this.unitOfWorkFactory.execute(
      async unitOfWork => await unitOfWork.activityRepository.getNext(id),
    );
  }

  @httpPost('/:id/mergeWithPrevious')
  public async mergeWithPrevious(@requestParam('id') id: number) {
    return await this.unitOfWorkFactory.execute(async unitOfWork => {
      const current = await unitOfWork.activityRepository.getById(id);
      const previous = await unitOfWork.activityRepository.getPrevious(id);
      if (!current || !previous) {
        throw new Error('Cannot find activity or previous');
      }

      const currentLocations =
        await unitOfWork.activityLocationRepository.getByActivity(
          current.activityId,
          30,
        );
      const previousLocation =
        await unitOfWork.activityLocationRepository.getByActivity(
          previous.activityId,
          30,
        );
      const locations = previousLocation.concat(currentLocations);

      let distanceSum = 0;

      const totalTime =
        current.endTime.getTime() - previous.startTime.getTime();

      for (let i = 1; i < locations.length; i++) {
        const last = locations[i - 1];
        const location = locations[i];

        const distance = haversine(last, location, { unit: 'meter' });

        distanceSum += distance;
      }

      const speedAvg = distanceSum / (totalTime / 1000);

      const activity = {
        deviceId: current.deviceId,
        avgSpeedKm: speedAvg * 3.6,
        distanceKm: distanceSum / 1000,
        startTime: previous.startTime,
        endTime: current.endTime,
        name: getActivity(speedAvg).name,
      };

      const newActivity = await unitOfWork.activityRepository.insert(activity);
      for (const location of locations) {
        await unitOfWork.activityLocationRepository.insert({
          activityId: newActivity.activityId,
          accuracy: location.accuracy,
          altitude: location.altitude,
          latitude: location.latitude,
          longitude: location.longitude,
          time: location.time,
        });
      }
      await unitOfWork.activityRepository.delete(current);
      await unitOfWork.activityRepository.delete(previous);

      return newActivity;
    });
  }
}

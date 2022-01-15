import * as express from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  interfaces,
  request,
  response,
} from 'inversify-express-utils';
import { UnitOfWorkFactory } from '../data/unit-of-work';
import TYPES from '../types';

@controller('/api/activities')
export class ActivitiesController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
  ) {}

  @httpGet('/')
  private async index(
    @request() req: express.Request,
    @response() res: express.Response,
  ) {
    const unitOfWork = await this.unitOfWorkFactory.createUnitOfWork();
    return await unitOfWork.activityRepository.getAll();
  }
}

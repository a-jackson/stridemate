import * as express from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  interfaces,
  request,
  response
} from 'inversify-express-utils';
import { UnitOfWorkFactory } from '../data/unit-of-work';
import TYPES from '../types';

@controller('/api/users')
export class UsersController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
  ) { }

  @httpGet('/')
  private async index(
    @request() req: express.Request,
    @response() res: express.Response,
  ) {
    return await this.unitOfWorkFactory
      .execute(
        async uow => uow.userRepository.getAll());
  }
}

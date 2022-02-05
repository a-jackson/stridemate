import { inject } from 'inversify';
import {
  controller,
  httpGet,
  interfaces,
  requestParam,
} from 'inversify-express-utils';
import { UnitOfWorkFactory } from '../data/unit-of-work';
import TYPES from '../types';

@controller('/api/locations')
export class LocationsController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
  ) {}

  @httpGet('/:id')
  public async index(@requestParam('id') id: number) {
    return await this.unitOfWorkFactory.execute(
      async uow => await uow.activityLocationRepository.getByActivity(id),
    );
  }
}

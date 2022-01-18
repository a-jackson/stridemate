import { inject, injectable } from 'inversify';
import { PoolClient } from 'pg';
import TYPES from '../types';
import {
  ActivityRepository,
  ActivityRepositoryImpl,
} from './activity-repository';
import { ConnectionManager } from './connection-manager';
import { DeviceRepository, DeviceRepositoryImpl } from './device-repository';
import {
  LocationRepository,
  LocationRepositoryImpl,
} from './location-repository';
import { UserRepository, UserRepositoryImpl } from './user-repository';

export interface UnitOfWorkFactory {
  createUnitOfWork(): Promise<UnitOfWork>;
}

@injectable()
export class UnitOfWorkFactoryImpl implements UnitOfWorkFactory {
  constructor(
    @inject(TYPES.ConnectionManager)
    private connectionManager: ConnectionManager,
  ) {}

  public async createUnitOfWork(): Promise<UnitOfWork> {
    const client = await this.connectionManager.getClient();

    const unitOfWork = new UnitOfWorkImpl(client);

    return unitOfWork;
  }
}

export interface UnitOfWork {
  readonly userRepository: UserRepository;
  readonly deviceRepository: DeviceRepository;
  readonly locationRepository: LocationRepository;
  readonly activityRepository: ActivityRepository;

  complete(work: () => Promise<void>): Promise<void>;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

export class UnitOfWorkImpl implements UnitOfWork {
  public readonly userRepository: UserRepository;
  public readonly deviceRepository: DeviceRepository;
  public readonly locationRepository: LocationRepository;
  public readonly activityRepository: ActivityRepository;

  constructor(private client: PoolClient) {
    this.userRepository = new UserRepositoryImpl(this.client);
    this.deviceRepository = new DeviceRepositoryImpl(this.client);
    this.locationRepository = new LocationRepositoryImpl(this.client);
    this.activityRepository = new ActivityRepositoryImpl(this.client);
  }

  public async complete(work: () => Promise<void>) {
    try {
      await this.begin();
      await work();
      await this.commit();
    } catch (e) {
      await this.rollback();
      throw e;
    } finally {
      this.client.release();
    }
  }

  public async begin() {
    await this.client.query('BEGIN');
  }

  public async commit() {
    await this.client.query('COMMIT');
  }

  public async rollback() {
    await this.client.query('ROLLBACK');
  }

  public release() {
    this.client.release();
  }
}

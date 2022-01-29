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
  execute<T>(work: (unitOfWork: UnitOfWork) => Promise<T>): Promise<T>;
}

@injectable()
export class UnitOfWorkFactoryImpl implements UnitOfWorkFactory {
  constructor(
    @inject(TYPES.ConnectionManager)
    private connectionManager: ConnectionManager,
  ) {}

  public async createUnitOfWork(): Promise<UnitOfWork> {
    return new UnitOfWorkImpl(await this.connectionManager.getClient());
  }

  public async execute<T>(work: (unitOfWork: UnitOfWork) => Promise<T>) {
    const unitOfWork = await this.createUnitOfWork();
    return await unitOfWork.complete(x => work(x));
  }
}

export interface UnitOfWork {
  readonly userRepository: UserRepository;
  readonly deviceRepository: DeviceRepository;
  readonly locationRepository: LocationRepository;
  readonly activityRepository: ActivityRepository;

  complete<T>(work: (unitOfWork: UnitOfWork) => Promise<T>): Promise<T>;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

export class UnitOfWorkImpl implements UnitOfWork {
  private _userRepository?: UserRepository;
  private _deviceRepository?: DeviceRepository;
  private _locationRepository?: LocationRepository;
  private _activityRepository?: ActivityRepository;

  constructor(private client: PoolClient) {}

  public get userRepository() {
    return (this._userRepository ??= new UserRepositoryImpl(this.client));
  }

  public get deviceRepository() {
    return (this._deviceRepository ??= new DeviceRepositoryImpl(this.client));
  }
  public get locationRepository() {
    return (this._locationRepository ??= new LocationRepositoryImpl(
      this.client,
    ));
  }
  public get activityRepository() {
    return (this._activityRepository ??= new ActivityRepositoryImpl(
      this.client,
    ));
  }

  public async complete<T>(
    work: (unitOfWork: UnitOfWork) => Promise<T>,
  ): Promise<T> {
    try {
      await this.begin();
      const result = await work(this);
      await this.commit();
      return result;
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

import { inject, injectable } from 'inversify';
import { PoolClient } from 'pg';
import { container } from '../inversify.config';
import TYPES from '../types';
import { ConnectionManager } from './connection-manager';
import { DeviceRepository } from './device-repository';
import { LocationRepository } from './location-repository';
import { UserRepository } from './user-repository';

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

    const unitOfWork = container.get<UnitOfWorkImpl>(TYPES.UnitOfWork);
    unitOfWork.setClient(client);

    return unitOfWork;
  }
}

export interface UnitOfWork {
  readonly userRepository: UserRepository;
  readonly deviceRepository: DeviceRepository;
  readonly locationRepository: LocationRepository;

  complete(work: () => Promise<void>): Promise<void>;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

@injectable()
export class UnitOfWorkImpl implements UnitOfWork {
  private client: PoolClient;

  constructor(
    @inject(TYPES.UserRepository)
    public readonly userRepository: UserRepository,
    @inject(TYPES.DeviceRepository)
    public readonly deviceRepository: DeviceRepository,
    @inject(TYPES.LocationRepository)
    public readonly locationRepository: LocationRepository,
  ) {}

  public setClient(client: PoolClient) {
    this.client = client;
    this.userRepository.setClient(client);
    this.deviceRepository.setClient(client);
    this.locationRepository.setClient(client);
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

import { inject, injectable } from 'inversify';
import { Device } from '../models/device';
import TYPES from '../types';
import { ConnectionManager } from './connection-manager';
import { Repository } from './repository';

export interface DeviceRepository extends Repository<Device> {
  getByName(name: string, userId: number): Promise<Device | undefined>;
}

@injectable()
export class DeviceRepositoryImpl implements DeviceRepository {
  constructor(
    @inject(TYPES.ConnectionManager)
    private connectionManager: ConnectionManager,
  ) {}

  public async getByName(
    name: string,
    userId: number,
  ): Promise<Device | undefined> {
    const client = await this.connectionManager.getClient();
    const result = await client.query<Device>(
      `SELECT "deviceId", "name", "userId" FROM devices WHERE "name" = $1 and "userId" = $2`,
      [name, userId],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getById(entityId: number): Promise<Device> {
    const client = await this.connectionManager.getClient();
    const result = await client.query<Device>(
      `SELECT "deviceId", "name", "userId" FROM devices WHERE "deviceId" = $1`,
      [entityId],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getAll(): Promise<Device[]> {
    const client = await this.connectionManager.getClient();
    const result = await client.query<Device>(
      `SELECT "deviceId", "name", "userId" FROM devices`,
    );

    return result.rows;
  }

  update(entity: Device): Promise<void> {
    throw new Error('Method not implemented.');
  }

  delete(entity: Device): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async insert(entity: Partial<Device>): Promise<Device> {
    const client = await this.connectionManager.getClient();
    const result = await client.query<Device>(
      `INSERT INTO devices ( "name", "userId" ) VALUES ( $1, $2 ) RETURNING "deviceId", "name", "userId"`,
      [entity.name, entity.userId],
    );

    return result.rows[0];
  }
}

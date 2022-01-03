import { injectable } from 'inversify';
import { PoolClient } from 'pg';
import { Location } from '../models/location';
import { Repository } from './repository';

export interface LocationRepository extends Repository<Location> {}

@injectable()
export class LocationRepositoryImpl implements LocationRepository {
  private client: PoolClient;

  public setClient(client: PoolClient) {
    this.client = client;
  }

  public async getById(entityId: number): Promise<Location> {
    const result = await this.client.query<Location>(
      `SELECT "locationId", "deviceId", "latitude", "longitude", "altitude", "accuracy", "velocity", "time" FROM locations WHERE "locationId" = $1`,
      [entityId],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getAll(): Promise<Location[]> {
    const result = await this.client.query<Location>(
      `SELECT "locationId", "deviceId", "latitude", "longitude", "altitude", "accuracy", "velocity", "time" 
      FROM locations
      ORDER BY "time" ASC`,
    );

    return result.rows;
  }

  update(entity: Location): Promise<void> {
    throw new Error('Method not implemented.');
  }

  delete(entity: Location): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async insert(entity: Partial<Location>): Promise<Location> {
    const result = await this.client.query<Location>(
      `INSERT INTO locations ( "deviceId", "latitude", "longitude", "altitude", "accuracy", "velocity", "time" ) 
      VALUES ( $1, $2, $3, $4, $5, $6, $7 ) 
      RETURNING "locationId", "deviceId", "latitude", "longitude", "altitude", "accuracy", "velocity", "time"`,
      [
        entity.deviceId,
        entity.latitude,
        entity.longitude,
        entity.altitude,
        entity.accuracy,
        entity.velocity,
        entity.time,
      ],
    );

    return result.rows[0];
  }
}

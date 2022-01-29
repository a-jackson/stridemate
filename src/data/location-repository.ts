import { PoolClient } from 'pg';
import { Location } from '../models/location';
import { Repository } from './repository';

export interface LocationRepository extends Repository<Location> {
  getActivityLocation(activityId: number): Promise<Location[]>;
  getTimeRange(
    startTime: Date,
    endTime: Date,
    deviceId: number,
    maxAccuracy: number,
  ): Promise<Location[]>;
}

export class LocationRepositoryImpl implements LocationRepository {
  constructor(private client: PoolClient) {}

  public async getTimeRange(
    startTime: Date,
    endTime: Date,
    deviceId: number,
    maxAccuracy: number,
  ) {
    const result = await this.client.query<Location>(
      `SELECT "locationId", "deviceId", "latitude", "longitude", 
        "altitude", "accuracy", "velocity", "time" 
        FROM locations 
        WHREE "time" BETWEEN $1 AND $2
        AND "deviceId" = $3
        AND "accuracy" < $4`,
      [startTime, endTime, deviceId],
    );

    return result.rows;
  }

  public async getById(entityId: number): Promise<Location> {
    const result = await this.client.query<Location>(
      `SELECT "locationId", "deviceId", "latitude", "longitude", 
      "altitude", "accuracy", "velocity", "time" 
      FROM locations 
      WHERE "locationId" = $1`,
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

  public async getActivityLocation(activityId: number): Promise<Location[]> {
    const result = await this.client.query<Location>(
      `SELECT "locationId", "deviceId", "latitude", "longitude", "altitude", "accuracy", "velocity", "time" 
        FROM locations
        WHERE "time" > (SELECT "startTime" from activities where "activityId" = $1)
        AND "time" < (SELECT "endTime" from activities where "activityId" = $1)
        ORDER BY "time" ASC`,
      [activityId],
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

import { PoolClient } from 'pg';
import { ActivityLocation } from '../models/activity-location';
import { Repository } from './repository';

export interface ActivityLocationRepository
  extends Repository<ActivityLocation> {
  getByActivity(activityId: number): Promise<ActivityLocation[]>;
  getByActivity(
    activityId: number,
    maxAccuracy: number,
  ): Promise<ActivityLocation[]>;
  getTimeRange(
    startTime: Date,
    endTime: Date,
    activityId: number,
    maxAccuracy: number,
  ): Promise<ActivityLocation[]>;
}

export class ActivityLocationRepositoryImpl
  implements ActivityLocationRepository
{
  constructor(private client: PoolClient) {}

  public async getTimeRange(
    startTime: Date,
    endTime: Date,
    activityId: number,
    maxAccuracy: number,
  ) {
    const result = await this.client.query<ActivityLocation>(
      `SELECT "activityLocationId", "activityId", "latitude", "longitude", 
        "altitude", "accuracy", "time" 
        FROM activity_locations 
        WHERE "time" BETWEEN $1 AND $2
        AND "activityId" = $3
        AND "accuracy" < $4`,
      [startTime, endTime, activityId, maxAccuracy],
    );

    return result.rows;
  }

  public async getById(entityId: number): Promise<ActivityLocation> {
    const result = await this.client.query<ActivityLocation>(
      `SELECT "activityLocationId", "activityId", "latitude", "longitude", 
      "altitude", "accuracy", "time" 
      FROM activity_locations 
      WHERE "activityLocationId" = $1`,
      [entityId],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getAll(): Promise<ActivityLocation[]> {
    const result = await this.client.query<ActivityLocation>(
      `SELECT "activityLocationId", "activityId", "latitude", "longitude", 
      "altitude", "accuracy", "time"  
      FROM activity_locations
      ORDER BY "time" ASC`,
    );

    return result.rows;
  }

  public async getByActivity(
    activityId: number,
    maxAccuracy: number = 30,
  ): Promise<ActivityLocation[]> {
    const result = await this.client.query<ActivityLocation>(
      `SELECT "activityLocationId", "activityId", "latitude", "longitude", 
          "altitude", "accuracy", "time" 
        FROM activity_locations
        WHERE "activityId" = $1
        AND "accuracy" < $2
        ORDER BY "time" ASC`,
      [activityId, maxAccuracy],
    );

    return result.rows;
  }

  update(entity: ActivityLocation): Promise<void> {
    throw new Error('Method not implemented.');
  }

  delete(entity: ActivityLocation): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async insert(
    entity: Partial<ActivityLocation>,
  ): Promise<ActivityLocation> {
    const result = await this.client.query<ActivityLocation>(
      `INSERT INTO activity_locations ( "activityId", "latitude", "longitude", "altitude", "accuracy", "time" ) 
      VALUES ( $1, $2, $3, $4, $5, $6 ) 
      RETURNING "activityLocationId", "activityId", "latitude", "longitude", "altitude", "accuracy", "time"`,
      [
        entity.activityId,
        entity.latitude,
        entity.longitude,
        entity.altitude,
        entity.accuracy,
        entity.time,
      ],
    );

    return result.rows[0];
  }
}

import { injectable } from 'inversify';
import { PoolClient } from 'pg';
import { Activity } from '../models/activity';
import { Repository } from './repository';

export interface ActivityRepository extends Repository<Activity> {}

@injectable()
export class ActivityRepositoryImpl implements ActivityRepository {
  private client: PoolClient;

  public setClient(client: PoolClient) {
    this.client = client;
  }

  public async getById(entityId: number): Promise<Activity> {
    const result = await this.client.query<Activity>(
      `SELECT "activityId", "startTime", "endTime"
      "distanceKm", "avgSpeedKm", "deviceId" 
      FROM activities WHERE "activityId" = $1`,
      [entityId],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getAll(): Promise<Activity[]> {
    const result = await this.client.query<Activity>(
      `SELECT "activityId", "startTime", "endTime"
      "distanceKm", "avgSpeedKm", "deviceId" 
      FROM activities`,
    );

    return result.rows;
  }

  update(entity: Activity): Promise<void> {
    throw new Error('Method not implemented.');
  }

  delete(entity: Activity): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async insert(entity: Partial<Activity>): Promise<Activity> {
    const result = await this.client.query<Activity>(
      `INSERT INTO activities
      ( "startTime", "endTime"
      "distanceKm", "avgSpeedKm", "deviceId" )
      VALUES
      ( $1, $2, $3, $4, $5 ) 
      RETURNING "activityId", "startTime", "endTime"
      "distanceKm", "avgSpeedKm", "deviceId"`,
      [
        entity.startTime,
        entity.endTime,
        entity.distanceKm,
        entity.avgSpeedKm,
        entity.deviceId,
      ],
    );

    return result.rows[0];
  }
}

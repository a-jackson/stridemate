import { PoolClient } from 'pg';
import { pg as sql } from 'yesql';
import { Activity } from '../models/activity';
import { ActivityFilter } from '../models/activity-filter';
import { Repository } from './repository';

export interface ActivityRepository extends Repository<Activity> {
  getByFilter(filter: ActivityFilter): Promise<Activity[]>;
  getPrevious(activtyId: number): Promise<Activity>;
  getNext(activtyId: number): Promise<Activity>;
}

export class ActivityRepositoryImpl implements ActivityRepository {
  constructor(private client: PoolClient) {}

  public async getPrevious(activtyId: number) {
    const query = `SELECT "activityId", activities."name", "startTime", 
      "endTime", "distanceKm", "avgSpeedKm", activities."deviceId", devices."name" AS "device"
      FROM activities
      INNER JOIN devices ON activities."deviceId" = devices."deviceId"
      WHERE "endTime" < (SELECT "startTime" FROM activities WHERE "activityId" = $1)
      AND activities."deviceId" = (SELECT "deviceId" FROM activities WHERE "activityId" = $1)
      ORDER BY "endTime" DESC
      LIMIT 1`;

    const result = await this.client.query<Activity>(query, [activtyId]);

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getNext(activtyId: number) {
    const query = `SELECT "activityId", activities."name", "startTime", 
      "endTime", "distanceKm", "avgSpeedKm", activities."deviceId", devices."name" AS "device"
      FROM activities
      INNER JOIN devices ON activities."deviceId" = devices."deviceId"
      WHERE "startTime" > (SELECT "endTime" FROM activities WHERE "activityId" = $1)
      AND activities."deviceId" = (SELECT "deviceId" FROM activities WHERE "activityId" = $1)
      ORDER BY "startTime" ASC
      LIMIT 1`;

    const result = await this.client.query<Activity>(query, [activtyId]);

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getByFilter(filter: ActivityFilter) {
    let query = `SELECT "activityId", activities."name", "startTime", 
      "endTime", "distanceKm", "avgSpeedKm", activities."deviceId", devices."name" AS "device"
      FROM activities
      INNER JOIN devices ON activities."deviceId" = devices."deviceId"
      WHERE 1 = 1 `;
    if (filter.userId) {
      query += `AND "userId" = :userId `;
    }

    if (!filter.sortOrder) {
      filter.sortOrder = 'desc';
    }

    query += `ORDER BY "startTime" ${filter.sortOrder} `;

    if (filter.limit) {
      query += `LIMIT :limit `;
    }
    if (filter.offset) {
      query += `OFFSET :offset `;
    }

    const statement = sql(query)(filter);
    const result = await this.client.query<Activity>(statement);

    return result.rows;
  }

  public async getById(entityId: number): Promise<Activity> {
    const result = await this.client.query<Activity>(
      `SELECT "activityId", activities."name", "startTime", 
      "endTime", "distanceKm", "avgSpeedKm", activities."deviceId", devices."name" AS "device"
      FROM activities
      INNER JOIN devices ON activities."deviceId" = devices."deviceId"
      WHERE "activityId" = $1`,
      [entityId],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getAll(): Promise<Activity[]> {
    const result = await this.client.query<Activity>(
      `SELECT "activityId", activities."name", "startTime", 
      "endTime", "distanceKm", "avgSpeedKm", activities."deviceId", devices."name" AS "device"
      FROM activities
      INNER JOIN devices ON activities."deviceId" = devices."deviceId"`,
    );

    return result.rows;
  }

  update(entity: Activity): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async delete(entity: Activity): Promise<void> {
    await this.client.query(`DELETE FROM activities WHERE "activityId" = $1`, [
      entity.activityId,
    ]);
  }

  public async insert(entity: Partial<Activity>): Promise<Activity> {
    const result = await this.client.query<Activity>(
      `INSERT INTO activities
      ( "name", "startTime", "endTime",
      "distanceKm", "avgSpeedKm", "deviceId" )
      VALUES
      ( $1, $2, $3, $4, $5, $6 ) 
      RETURNING "activityId", "name", "startTime", "endTime",
      "distanceKm", "avgSpeedKm", "deviceId"`,
      [
        entity.name,
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

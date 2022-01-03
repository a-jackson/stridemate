import { injectable } from 'inversify';
import { PoolClient } from 'pg';
import { User } from '../models/user';
import { Repository } from './repository';

export interface UserRepository extends Repository<User> {
  getByName(name: string): Promise<User | undefined>;
}

@injectable()
export class UserRepositoryImpl implements UserRepository {
  private client: PoolClient;

  public setClient(client: PoolClient) {
    this.client = client;
  }

  public async getById(entityId: number): Promise<User | undefined> {
    const result = await this.client.query<User>(
      `SELECT "userId", "name" FROM users WHERE "userId" = $1`,
      [entityId],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getByName(name: string): Promise<User | undefined> {
    const result = await this.client.query<User>(
      `SELECT "userId", "name" FROM users WHERE "name" = $1`,
      [name],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getAll(): Promise<User[]> {
    const result = await this.client.query<User>(
      'SELECT "userId", "name" FROM users',
    );

    return result.rows;
  }

  update(entity: User): Promise<void> {
    throw new Error('Method not implemented.');
  }

  delete(entity: User): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async insert(entity: Partial<User>): Promise<User> {
    const result = await this.client.query<User>(
      `INSERT INTO users ( "name" ) VALUES ( $1 ) RETURNING "userId", "name"`,
      [entity.name],
    );

    return result.rows[0];
  }
}

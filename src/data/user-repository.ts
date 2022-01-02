import { inject, injectable } from 'inversify';
import { User } from '../models/user';
import TYPES from '../types';
import { ConnectionManager } from './connection-manager';
import { Repository } from './repository';

export interface UserRepository extends Repository<User> {
  getByName(name: string): Promise<User | undefined>;
}

@injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @inject(TYPES.ConnectionManager)
    private connectionManager: ConnectionManager,
  ) {}

  public async getById(entityId: number): Promise<User | undefined> {
    const client = await this.connectionManager.getConnection();
    const result = await client.query<User>(
      `SELECT "userId", "name" FROM users WHERE "userId" = $1`,
      [entityId],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getByName(name: string): Promise<User | undefined> {
    const client = await this.connectionManager.getConnection();
    const result = await client.query<User>(
      `SELECT "userId", "name" FROM users WHERE "name" = $1`,
      [name],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
  }

  public async getAll(): Promise<User[]> {
    const client = await this.connectionManager.getConnection();

    const result = await client.query<User>(
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
    const client = await this.connectionManager.getConnection();
    const result = await client.query<User>(
      `INSERT INTO users ( "name" ) VALUES ( $1 ) RETURNING *`,
      [entity.name],
    );

    return result.rows[0];
  }
}

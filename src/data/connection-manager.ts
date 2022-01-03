import { inject, injectable } from 'inversify';
import { Pool, PoolClient } from 'pg';
import { Config } from '../config';
import TYPES from '../types';

export interface ConnectionManager {
  getClient(): Promise<PoolClient>;

  close(): void;
}

@injectable()
export class ConnectionManagerImpl implements ConnectionManager {
  private readonly pool: Pool;

  constructor(@inject(TYPES.Config) private config: Config) {
    this.pool = new Pool({
      host: this.config.database.host,
      database: this.config.database.name,
      user: this.config.database.user,
      password: this.config.database.password,
      port: this.config.database.port,
    });
  }

  public async getClient() {
    return await this.pool.connect();
  }

  public close() {
    this.pool.end();
  }
}

import { inject, injectable } from 'inversify';
import { Client, ClientConfig, QueryResult } from 'pg';
import { Config } from '../config';
import TYPES from '../types';

export interface DatabaseClient {
  query<T>(text: string, params?: any[]): Promise<QueryResult<T>>;
}

export interface ConnectionManager {
  getClient(): Promise<DatabaseClient>;
}

@injectable()
export class ConnectionManagerImpl implements ConnectionManager {
  private client?: Client;

  constructor(@inject(TYPES.Config) private config: Config) {}

  public async getClient() {
    if (!this.client) {
      this.client = new Client({
        host: this.config.database.host,
        database: this.config.database.name,
        user: this.config.database.user,
        password: this.config.database.password,
        port: this.config.database.port,
      } as ClientConfig);

      await this.client.connect();
    }

    return this.client;
  }
}

import { PoolClient } from 'pg';

export interface Repository<Model> {
  setClient(client: PoolClient);

  getById(entityId: number): Promise<Model | undefined>;

  getAll(): Promise<Model[]>;

  update(entity: Model): Promise<void>;

  delete(entity: Model): Promise<void>;

  insert(entity: Partial<Model>): Promise<Model>;
}

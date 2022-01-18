export interface Repository<Model> {
  getById(entityId: number): Promise<Model | undefined>;

  getAll(): Promise<Model[]>;

  update(entity: Model): Promise<void>;

  delete(entity: Model): Promise<void>;

  insert(entity: Partial<Model>): Promise<Model>;
}

import { Model, ModelStatic, FindOptions } from 'sequelize';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<T extends Model> {
  constructor(protected readonly model: ModelStatic<T>) {}

  async create(dto: Partial<T>): Promise<T> {
    return this.model.create(dto as T['_creationAttributes']);
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.model.findAll(options);
  }

  async findOne(id: string): Promise<T> {
    const entity = await this.model.findByPk(id);
    if (!entity) throw new NotFoundException(`${this.model.name} not found`);
    return entity;
  }

  async update(id: string, dto: Partial<T>): Promise<T> {
    const entity = await this.findOne(id);
    return entity.update(dto);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await entity.destroy();
  }
}

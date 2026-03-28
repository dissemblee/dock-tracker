import { Model, ModelStatic, FindOptions, Transaction } from 'sequelize';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<T extends Model> {
  constructor(protected readonly model: ModelStatic<T>) {}

  async create(dto: any): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.model.create({ ...dto });
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.model.findAll(options);
  }

  async findOne(id: number): Promise<T> {
    const entity = await this.model.findByPk(id);
    if (!entity) throw new NotFoundException(`${this.model.name} not found`);
    return entity;
  }

  async update(
    id: number,
    dto: Partial<T>,
    transaction?: Transaction,
  ): Promise<T> {
    const entity = await this.findOne(id);
    return entity.update(dto, { transaction });
  }

  async delete(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await entity.destroy();
  }
}

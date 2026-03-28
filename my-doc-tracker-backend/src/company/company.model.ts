import { Column, DataType, HasMany, Table } from 'sequelize-typescript';
import { BaseModel } from 'src/shared/base/base.model';
import { UserModel } from 'src/user/user.model';

@Table({ tableName: 'company' })
export class CompanyModel extends BaseModel<CompanyModel> {
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  declare name: string;

  @HasMany(() => UserModel, 'companyId')
  users: UserModel[];
}

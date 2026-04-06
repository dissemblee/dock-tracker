import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/shared/base/base.model';
import { UserRole } from './dto/user-role.enum';
import { CompanyModel } from 'src/company/company.model';
import { DocumentModel } from 'src/document/document.model';

@Table({ tableName: 'users' })
export class UserModel extends BaseModel<UserModel> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50],
    },
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  declare password: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
  })
  declare role: UserRole;

  @ForeignKey(() => CompanyModel)
  @Column
  declare companyId: number;

  @BelongsTo(() => CompanyModel, 'companyId')
  declare company: CompanyModel;

  @HasMany(() => DocumentModel)
  declare documents: DocumentModel[];
}

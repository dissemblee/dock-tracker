import {
  Column,
  DataType,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/shared/base/base.model';
import { UserModel } from 'src/user/user.model';
import { CompanyMemberModel } from './company-member.model';

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

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
    validate: {
      notEmpty: true,
      len: [10, 15],
    },
  })
  declare inn: string | null;

  /** Основной государственный регистрационный номер */
  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: [13, 15],
    },
  })
  declare ogrn: string | null;

  /** Юридический адрес */
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare address: string | null;

  /** Телефон компании */
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare phone: string | null;

  /** Email компании */
  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string | null;

  /** Сайт компании */
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare website: string | null;

  /** Ключ логотипа в S3 */
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare logoKey: string | null;

  /** Прямая связь — пользователи через companyMembers */
  @HasMany(() => CompanyMemberModel, 'companyId')
  declare members: CompanyMemberModel[];

  /** Обратная связь — пользователи, у которых companyId установлен напрямую */
  @HasMany(() => UserModel, 'companyId')
  declare users: UserModel[];
}

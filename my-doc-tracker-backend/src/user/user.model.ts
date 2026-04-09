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
import { CompanyMemberModel } from 'src/company/company-member.model';

/** Режим работы пользователя с документами */
export enum WorkMode {
  /** Видит только свои документы */
  PERSONAL = 'personal',
  /** Видит документы компании */
  COMPANY = 'company',
}

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

  /** Режим работы: personal (личные документы) или company (корпоративные) */
  @Column({
    type: DataType.ENUM(...Object.values(WorkMode)),
    allowNull: false,
    defaultValue: WorkMode.PERSONAL,
  })
  declare workMode: WorkMode;

  /** ID активной компании, когда workMode = 'company' */
  @ForeignKey(() => CompanyModel)
  @Column({ allowNull: true })
  declare activeCompanyId: number | null;

  @ForeignKey(() => CompanyModel)
  @Column
  declare companyId: number;

  @BelongsTo(() => CompanyModel, 'companyId')
  declare company: CompanyModel;

  /** Членства пользователя в компаниях (через таблицу company_members) */
  @HasMany(() => CompanyMemberModel, 'userId')
  declare companyMemberships: CompanyMemberModel[];

  @HasMany(() => DocumentModel)
  declare documents: DocumentModel[];
}

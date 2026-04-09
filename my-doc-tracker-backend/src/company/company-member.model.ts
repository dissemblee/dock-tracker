import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/shared/base/base.model';
import { UserModel } from 'src/user/user.model';
import { CompanyModel } from './company.model';
import { CompanyMemberRole } from './company-member-role.enum';

@Table({ tableName: 'company_members' })
export class CompanyMemberModel extends BaseModel<CompanyMemberModel> {
  @ForeignKey(() => UserModel)
  @Column({ allowNull: false })
  declare userId: number;

  @BelongsTo(() => UserModel, 'userId')
  declare user: UserModel;

  @ForeignKey(() => CompanyModel)
  @Column({ allowNull: false })
  declare companyId: number;

  @BelongsTo(() => CompanyModel, 'companyId')
  declare company: CompanyModel;

  @Column({
    type: DataType.ENUM(...Object.values(CompanyMemberRole)),
    allowNull: false,
    defaultValue: CompanyMemberRole.MEMBER,
  })
  declare role: CompanyMemberRole;

  @Column({ type: DataType.DATE, allowNull: true })
  declare invitedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare acceptedAt: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  declare inviteEmail: string | null;
}

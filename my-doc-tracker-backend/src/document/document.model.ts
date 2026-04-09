import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/shared/base/base.model';
import { UserModel } from 'src/user/user.model';
import { CompanyModel } from 'src/company/company.model';

@Table({ tableName: 'document' })
export class DocumentModel extends BaseModel<DocumentModel> {
  /** Пользователь, загрузивший документ */
  @ForeignKey(() => UserModel)
  @Column({ allowNull: false })
  declare userId: number;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  /** Компания, к которой принадлежит документ (null для личных) */
  @ForeignKey(() => CompanyModel)
  @Column({ allowNull: true })
  declare companyId: number | null;

  @BelongsTo(() => CompanyModel)
  declare company: CompanyModel;

  /** Флаг: документ общий для компании или личный */
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isCompanyDocument: boolean;

  @Column({ allowNull: false })
  declare title: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare notifyBefore: number;

  @Column({ allowNull: false, unique: true })
  declare fileKey: string;

  @Column({ allowNull: false })
  declare fileName: string;

  @Column({ allowNull: false })
  declare mimeType: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare size: number;

  @Column({ type: DataType.DATE, allowNull: false })
  declare uploadedAt: Date;
}

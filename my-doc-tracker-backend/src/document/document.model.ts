import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/shared/base/base.model';
import { UserModel } from 'src/user/user.model';

@Table({ tableName: 'document' })
export class DocumentModel extends BaseModel<DocumentModel> {
  @ForeignKey(() => UserModel)
  @Column({ allowNull: false })
  declare userId: number;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

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

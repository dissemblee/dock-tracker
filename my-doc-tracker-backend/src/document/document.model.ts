import { BelongsTo, Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { BaseModel } from "src/shared/base/base.model";
import { UserModel } from "src/user/user.model";

@Table({ tableName: 'document' })
export class DocumentModel extends BaseModel<DocumentModel> {
  @ForeignKey(() => UserModel)
  @Column({ allowNull: false })
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @Column({ allowNull: false })
  title: string;
  
  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt: Date;

  @Column({ type: DataType.INTEGER, allowNull: false })
  notifyBefore: number;

  @Column({ allowNull: false, unique: true })
  fileKey: string;

  @Column({ allowNull: false })
  fileName: string;

  @Column({ allowNull: false })
  mimeType: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  size: number;

  @Column({ type: DataType.DATE, allowNull: false })
  uploadedAt: Date;
}

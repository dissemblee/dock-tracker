import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/shared/base/base.model';
import { UserModel } from 'src/user/user.model';
import { DocumentModel } from 'src/document/document.model';

@Table({ tableName: 'reminders' })
export class ReminderModel extends BaseModel<ReminderModel> {
  @ForeignKey(() => UserModel)
  @Column({ allowNull: false })
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @ForeignKey(() => DocumentModel)
  @Column({ allowNull: true })
  documentId: number;

  @BelongsTo(() => DocumentModel)
  document: DocumentModel;

  @Column({ allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.DATE, allowNull: false })
  remindAt: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isSent: boolean;
}

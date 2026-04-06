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
  declare userId: number;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  @ForeignKey(() => DocumentModel)
  @Column({ allowNull: true })
  declare documentId: number;

  @BelongsTo(() => DocumentModel)
  declare document: DocumentModel;

  @Column({ allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare remindAt: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isSent: boolean;
}

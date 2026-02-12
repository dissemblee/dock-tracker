import { Column, DataType, Table } from "sequelize-typescript";
import { BaseModel } from "src/shared/base/base.model";


@Table({ tableName: 'users' })
export class UserModel extends BaseModel<UserModel> {

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
      len: [6, 20],
      notEmpty: true,
    },
  })
  declare hashPassword: string;
}

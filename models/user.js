"use strict";
import { Model } from "sequelize";

export default function User(sequelize, DataTypes) {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: DataTypes.STRING,
      status: DataTypes.TINYINT,
      active: DataTypes.TINYINT,
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
}

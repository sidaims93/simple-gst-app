"use strict";
import { Model } from "sequelize";

export default function UserOrganization(sequelize, DataTypes) {
  class UserOrganization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserOrganization.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: DataTypes.INTEGER,
      orgId: DataTypes.INTEGER,
      status: DataTypes.TINYINT,
    },
    {
      sequelize,
      modelName: "UserOrganization",
    },
  );
  return UserOrganization;
}

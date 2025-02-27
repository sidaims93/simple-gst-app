"use strict";
import { Model } from "sequelize";

export default function Organization(sequelize, DataTypes) {
  class Organization extends Model {
    static associate(models) {
      // define association here
    }
  }
  Organization.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Organization",
    },
  );
  return Organization;
}

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmailOTP extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmailOTP.init(
    {
      email: DataTypes.STRING,
      otp: DataTypes.STRING,
      status: DataTypes.TINYINT,
    },
    {
      sequelize,
      modelName: "EmailOTP",
    },
  );
  return EmailOTP;
};

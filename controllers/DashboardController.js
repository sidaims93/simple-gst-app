const db = require("./../models");
const { User, Organization, UserOrganization } = db;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  async index(req, res) {
    console.log("here in dashboardcontroller file");
    console.log(req.user);

    return res.json({
      message: "Welcome to auth route dashboard",
    });
  },
};

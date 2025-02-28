import nodemailer from "nodemailer";
import configData from "../config/email.json" with { type: "json" };

const env = process.env.NODE_ENV || "development";
const config = configData[env];

let config_obj = { ...config };

if (env === "production" && config.auth) {
  config_obj.auth = {
    user: config.auth.user,
    pass: process.env.EMAIL_PASS || "",
  };
}
const transporter = nodemailer.createTransport(config_obj);
export default transporter;

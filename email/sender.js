const fs = require("fs");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const email_verify_template = fs.readFileSync(
  "./email/templates/send_otp.ejs",
  "utf8",
);
const env = process.env.NODE_ENV || "development";
const config = require("./../config/email.json")[env];

let config_obj = { ...config };

if (env === "production" && config.auth) {
  config_obj.auth = {
    user: config.auth.user,
    pass: process.env.EMAIL_PASS || "",
  };
}

module.exports = {
  verifyHMAC(data, givenHmac, givenTimestamp, secret, timeWindow = 600) {
    const formatedData = `${data}:${givenTimestamp}`;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (Math.abs(currentTimestamp - givenTimestamp) > timeWindow) {
      return false; // link expired
    }

    const expectedHmac = crypto
      .createHmac("sha256", secret)
      .update(formatedData)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedHmac, "hex"),
      Buffer.from(givenHmac, "hex"),
    );
  },

  async generateHMAC(data, secret) {
    const timestamp = Math.floor(Date.now() / 1000);
    const formatedData = `${data}:${timestamp}`;
    const hmac = crypto
      .createHmac("sha256", secret)
      .update(formatedData)
      .digest("hex");
    return { hmac, timestamp };
  },

  generateOTPForEmail(email) {
    let result = "";
    let length = 6;
    const characters = "0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }

    return result;
  },

  async sendEmailVerificationEmail(name, hmac, to, timeStamp, otp) {
    // hmac will be verifyied at the verification end.
    const htmlContent = ejs.render(email_verify_template, {
      name,
      hmac,
      to,
      timeStamp,
      otp,
    });

    const mailOptions = {
      from: "GST APP <" + process.env.EMAIL_ADDR + ">",
      to,
      subject: "Verify email",
      html: htmlContent,
    };

    const transporter = nodemailer.createTransport(config_obj);
    await transporter.sendMail(mailOptions);
    return true;
  },
};

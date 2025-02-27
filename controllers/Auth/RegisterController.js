const db = require("./../../models");
const { User, Organization, UserOrganization } = db;
const bcrypt = require("bcrypt");
const fs = require("fs");
const ejs = require("ejs");
const saltRounds = 10;

const sendEmailVerificationEmail = require("../../email/sender.js").default;
const crypto = require("crypto");

function generateHMAC(data, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const formatedData = `${data}:${timestamp}`;
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(formatedData)
    .digest("hex");
  return { hmac, timestamp };
}

function verifyHMAC(data, givenHmac, givenTimestamp, secret, timeWindow = 600) {
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
}

module.exports = {
  async signup(req, res) {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName) {
      return res
        .json({
          error: "Invalid or empty first name!",
        })
        .status(400);
    }

    if (!lastName) {
      return res
        .json({
          error: "Invalid or empty last name!",
        })
        .status(400);
    }

    if (!email) {
      return res
        .json({
          error: "Invalid or empty email!",
        })
        .status(400);
    }

    if (!password) {
      return res
        .json({
          error: "Invalid or empty password!",
        })
        .status(400);
    }

    //Check duplicated email first in DB
    let checkDuplicateEmail = await User.findOne({
      where: { email: email },
      raw: true,
    });
    if (checkDuplicateEmail) {
      return res
        .json({
          error: "Duplicate email detected!",
        })
        .status(422);
    }

    if (password.length < 4 && password.length > 50) {
      return res
        .json({
          error: "Password must be between 4 and 50 characters!",
        })
        .status(400);
    }

    const salt = await bcrypt.genSalt();
    let hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.genSalt(saltRounds, async (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          console.log("hashedPassword", hash);
          return resolve(hash);
        });
      });
    });

    let dbPayload = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      status: true,
      active: false, //active false because this account is not verified yet (Email/OTP auth)
    };

    const { hmac, timestamp } = generateHMAC(email, process.env.APP_SECRET);
    sendEmailVerificationEmail(firstName, hmac, email, timestamp);

    const userRow = await User.create(dbPayload);
    //Create an organization and add the mapping
    const organization = await Organization.create({
      name: "My workspace",
    });
    const userOrganization = await UserOrganization.create({
      userId: userRow.id,
      orgId: organization.id,
    });

    return res
      .json({
        message: "Registration successful!",
      })
      .status(200);
  },

  async verifyEmail(req, res) {
    const success_template_file = fs.readFileSync(
      "./email/templates/success.ejs",
      "utf8",
    );
    const fail_template_file = fs.readFileSync(
      "./email/templates/fail.ejs",
      "utf8",
    );
    const success_template = ejs.render(success_template_file, {});
    const fail_template = ejs.render(fail_template_file, {});

    const { hmac, time, email } = req.query;
    if (!hmac || !time || !email) {
      return res.status(400).send(fail_template);
    }

    const isValid = verifyHMAC(email, hmac, time, process.env.APP_SECRET);

    if (!isValid) {
      return res.status(400).send(fail_template);
    }

    let user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).send(fail_template);
    }
    await user.update({ active: true });

    return res.status(400).send(success_template);
  },
};

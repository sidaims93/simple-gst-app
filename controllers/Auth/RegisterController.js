const db = require("./../../models");
const { User, Organization, UserOrganization, EmailOTP } = db;
const bcrypt = require("bcrypt");
const fs = require("fs");
const ejs = require("ejs");
const saltRounds = 10;

const emailModule = require("../../email/sender.js");
const crypto = require("crypto");

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

    const { hmac, timestamp } = emailModule.generateHMAC(
      email,
      process.env.APP_KEY,
    );
    const otp = emailModule.generateOTPForEmail(email);
    await EmailOTP.create({
      email: email,
      otp: otp,
      status: false,
    });

    try {
      //TODO: Fix this function, either by adding credentials or something. And test this out through and thorough to make sure that the email is getting sent with the dynamic OTP.

      await emailModule.sendEmailVerificationEmail(
        firstName,
        hmac,
        email,
        timestamp,
        otp,
      );
    } catch (error) {
      console.log("error in sending email ", error.message);
    }

    const userRow = await User.create(dbPayload);

    //Create an organization and add the mapping
    const organization = await Organization.create({
      name: "My workspace",
    });

    const userOrganization = await UserOrganization.create({
      userId: userRow.id,
      orgId: organization.id,
    });

    /*
     * The expectation is to send the email to the frontend after signing up
     * so that the frontend client can redirect to a URL named
     * "/email/verify?email={email}" and that will contain a pre-populated
     * email box with an OTP box and a message will show - "Please enter the OTP sent on your email"
     *
     * Hitting that submit button would call the API => email/verify (POST) with the OTP
     *
     */
    return res
      .json({
        message: "Registration successful!",
        email: email,
      })
      .status(200);
  },

  async verifyOTP(req, res) {
    const { email, otp } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Invalid email" });
    }

    if (!otp) {
      return res.status(400).json({ error: "Invalid OTP!" });
    }

    const existingRecord = await EmailOTP.findOne({
      where: { email: email, otp: otp, status: false },
    }); //Should be an un-used OTP

    if (!existingRecord) {
      return res.status(400).json({ error: "Invalid Email or OTP" });
    }

    //Mark this OTP as used, and mark the user account associated with this email active too.
    EmailOTP.update({ status: true }, { where: { id: existingRecord.id } });
    User.update({ active: true }, { where: { email: email } });

    //TODO: Create a Bearer token and pass it to response, so the user can be taken to their dashboard instantaneously

    return res.status(200).json({ message: "Account Verified!" });
  },
};

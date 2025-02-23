const db = require('./../../models');
const { User, Organization, UserOrganization } = db;
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
  async signup(req, res) {

    const { email, password } = req.body;
    if(!email) {
      return res.json({
        error: 'Invalid or empty email!'
      }).status(400);
    }

    if(!password) {
      return res.json({
        error: 'Invalid or empty password!'
      }).status(400);
    }

    //Check duplicated email first in DB
    let checkDuplicateEmail = await User.findOne({where: {email: email}, raw: true});
    if(checkDuplicateEmail) {
      return res.json({
        error: 'Duplicate email detected!'
      }).status(422);
    }

    if(password.length < 4 && password.length > 50) {
      return res.json({
        error: 'Password must be between 4 and 50 characters!'
      }).status(400);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    //TODO: Check this later to see why it's not working properly
    /*
    let hashedPassword = await new Promise((resolve, reject) => {
      await bcrypt.genSalt(saltRounds, async function(err, salt) {
        await bcrypt.hash(password, salt, function(err, hash) {
          console.log('hashedPassword', hash);
          return resolve(hash);
        });
      });
    });
    */

    let dbPayload = {
      email: email,
      password: hashedPassword,
      status: true,
      active: false //active false because this account is not verified yet (Email/OTP auth)
    };

    //TODO: Write an email handler here to send an OTP to the registered email 
    
    const userRow = await User.create(dbPayload);
    //Create an organization and add the mapping
    const organization = await Organization.create({
      name: 'My workspace'
    });
    const userOrganization = await UserOrganization.create({
      userId: userRow.id,
      orgId: organization.id
    });

    return res.json({
      message: "Registration successful!"
    }).status(200);
  },

  verifyEmail(req, res) {
    console.log('In verify email function ');
    console.log(req.body);

    return res.json({
      status: true,
      message: 'In verifyEmail function registerController'
    })
  }

}

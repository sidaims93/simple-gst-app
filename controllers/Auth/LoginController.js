const db = require('./../../models');
const { User, Organization, UserOrganization } = db;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  
  async login (req, res) {

    const { email, password } = req.body;
    
    if(!email) {
      return res.json({
        error: 'Invalid or empty email'
      }).status(400);
    }

    if(!password) {
      return res.json({
        error: 'Invalid or empty password'
      }).status(400);
    }

    const userRow = await User.findOne({ where: {email: email}, raw: true});
    if(!userRow) {
      return res.json({
        error: `User ${email} not found!`
      }).status(404);
    }

    if(!userRow.active) {
      return res.json({
        error: 'Unverified account. Please check your email for a verification link.'
      }).status(422);
    }

    if(!userRow.status) {
      return res.json({
        error: 'This account is disabled. Please contact support for assistance.'
      }).status(422);
    }

    //Verify the password 
    let validPassword = await new Promise(async (resolve, reject) => {
      await bcrypt.compare(password, userRow.password, function(err, result) {
        return resolve(result);
      });
    });

    if(!validPassword) {
      return res.json({
        error: 'Invalid email or password!'
      }).status(400);
    }

    //Now that email and password is correct, return a JSON web token
    let token = jwt.sign({ id: userRow.id }, 'someverylongstringyoucannotguess');
    return res.json({ message: 'Logged In!', token: token });

  }
}

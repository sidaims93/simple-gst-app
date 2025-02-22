let express = require('express');
let router = express.Router();
const RegisterController = require('../controllers/Auth/RegisterController');
const LoginController = require('../controllers/Auth/LoginController');
const PasswordResetController = require('../controllers/Auth/PasswordResetController');
/* GET users listing. */
router.post('/register', RegisterController.signup);
router.post('/login', LoginController.login);
router.post('/verify/email', RegisterController.verifyEmail);
router.post('/password/reset', PasswordResetController.passwordReset);

module.exports = router;

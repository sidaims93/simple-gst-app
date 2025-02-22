module.exports = {

  signup(req, res) {
    console.log('======req.body======');
    console.log(req.body);

    return res.json({
      status: true,
      message: 'In register API',
      body: req.body
    });
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

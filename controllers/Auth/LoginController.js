module.exports = {

  login (req, res) {
    console.log('=======req.body=======');
    console.log(req.body);

    return res.json({
      status: true
    });
  }

}

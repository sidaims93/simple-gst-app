var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  return res.json({
    status: true,
    message: "Welcome to GST App",
  });
});

module.exports = router;

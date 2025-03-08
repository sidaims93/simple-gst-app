var express = require("express");
var router = express.Router();
var mw = require("../middleware/auth.js");
var DashboardController = require("../controllers/DashboardController");
/* GET home page. */
router.get("/", mw.RequireAuth, DashboardController.index);

module.exports = router;

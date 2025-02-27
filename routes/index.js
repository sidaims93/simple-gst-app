import express from "express";
const router = express.Router();
export default router;

/* GET home page. */
router.get("/", function (req, res, next) {
  return res.json({
    status: true,
    message: "Welcome to GST App",
  });
});

const jwt = require("jsonwebtoken");
module.exports = {
  RequireAuth: async function (req, res, next) {
    console.log("here in RequireAuth");
    console.log("ENV SECRET", process.env.APP_KEY);
    let token = req.headers["authorization"];

    // Remove Bearer from string
    console.log("token here", token);
    token = token.split(" ")[1];
    console.log("token received", token);

    if (token) {
      jwt.verify(token, process.env.APP_KEY, (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: "Token is not valid",
          });
        }
        req.user = decoded;
        next();
      });
    } else {
      return res.json({
        success: false,
        message: "Token not provided",
      });
    }
  },
};

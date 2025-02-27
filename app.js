import "dotenv/config";

import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import passport from "passport";
import passportJWT from "passport-jwt";
import session from "express-session";

//Register Routes
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

const app = express();
export default app;

console.log("APP_KEY", process.env.APP_KEY);

app.use(
  session({
    secret: process.env.APP_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);
// view engine setup
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("./public"));

app.use(passport.initialize());
app.use(passport.session());

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.APP_KEY;

import User from "./models/user.js";

// lets create our strategy for web token
let strategy = new JwtStrategy(jwtOptions, async function (jwt_payload, next) {
  console.log("payload received", jwt_payload);
  let user = await User.findOne({ id: jwt_payload.id });
  next(null, user ? user : false);
});
// use the strategy
passport.use(strategy);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

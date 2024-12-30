const path = require("path");
const express = require("express");
const session = require("express-session");
const passport = require("./config/passport.js");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./db/pool.js");
const { validationResult, body } = require("express-validator");
const validateUser = require("./config/validateUser.js");
const bcrypt = require("bcryptjs");
const protectedRoutes = require("./protectedRoutes.js");
require("dotenv").config();

const redirectHome = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  next();
};

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
      pool,
    }),
  })
);
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get("/login", redirectHome, (req, res) => {
  res.render("login");
});

app.get("/register", redirectHome, (req, res) => {
  res.render("register");
});

app.post("/register", validateUser, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .render("register", { errors: errors.array(), inputs: req.body });
  }

  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    await pool.query(
      "INSERT INTO users (full_name, username, password, is_admin) VALUES ($1, $2, $3, $4)",
      [req.body.full_name, req.body.username, hash, req.body.is_admin]
    );
  } catch (err) {
    next(err);
  }

  res.redirect("/");
});

app.post(
  "/session",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.delete("/session", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }

    res.end();
  });
});

app.use("/", protectedRoutes);

app.listen(process.env.PORT);

const ps = require("passport");
const pool = require("../db/pool.js");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const passport = new ps.Passport();

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE LOWER(username) = LOWER($1)",
        [username]
      );
      const user = rows[0];

      if (!user) {
        return done(null, false);
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false);
      }

      done(null, user);
    } catch (err) {
      done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;

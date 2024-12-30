const pool = require("./db/pool.js");
const { Router } = require("express");
const { validationResult, body } = require("express-validator");

const router = Router();

const redirectLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
};

router.use(redirectLogin);

router.get("/", async (req, res) => {
  const { rows: messages } = await pool.query(
    "SELECT * FROM users INNER JOIN messages ON users.id = messages.user_id ORDER BY timestamp DESC"
  );

  res.render("index", { messages });
});

router.get("/join", (req, res) => {
  res.render("join");
});

router.post(
  "/join",
  body("code")
    .custom((value) => value == "secrets")
    .withMessage("Incorrect!"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("join", { errors: errors.array() });
    }

    await pool.query("UPDATE users SET is_member = true WHERE id = $1", [
      req.user.id,
    ]);
    res.redirect("/");
  }
);

router.post("/messages", async (req, res) => {
  await pool.query(
    "INSERT INTO messages (title, body, user_id) VALUES ($1, $2, $3)",
    [req.body.title, req.body.body, req.user.id]
  );
  res.redirect("/");
});

router.delete("/messages", async (req, res) => {
  if (!req.user.is_admin) {
    return res.status(401).end();
  }

  await pool.query("DELETE FROM messages WHERE id = $1", [req.body.id]);
  res.status(204).end();
});

module.exports = router;

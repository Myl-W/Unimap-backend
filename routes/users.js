var express = require("express");
var router = express.Router();
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../modules/auth");

// !  Generation de la secret key dans powershell
// !  [System.Convert]::ToBase64String((1..64 | ForEach-Object {Get-Random -Maximum 256}))
const SECRET_KEY = process.env.SECRET_KEY;
router.use("/profile", authenticateToken);

// Inscription
router.post("/register", (req, res) => {
  if (!checkBody(req.body, ["firstname", "email", "password"])) {
    return res.json({ result: false, error: "Champs manquants ou vides" });
  }

  User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.firstname }],
  })
    .then((existingUser) => {
      if (existingUser) {
        return res.json({ result: false, error: "User already exists" });
      }

      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        email: req.body.email,
        password: hash,
        lastname: req.body.lastname || null,
        birthdate: req.body.birthdate || null,
        disability: req.body.disability || null,
      });

      newUser.save().then(() => {
        const token = jwt.sign(
          {
            firstname: newUser.firstname,
            email: newUser.email,
            id: newUser._id,
          },
          SECRET_KEY,
          { expiresIn: "1h" }
        );

        res.json({ result: true, token });
      });
    })
    .catch((err) => {
      console.error("Signup error:", err);
      res.status(500).json({ result: false, error: "Internal server error" });
    });
});

// Connexion
router.post("/login", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res.json({ result: false, error: "Champs manquants ou vides" });
  }

  User.findOne({ email: req.body.email.trim().toLowerCase() })
    .then((user) => {
      if (
        !user ||
        !bcrypt.compareSync(req.body.password.trim(), user.password)
      ) {
        return res.json({
          result: false,
          error: "Invalid username or password",
        });
      }

      const token = jwt.sign(
        {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          id: user._id,
          birthdate: user.birthdate,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.json({
        result: true,
        token,
        userId: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        birthdate: user.birthdate,
        email: user.email,
      });
    })
    .catch((err) => {
      console.error("Signin error:", err);
      res.status(500).json({ result: false, error: "Internal server error" });
    });
});

module.exports = router;

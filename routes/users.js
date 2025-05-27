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
// Vérification de la présence du token pour les routes suivantes
router.use("/profile", authenticateToken);

// Inscription de l'utilisateur
router.post("/register", (req, res) => {
  if (!checkBody(req.body, ["firstname", "email", "password"])) {
    return res.json({ result: false, error: "Champs manquants ou vides" });
  }

  User.findOne({
  // Vérifie si l'email ou le nom d'utilisateur existe déjà
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
          { expiresIn: "7d" } // Token expires in 7 days
        );

        res.json({ result: true, token });
      });
    })
    .catch((err) => {
      console.error("Signup error:", err);
      res.status(500).json({ result: false, error: "Internal server error" });
    });
});

// Connexion de l'utilisateur
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
        { expiresIn: "7d" }
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

// Ajout d'un favoris de l'utilisateur
router.post("/addFavorites", authenticateToken, (req, res) => {
  const userEmail = req.user.email; // l'email extrait du token
  const favoriteItem = req.body.favorite; // l'élément à ajouter aux favoris

  if (!favoriteItem) {
    return res.status(400).json({ result: false, error: "Missing favorite" });
  }
  User.findOne({ email: userEmail })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          result: false,
          error: "User not found",
        });
      }
      // Vérification si l'élément est déjà dans les favoris
      if (user.favorites.includes(favoriteItem)) {
        return res.json({
          result: false,
          error: "Already in favorites",
        });
      }
      // Ajout de l'élément aux favoris
      user.favorites.push(favoriteItem);

      user
        .save()
        .then((updatedUser) => {
          res.json({
            result: true,
            favorites: updatedUser.favorites,
          });
        })
        .catch((err) => {
          res.status(500).json({
            result: false,
            error: "Database save error",
            details: err.message,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        result: false,
        error: "Database find error",
        details: err.message,
      });
    });
});

// Récupération des favoris de l'utilisateur
router.get("/favorites", authenticateToken, async (req, res) => {
  const userEmail = req.user.email; // l'email extrait du token

  try {
    // Récupération de l'utilisateur à partir de l'email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.json({ result: false, error: "Invalid user" });
    }

    res.json({
      result: true,
      favorites: user.favorites,
    });
  } catch (err) {
    console.error("Favorites retrieval error:", err);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Mettre à jour l'adresse
router.put('/address', authenticateToken, async (req, res) => {
    console.log("BODY:", req.body, "USER ID:", req.user.id);
  const { homeAddress, workAddress } = req.body;
  const update = {};
  if (homeAddress !== undefined) update.homeAddress = homeAddress;
  if (workAddress !== undefined) update.workAddress = workAddress;

  try {
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });
    res.json({ homeAddress: user.homeAddress, workAddress: user.workAddress });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les adresses à la connexion
router.get('/address', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ homeAddress: user.homeAddress, workAddress: user.workAddress });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

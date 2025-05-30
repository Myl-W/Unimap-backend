var express = require("express");
var router = express.Router();
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../modules/auth");
const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");
const mongoose = require("mongoose");

// !  Generation de la secret key dans powershell
// !  [System.Convert]::ToBase64String((1..64 | ForEach-Object {Get-Random -Maximum 256}))
const SECRET_KEY = process.env.SECRET_KEY;

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

      const hash = bcrypt.hashSync(req.body.password, 10); // 10 est le nombre de tours de hachage

      const newUser = new User({
        firstname: req.body.firstname,
        email: req.body.email,
        password: hash,
        lastname: req.body.lastname,
        birthdate: req.body.birthdate,
        disability: req.body.disability || null,
      });

      newUser.save().then(() => {
        const token = jwt.sign(
          // Génération du token JWT
          {
            firstname: newUser.firstname,
            email: newUser.email,
            id: newUser._id,
          },
          SECRET_KEY,
          { expiresIn: "7d" } // Token expires in 7 days
        );
        // Récupérer explicitement toutes les données de l'utilisateur
        res.json({
          result: true,
          token,
          userId: newUser._id,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          birthdate: newUser.birthdate,
          email: newUser.email,
          username: newUser.username || null,
          profilePhoto: newUser.profilePhoto || null,
        });
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

      // Récupérer explicitement toutes les données de l'utilisateur
      const token = jwt.sign(
        // Génération du token JWT
        {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          id: user._id,
          username: user.username,
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
        username: user.username || null,
        profilePhoto: user.profilePhoto || null,
      });
    })
    .catch((err) => {
      console.error("Signin error:", err);
      res.status(500).json({ result: false, error: "Internal server error" });
    });
});

// Ajout d'un favoris de l'utilisateur
router.post("/addFavorites", authenticateToken, (req, res) => {
  const userEmail = req.user.email; // req.user provient du middleware authenticateToken
  const favoriteItem = req.body.favorite;

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
            favorites: updatedUser.favorites, // Retourne la liste mise à jour des favoris
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
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }
    res.json({ result: true, favorites: user.favorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Ajouter un favori
router.post("/favorites", authenticateToken, async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name || !address) {
      return res
        .status(400)
        .json({ result: false, error: "Name and address are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    const favorite = {
      _id: new mongoose.Types.ObjectId(), // Génère un nouvel ObjectId pour le favori
      name,
      address,
    };
    user.favorites.push(favorite);
    await user.save(); // Enregistre le favori dans la base de données

    res.json({ result: true, favorite });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Modifier un favori
router.put("/favorites/:index", authenticateToken, async (req, res) => {
  try {
    const { name, address } = req.body; // Récupère le nom et l'adresse du favori à modifier
    const index = parseInt(req.params.index); // Récupère l'index du favori à modifier

    if (!name || !address) {
      return res
        .status(400)
        .json({ result: false, error: "Name and address are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    if (index < 0 || index >= user.favorites.length) {
      // A tester
      // Vérifie si l'index est valide
      return res
        .status(404)
        .json({ result: false, error: "Favorite not found" });
    }

    user.favorites[index] = { name, address }; // Met à jour le favori avec le nouveau nom et l'adresse
    await user.save();

    res.json({ result: true, favorite: user.favorites[index] }); // Retourne le favori mis à jour
  } catch (error) {
    console.error("Error updating favorite:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Supprimer un favori
router.delete("/favorites/:favoriteId", authenticateToken, async (req, res) => {
  try {
    const favoriteId = req.params.favoriteId; // Récupère l'ID du favori à supprimer

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    // Utilise pull pour supprimer le favori avec l'ID correspondant
    user.favorites.pull({ _id: favoriteId });
    await user.save();

    res.json({ result: true });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Mettre à jour l'adresse
router.put("/address", authenticateToken, async (req, res) => {
  const { homeAddress, workAddress } = req.body; // Récupère les adresses de l'utilisateur
  const update = {};
  if (homeAddress !== undefined) update.homeAddress = homeAddress; // Met à jour l'adresse de l'utilisateur
  if (workAddress !== undefined) update.workAddress = workAddress; // Met à jour l'adresse de l'utilisateur

  try {
    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
    });
    res.json({ homeAddress: user.homeAddress, workAddress: user.workAddress }); // Retourne les adresses mises à jour
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer les adresses à la connexion
router.get("/address", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ homeAddress: user.homeAddress, workAddress: user.workAddress }); // Retourne les adresses de l'utilisateur
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour mettre à jour la photo de profil
router.post("/profile/photo", authenticateToken, async (req, res) => {
  if (!req.files || !req.files.photo) {
    // Vérifie si une photo a été envoyée
    return res
      .status(400)
      .json({ result: false, error: "Aucune image envoyée" });
  }
  const tempFilePath = `/tmp/${uniqid()}.jpg`; // Chemin temporaire pour l'image
  const resultMove = await req.files.photo.mv(tempFilePath); // Déplace l'image vers le chemin temporaire
  if (resultMove) {
    return res.status(500).json({ result: false, error: resultMove });
  }
  const resultCloudinary = await cloudinary.uploader.upload(tempFilePath); // Téléverse l'image vers Cloudinary
  fs.unlinkSync(tempFilePath); // Supprimer le fichier temporaire
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto: resultCloudinary.secure_url }, // Mettre à jour l'URL de la photo de profil
      { new: true } // Retourner l'utilisateur mis à jour
    );
    res.json({ result: true, photo: user.profilePhoto });
  } catch (err) {
    console.error("Error updating profile photo:", err);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Route pour mettre à jour le profil utilisateur
// Utilise PUT car c'est une mise à jour
// authenticateToken vérifie que l'utilisateur est connecté
router.put("/profile/update", authenticateToken, async (req, res) => {
  try {
    // Extraction de tous les champs possibles de la requête
    const {
      firstname,
      lastname,
      email,
      password,
      oldPassword,
      username,
      birthdate,
      homeAddress,
      workAddress,
      disability,
    } = req.body;
    const userId = req.user.id; // ID de l'utilisateur extrait du module authentificate token

    // Recherche de l'utilisateur dans la base de données
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        result: false,
        error: "Utilisateur non trouvé",
      });
    }

    // Vérifie si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== currentUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } }); //'$ne' --> Not equal
      if (existingUser) {
        return res.status(400).json({
          result: false,
          error: "Cet email est déjà utilisé",
        });
      }
    }

    // Vérifie si le username est déjà utilisé
    if (username && username !== currentUser.username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existingUsername) {
        return res.status(400).json({
          result: false,
          error: "Ce nom d'utilisateur est déjà utilisé",
        });
      }
    }

    // Mise à jour des champs si ils sont présents dans la requête
    if (firstname) currentUser.firstname = firstname;
    if (lastname) currentUser.lastname = lastname;
    if (email) currentUser.email = email.toLowerCase();
    if (birthdate) currentUser.birthdate = birthdate;
    if (homeAddress) currentUser.homeAddress = homeAddress;
    if (workAddress) currentUser.workAddress = workAddress;
    if (disability) currentUser.disability = disability;

    // Le username peut être null ou contenir une valeur
    currentUser.username = username;

    // Gestion spéciale du mot de passe
    if (password) {
      // Vérifie que l'ancien mot de passe est fourni
      if (!oldPassword) {
        return res.status(400).json({
          result: false,
          error:
            "L'ancien mot de passe est requis pour changer le mot de passe",
        });
      }

      // Vérifie que l'ancien mot de passe est correct
      const isValidPassword = bcrypt.compareSync(
        oldPassword,
        currentUser.password
      );
      if (!isValidPassword) {
        return res.status(400).json({
          result: false,
          error: "L'ancien mot de passe est incorrect",
        });
      }

      // Hash du nouveau mot de passe
      currentUser.password = bcrypt.hashSync(password, 10);
    }

    // Sauvegarde les modifications dans la base de données
    await currentUser.save();

    // Prépare la réponse en enlevant le mot de passe
    const userResponse = currentUser.toObject(); // Convertit le document Mongoose en objet JavaScript
    delete userResponse.password;

    // Génère un nouveau token avec les informations mises à jour
    const token = jwt.sign(
      {
        firstname: userResponse.firstname,
        lastname: userResponse.lastname,
        email: userResponse.email,
        id: userResponse._id,
        username: userResponse.username,
        birthdate: userResponse.birthdate,
      },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Envoie la réponse avec le nouveau token et les données utilisateur
    res.json({
      result: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({
      result: false,
      error: "Erreur lors de la mise à jour du profil",
      details: error.message,
    });
  }
});

// Supprimer le compte utilisateur
router.delete("/profile/delete", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        result: false,
        error: "Utilisateur non trouvé",
      });
    }

    // Vérifier le mot de passe
    if (!password) {
      return res.status(400).json({
        result: false,
        error: "Le mot de passe est requis pour supprimer le compte",
      });
    }

    // Utiliser exactement la même logique que pour la connexion
    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({
        result: false,
        error: "Mot de passe incorrect",
      });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    res.json({
      result: true,
      message: "Compte supprimé avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du compte:", error);
    res.status(500).json({
      result: false,
      error: "Erreur lors de la suppression du compte",
    });
  }
});

module.exports = router;

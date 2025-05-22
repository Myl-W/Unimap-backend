var express = require("express");
var router = express.Router();
const authenticateToken = require("../modules/auth");

const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Place = require("../models/places");

router.post("/upload", authenticateToken, async (req, res) => {
  // créer un chemin d'adresse temporaite avec un id
  const photoPath = `./tmp/${uniqid()}.jpg`; // il faudra enlever le '.' lors du déploiement sur vercel
  console.log('photoPath', photoPath)
  // copier le photoFormFront du front et je le mets dans le dossier /tmp/...
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    // s'il est vide envoi à cloudinary et delete fichier temporaire
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath); // supprime le photopath

    // ---------- Enregistrement en BDD avec l'url de l'image ----------
    const newPlace = new Place({
      pictures: [resultCloudinary.secure_url],
      signalement: 0,
      comments: [],
    });

    const savedPlace = await newPlace.save(); // Attends puis enregistre en BDD

    res.json({
      result: true,
      url: resultCloudinary.secure_url,
      place: savedPlace,
    });
  } else {
    // sinon contient le message d'erreur
    res.json({ result: false, error: resultMove });
  }
});

module.exports = router;

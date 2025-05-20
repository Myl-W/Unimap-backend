var express = require("express");
var router = express.Router();
const authenticateToken = require("../modules/auth");

const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

router.post("/upload", authenticateToken, async (req, res) => {
  // créer un chemin d'adresse temporaite avec un id
  const photoPath = `/tmp/${uniqid()}.jpg`;
  // copier le photoFormFront du front et je le mets dans le dossier /tmp/...
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    // s'il est vide envoi à cloudinary et delete fichier temporaire
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath); // supprime le photopath
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    // sinon contient le message d'erreur
    res.json({ result: false, error: resultMove });
  }
});

module.exports = router;

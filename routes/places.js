var express = require("express");
var router = express.Router();
const authenticateToken = require("../modules/auth");

const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Place = require("../models/places");

// ---------- Route to upload a photo with Cloudinary ----------
router.post("/upload", authenticateToken, async (req, res) => {
  // créer un chemin d'adresse temporaite avec un id
  const photoPath = `./tmp/${uniqid()}.jpg`; // il faudra enlever le '.' lors du déploiement sur vercel
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

// --------- Route to get all places ----------
router.get("/places", authenticateToken, async (req, res) => {
  try {
    const places = await Place.find();
    res.json({ result: true, places });
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------ Route to get a place by ID -------------
router.get("/place/:id", authenticateToken, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }
    res.json({ result: true, place });
  } catch (error) {
    console.error("Error fetching place:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------ Route to delete a place by ID -------------
router.delete("/place/:id", authenticateToken, async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }
    res.json({ result: true, message: "Place deleted successfully" });
  } catch (error) {
    console.error("Error deleting place:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

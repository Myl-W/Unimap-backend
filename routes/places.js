var express = require("express");
var router = express.Router();
const authenticateToken = require("../modules/auth");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Place = require("../models/places");

router.post("/upload", authenticateToken, async (req, res) => {
  const photoPath = `/tmp/${uniqid()}.jpg`; // Chemin temporaire pour stocker l'image téléchargée
  const resultMove = await req.files.photoFromFront.mv(photoPath); // Déplace le fichier téléchargé vers le chemin temporaire

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath); // Supprime le fichier temporaire après l'upload sur Cloudinary

    const TOLERANCE = 0.0001; // Tolerance de 4 chiffres après la virgule pour la latitude et la longitude (~ 11 mètres)

    // Assure que ce sont des nombres
    const lat = parseFloat(req.body.latitude);
    const lng = parseFloat(req.body.longitude);

    // Cherche une place existante avec les mêmes coordonnées
    const existingPlace = await Place.findOne({
      // Vérifie si la latitude et la longitude sont dans la plage de tolérance
      // exemple: 10 - 1 = 9, 10 + 1 = 11, tout se qui est entre 9 et 11 est le meme point
      latitude: { $gte: lat - TOLERANCE, $lte: lat + TOLERANCE }, // methode mongoose $gte = "greater than or equal" → supérieur ou égal
      longitude: { $gte: lng - TOLERANCE, $lte: lng + TOLERANCE }, // methode mongoose $lte = "less than or equal" → inférieur ou égal
    });

    let savedPlace;

    if (existingPlace && req.body.handicap === existingPlace.handicap) {
      // Remplace l'ancienne image par la nouvelle
      existingPlace.picture = resultCloudinary.secure_url;
      savedPlace = await existingPlace.save();
    } else {
      let adjustedLat = lat;
      let adjustedLng = lng;

      if (existingPlace) {
        // Si une place existe déjà, on ajuste légèrement les coordonnées pour éviter la superposition
        const OFFSET = 0.0001;

        const seed = Math.random() * 10000; // On génère un nombre aléatoire pour créer une direction unique

        const angle = (seed % 360) * (Math.PI / 180); // On transforme ce nombre en un angle (entre 0° et 360°), converti en radians

        const radius = (Math.random() * OFFSET) / 2; // On choisit une petite distance aléatoire autour du point (max = OFFSET/2)

        adjustedLat += radius * Math.cos(angle); // On décale légèrement la latitude selon l’angle choisi

        adjustedLng += radius * Math.sin(angle); // On décale légèrement la longitude selon l’angle choisi
      }

      const newPlace = new Place({
        picture: resultCloudinary.secure_url,
        signalement: 0,
        comments: [],
        latitude: adjustedLat,
        longitude: adjustedLng,
        handicap: req.body.handicap,
      });
      savedPlace = await newPlace.save();
    }

    res.json({
      result: true,
      url: resultCloudinary.secure_url,
      place: savedPlace,
    });
  } else {
    res.json({ result: false, error: resultMove });
  }
});

// --------- Route to get all places ----------
router.get("/places", authenticateToken, async (req, res) => {
  try {
    const places = await Place.find().populate("comments");
    if (!places) {
      return res.status(404).json({ error: "No places found" });
    }
    res.json({ result: true, places });
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------ Route to get a place by ID -------------
router.get("/place/:id", authenticateToken, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id).populate("comments");
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

// ------------ Route to increment signalement by place ID-------------
router.put("/place/:id/signalement", authenticateToken, async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { $inc: { signalement: 1 } }, // methode mongoose $inc pour incrementer signalement de 1
      { new: true } // Return the updated document
    );
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }
    res.json({ result: true, place });
  } catch (error) {
    console.error("Error updating signalement:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

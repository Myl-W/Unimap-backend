var express = require("express");
var router = express.Router();
const authenticateToken = require("../modules/auth");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Place = require("../models/places");
// const mongoose = require("mongoose");

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
      picture: resultCloudinary.secure_url,
      signalement: 0,
      comments: [],
      latitude: req.body.latitude,
      longitude: req.body.longitude,
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
  // const { id } = req.params;
  // // Vérifie que l'ID est un ObjectId valide
  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return res.status(400).json({ error: "Invalid place ID" });
  // }
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
      { $inc: { signalement: 1 } }, // Increment signalement by 1
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

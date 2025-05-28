const express = require("express");
const router = express.Router();
const authenticateToken = require("../modules/auth");

require("../models/connection");
const Comment = require("../models/comments");
const Place = require("../models/places");

// POST /comments : ajouter un commentaire
router.post("/", authenticateToken, async (req, res) => {
  const { picture, comment, placeId } = req.body;
  console.log("📥 Commentaire reçu avec placeId :", placeId);
  const userId = req.user.id;
  console.log("🚀 ~ router.post ~ userId:", userId)

  // Vérifie que tous les champs nécessaires sont présents
  if (!comment || !placeId) {
    return res.status(400).json({ result: false, error: "Missing fields" });
  }

  try {
    // Création d'un nouveau commentaire avec les données fournies
    const newComment = new Comment({ picture, comment, placeId, userId });

    // Sauvegarde du commentaire dans la base de données
    const savedComment = await newComment.save();

    // Mise à jour du lieu correspondant pour y associer ce commentaire
    const updatedPlace = await Place.updateOne(
      { _id: placeId },
      { $push: { comments: savedComment._id } }
    );

    // Si le lieu a bien été mis à jour (il existe et a été modifié)
    if (updatedPlace.modifiedCount === 1) {
      // ✅ Tout s’est bien passé : on retourne le commentaire enregistré
      res.json({ result: true, comment: savedComment, picture });
    } else {
      res.status(404).json({ result: false, error: "Place not found" });
    }
  } catch (err) {
    res.status(500).json({ result: false, error: err.message });
  }
});

// GET /comments/:placeId : récupérer tous les commentaires liés à un lieu donné
router.get("/:placeId", authenticateToken, async (req, res) => {
  try {
    // Recherche de tous les commentaires ayant le placeId spécifié
    const place = await Comment.find({ placeId: req.params.placeId }).populate('userId');

    // Retour des commentaires trouvés
    res.json({ result: true, comments: place });
  } catch (err) {
    res.json({ result: false, error: err.message });
  }
});

// DELETE /comments/:id : supprimer un commentaire spécifique
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Suppression du commentaire par son ID
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.json({ result: false, error: "Comment not found" });

    // Suppression de la référence du commentaire dans tous les lieux qui l'utilisent
    await Place.updateMany(
      { comments: req.params.id },
      { $pull: { comments: req.params.id } }
    );

    res.json({ result: true, message: "Comment deleted" });
  } catch (err) {
    res.json({ result: false, error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const authenticateToken = require("../modules/auth");

require('../models/connection');
const Comment = require('../models/comments');
const Place = require('../models/places');

// POST /comments : ajouter un commentaire
router.post('/', authenticateToken, async (req, res) => {
    const { picture, comment, placeId } = req.body;
    // Vérifie que tous les champs nécessaires sont présents
    if (!picture || !comment || !placeId) {
        return res.status(400).json({ result: false, error: 'Missing fields' });
    }
    
    try {
        const newComment = new Comment({ picture, comment, placeId });
        const savedComment = await newComment.save();

        const updatedPlace = await Place.updateOne(
            { _id: placeId },
            { $push: { comments: savedComment._id } }
        );

        if (updatedPlace.modifiedCount === 1) {
            // ✅ Tout s’est bien passé : on retourne le commentaire enregistré
            res.json({ result: true, comment: savedComment, picture });
        } else {
            res.status(404).json({ result: false, error: 'Place not found' });
        }
    } catch (err) {
        res.status(500).json({ result: false, error: err.message });
    }
});

router.get('/:placeId', authenticateToken, async (req, res) => {
    try {
        const place = await Comment.find({ placeId: req.params.placeId });

        console.log("🚀 ~ router.get ~ place:", place)

        res.json({ result: true, comments: place });
    } catch (err) {
        res.json({ result: false, error: err.message });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await Comment.findByIdAndDelete(req.params.id);
        if (!deleted) return res.json({ result: false, error: 'Comment not found' });

        // Supprime la référence du commentaire dans le lieu
        await Place.updateMany(
            { comments: req.params.id },
            { $pull: { comments: req.params.id } }
        );

        res.json({ result: true, message: 'Comment deleted' });
    } catch (err) {
        res.json({ result: false, error: err.message });
    }
});

module.exports = router;

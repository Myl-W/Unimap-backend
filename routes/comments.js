const express = require('express');
const router = express.Router();

require('../models/connection');
const Comment = require('../models/comments');
const Place = require('../models/places');

// POST /comments : ajouter un commentaire
router.post('/', async (req, res) => {
    const alreadyExists = await Comment.findOne({ picture: req.body.picture, comment: req.body.comment });
    if (alreadyExists) {
        return res.json({ result: false, error: 'Duplicate comment' });
    }
    const { placeId, picture, comment } = req.body;

    if (!placeId || !picture || !comment) {
        return res.json({ result: false, error: 'Missing fields' });
    }

    try {
        // 1. Crée un nouveau document Comment avec les données reçues (picture et comment)
        const newComment = new Comment({ picture, comment });
        // 2. Enregistre ce commentaire dans la base MongoDB
        const savedComment = await newComment.save();
        // 3. Met à jour le document Place correspondant en y ajoutant l'ID du commentaire
        const updatedPlace = await Place.updateOne(
            { _id: placeId },// Critère : on cherche le lieu correspondant à l'ID fourni
            { $push: { comments: savedComment._id } }// Action : on ajoute l'ObjectId du commentaire dans le tableau comments
        );
        // 4. Vérifie si la mise à jour a bien modifié un document
        if (updatedPlace.modifiedCount === 1) {
            // ✅ Tout s’est bien passé : on retourne le commentaire enregistré
            res.json({ result: true, comment: savedComment, picture });
        } else {
            // ❌ Le lieu n’a pas été trouvé : on retourne une erreur
            res.json({ result: false, error: 'Place not found' });
        }
    } catch (err) {
        res.json({ result: false, error: err.message });
    }
});

router.get('/place/:placeId/comments', async (req, res) => {
    try {
        const place = await Place.findById(req.params.placeId).populate('comments');

        if (!place) {
            return res.json({ result: false, error: 'Place not found' });
        }

        res.json({ result: true, comments: place.comments });
    } catch (err) {
        res.json({ result: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
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

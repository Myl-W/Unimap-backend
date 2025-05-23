const express = require('express');
const router = express.Router();

require('../models/connection');
const Comment = require('../models/comments');
const Place = require('../models/places');

// POST /comments : ajouter un commentaire
router.post('/', async (req, res) => {
    const { picture, comment, placeId } = req.body;

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
            res.status(201).json({ result: true, comment: savedComment });
        } else {
            res.status(404).json({ result: false, error: 'Place not found' });
        }
    } catch (err) {
        res.status(500).json({ result: false, error: err.message });
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

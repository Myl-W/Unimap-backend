const express = require('express');
const router = express.Router();

require('../models/connection');
const Comment = require('../models/comments');
const { checkBody } = require('../modules/checkBody');

// POST /comments : ajouter un commentaire
router.post('/', (req, res) => {
    // Vérifie que les deux champs sont bien là
    if (!checkBody(req.body, ['picture', 'comment'])) {
        return res.json({ result: false, error: 'Missing or empty fields' });
    }

    // Crée un nouveau commentaire
    const newComment = new Comment({
        picture: req.body.picture,
        comment: req.body.comment,
    });

    // Sauvegarde dans la base
    newComment.save().then(() => {
        res.json({ result: true, message: 'Comment added' });
    });
});

router.get('/:picture', (req, res) => {
    Comment.find({ picture: req.params.picture })
        .then(data => res.json({ result: true, comments: data }))
        .catch(err => res.json({ result: false, error: err.message }));
});

router.delete('/:id', (req, res) => {
    Comment.deleteOne({ _id: req.params.id })
        .then(deleted => {
            if (deleted.deletedCount === 1) {
                res.json({ result: true, message: 'Comment deleted' });
            } else {
                res.json({ result: false, error: 'Comment not found' });
            }
        })
        .catch(err => res.json({ result: false, error: err.message }));
});


module.exports = router;

// Create web server
const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const { check, validationResult } = require('express-validator');

// Get all comments
router.get('/', async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one comment
router.get('/:id', getComment, (req, res) => {
    res.json(res.comment);
});

// Create one comment
router.post('/', [
    check('comment').isLength({ min: 1 }).withMessage('Comment must not be empty'),
    check('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }
    const comment = new Comment({
        comment: req.body.comment,
        rating: req.body.rating
    });
    try {
        const newComment = await comment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update one comment
router.patch('/:id', getComment, async (req, res) => {
    if (req.body.comment != null) {
        res.comment.comment = req.body.comment;
    }
    if (req.body.rating != null) {
        res.comment.rating = req.body.rating;
    }
    try {
        const updatedComment = await res.comment.save();
        res.json(updatedComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete one comment
router.delete('/:id', getComment, async (req, res) => {
    try {
        await res.comment.remove();
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

async function getComment(req, res, next) {
    let comment;
    try {
        comment = await Comment.findById(req.params.id);
        if (comment == null) {
            return res.status(404).json({ message: 'Comment not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
}
    res.comment = comment;
    next();
}
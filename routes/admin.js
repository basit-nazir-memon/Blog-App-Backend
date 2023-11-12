const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User'); 
const BlogPost = require('../models/BlogPost');

router.get('/users', auth, admin, async (req, res) => {
    try {
        let users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/block/:id', auth, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.blocked = true;
        await user.save();
        res.json({ msg: 'User blocked successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/posts', auth, admin, async (req, res) => {
    try {
        const posts = await BlogPost.find();
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/posts/:postId', auth, admin, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/disable/:postId', auth, admin, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.postId);
        if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
        }
        post.disabled = true;
        await post.save();
        res.json({ msg: 'Post disabled successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

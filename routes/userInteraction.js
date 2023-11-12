const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Follow = require('../models/Follow');
const User = require('../models/User');
const BlogPost = require('../models/BlogPost');

router.get('/followers', auth, async (req, res) => {
    try {
        const followers = await Follow.find({ following: req.user.id }).populate('follower', 'username');
        res.json(followers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/following', auth, async (req, res) => {
    try {
        const following = await Follow.find({ follower: req.user.id }).populate('following', 'username');
        res.json(following);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/follow/:id', auth, async (req, res) => {
    const userIdToFollow = req.params.id;

    try {
        const userToFollow = await User.findById(userIdToFollow);

        if (!userToFollow) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (userToFollow.id === req.user.id) {
            return res.status(400).json({ msg: 'Cannot follow yourself' });
        }

        const existingFollow = await Follow.findOne({ follower: req.user.id, following: userIdToFollow });

        if (existingFollow) {
        return res.status(400).json({ msg: 'Already following this user' });
        }

        const newFollow = new Follow({ follower: req.user.id, following: userIdToFollow });
        await newFollow.save();

        res.json({ msg: 'User followed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/unfollow/:id', auth, async (req, res) => {
    const userIdToUnfollow = req.params.id;

    try {
        const userToUnfollow = await User.findById(userIdToUnfollow);

        if (!userToUnfollow) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (userToUnfollow.id === req.user.id) {
            return res.status(400).json({ msg: 'Cannot unfollow yourself' });
        }

        const existingFollow = await Follow.findOne({ follower: req.user.id, following: userIdToUnfollow });

        if (!existingFollow) {
            return res.status(400).json({ msg: 'Not following this user' });
        }

        await existingFollow.deleteOne();

        res.json({ msg: 'User unfollowed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/feed', auth, async (req, res) => {
    try {
        const following = await Follow.find({ follower: req.user.id }).select('following');
        const followingIds = following.map(f => f.following);
        
        const feed = await BlogPost.find({ author: { $in: followingIds } })
        .sort({ created_at: 'desc' })
        .populate('author', 'username');
        
        res.json(feed);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

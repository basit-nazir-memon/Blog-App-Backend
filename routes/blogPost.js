const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BlogPost = require('../models/BlogPost'); 

router.post('/', auth, async (req, res) => {
    const { title, content } = req.body;
    try {
        const newPost = new BlogPost({
            title,
            content,
            author: req.user.id,
        });
        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, filterByAverageRating, filterByAuthor, filterByDate } = req.query;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortBy ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 } : null,
    };

    try {
        let query = {}; 
        if (filterByAverageRating) {
            query.averageRating = filterByAverageRating;
        }
        if (filterByAuthor) {
            query.author = filterByAuthor;
        }
        if (filterByDate) {
            // Assuming filterByDate is a range like "2023-01-01,2023-12-31"
            const [startDate, endDate] = filterByDate.split(',');
            query.created_at = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const posts = await BlogPost.paginate(query, options);
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/:id', auth, async (req, res) => {
    const { title, content } = req.body;

    try {
        let post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied. Not the post author' });
        }

        post.title = title || post.title;
        post.content = content || post.content;

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied. Not the post author' });
        }
        await post.deleteOne();
        res.json({ msg: 'Post deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/:id/rate', auth, async (req, res) => {
    const { rating } = req.body;

    try {
        let post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const userRating = post.ratings.find((r) => r.user.toString() === req.user.id);
        if (userRating) {
            userRating.value = rating;
        } else {
            post.ratings.push({ user: req.user.id, value: rating });
        }
    
        const totalRatings = post.ratings.reduce((sum, r) => sum + r.value, 0);
        post.averageRating = totalRatings / post.ratings.length;

        await post.save();

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/:id/comment', auth, async (req, res) => {
    const { text } = req.body;

    try {
        let post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        post.comments.push({
            user: req.user.id,
            text,
        });
        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

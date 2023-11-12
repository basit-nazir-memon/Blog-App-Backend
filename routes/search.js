const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

router.get('/', async (req, res) => {
    const { keywords, averageRating, authors, sortBy, sortOrder } = req.query;
    try {
        let query = {};

        if (keywords) {
            // Case-insensitive search for keywords in title and content
            query.$or = [
                { title: { $regex: keywords, $options: 'i' } },
                { content: { $regex: keywords, $options: 'i' } },
            ];
        }

        if (averageRating) {
            query.averageRating = { $in: averageRating.split(',') };
        }

        if (authors) {
            query.author = { $in: authors.split(',') };
        }

        const options = {
            sort: sortBy ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 } : null,
        };

        const searchResults = await BlogPost.find(query, null, options);

        res.json(searchResults);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

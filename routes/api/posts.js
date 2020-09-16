const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auths = require('../../middleware/auths');

const Post = require('../../models/Post');
const Users = require('../../models/Users');
const Profile = require('../../models/Profile');

//@route    POST api/posts
//@dess     Create a post
//@aceess   Private
router.post(
    '/',
    [auths, [check('text', 'Text is required.').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = await Users.findById(req.user.id).select('-password');
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            });

            const post = await newPost.save();
            res.json(post);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error');
        }
    }
);

//@route    GET api/posts
//@dess     Get all post
//@aceess   Private

router.get('/', auths, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

//@route    GET api/posts/:id
//@dess     Get post by ID
//@aceess   Private

router.get('/:id', auths, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found.' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found.' });
        }
        return res.status(500).send('Server Error');
    }
});

//@route    DELETE api/posts/:id
//@dess     Delete post by ID
//@aceess   Private

router.delete('/:id', auths, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found.' });
        }
        if (post.user.toString() != req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        await post.remove();
        res.json({ msg: 'Post removed.' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found.' });
        }
        return res.status(500).send('Server Error');
    }
});

//@route    PUT api/posts/like/:id
//@dess     Like a post
//@aceess   Private

router.put('/like/:id', auths, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (
            post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
        ) {
            return res.status(400).json({ msg: 'Post already liked' });
        }
        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

//@route    PUT api/posts/unlike/:id
//@dess     Unlike a post
//@aceess   Private

router.put('/unlike/:id', auths, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (
            post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
        ) {
            return res.status(400).json({ msg: 'Post has not yet been liked' });
        }
        const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

//@route    POST api/posts/comment/:id
//@dess     Add a comment
//@aceess   Private
router.post(
    '/comment/:id',
    [auths, [check('text', 'Text is required.').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = await Users.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            };

            post.comments.unshift(newComment);
            await post.save();
            res.json(post.comments);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error');
        }
    }
);

//@route    POST api/posts/comment/:id/:comment_id
//@dess     Delete a comment
//@aceess   Private
router.delete('/comment/:id/:comment_id', auths, async (req, res) => {
    try {
        //const user = await Users.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        const comment = await post.comments.find(
            comment => comment.id === req.params.comment_id
        );
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }

        if (comment.user.toString() != req.user.id) {
            return res.status(401).json({ msg: 'User not authorized.' });
        }
        const removeIndex = post.comments
            .map(comment => comment.user.toString())
            .indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

module.exports = router;

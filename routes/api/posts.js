const express = require('express');
const router = express.Router();

//@route    GET api/posts
//@dess     Test route
//@aceess   Public
router.get('/', (req, res) => res.send(`Post route`));

module.exports = router;

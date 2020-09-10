const express = require('express');
const router = express.Router();

//@route    GET api/profile
//@dess     Test route
//@aceess   Public
router.get('/', (req, res) => res.send(`Profile route`));

module.exports = router;

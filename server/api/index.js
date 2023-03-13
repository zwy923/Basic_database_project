var express = require('express');
var router = express.Router();
const mongoose = require("mongoose")

router.get('/', function(req, res, next) {
    res.send('There are some useful api.');
});
module.exports = router;
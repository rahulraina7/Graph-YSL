var express = require('express');
var router = express.Router();
var yodleeconfig = require('../keyConfig/yodleeConfig');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var needle = require('needle');
var http = require('http');
var fs = require('fs');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('landing', {
        title: 'Express'
    });
});
router.get('/index', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});
module.exports = router;
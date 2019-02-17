var express = require('express');

var verification = require('./messenger/verification')
var message = require('./messenger/messages')

var router = express.Router();

router.get('/', function(req,res){
    res.render("index")
})

router.get('/messenger', verification)

router.post('/messenger', message)

router.get('/privacy_policy', function(req,res){
    res.send("Privacy Policy")
})

router.use(function(req,res){
    res.status(404);
    res.send("Page Not Found!");
});

module.exports = router;

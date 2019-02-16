var express = require('express');

var router = express.Router();

router.get('/', function(req,res){
    res.render("index")
})

router.use(function(req,res){
    res.status(404);
    res.send("Page Not Found!");
});

module.exports = router;
var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require("./routes");

var app = express()

app.set("port", process.env.PORT || 8080);
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));

app.use(bodyParser.urlencoded({extended:false}));

var staticPath = path.join(__dirname, "public");
app.use(express.static(staticPath));

app.use(routes);

app.listen(app.get("port"), function(){
    console.log("Server started at port: " + app.get("port"))
});

var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require("./routes");

var app = express()

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';


app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));

// app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())

var staticPath = path.join(__dirname, "public");
app.use(express.static(staticPath));

app.use(routes);

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

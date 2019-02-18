var express = require('express');
var request = require('request');

var verification = require('./messenger/verification')
var message = require('./messenger/messages')

var router = express.Router();

var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;
var mongoURLLabel = "";


Object.assign=require('object-assign')

if (mongoURL == null) {
    var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
    // If using plane old env vars via service discovery
    if (process.env.DATABASE_SERVICE_NAME) {
        var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
        mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
        mongoUser = process.env[mongoServiceName + '_USER'];

    // If using env vars from secret from service binding  
    } else if (process.env.database_name) {
        mongoDatabase = process.env.database_name;
        mongoPassword = process.env.password;
        mongoUser = process.env.username;
        var mongoUriParts = process.env.uri && process.env.uri.split("//");
        if (mongoUriParts.length == 2) {
        mongoUriParts = mongoUriParts[1].split(":");
        if (mongoUriParts && mongoUriParts.length == 2) {
            mongoHost = mongoUriParts[0];
            mongoPort = mongoUriParts[1];
        }
        }
    }

    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
        mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
    }
}

var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

initDb(function(err){
    console.log('Error connecting to Mongo. Message:\n'+err);
});

router.get('/', function(req,res){
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
        initDb(function(err){});
    }
    if (db) {
        var col = db.collection('counts');
        // Create a document with request IP and current time of request
        col.insert({ip: req.ip, date: Date.now()});
        col.count(function(err, count){
        if (err) {
            console.log('Error running count. Message:\n'+err);
        }
        res.render('index', { pageCountMessage : count, dbInfo: dbDetails });
        });
    } else {
        res.render('index', { pageCountMessage : null});
    }
})

router.get('/pagecount', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
      initDb(function(err){});
    }
    if (db) {
      db.collection('counts').count(function(err, count ){
        res.send('{ pageCount: ' + count + '}');
      });
    } else {
      res.send('{ pageCount: -1 }');
    }
});

router.get('/webhook', function(req,res){
  var col = db.collection('messages')
  col.insert({date:Date.now(), message: "messenger GET end point triggered."})
  verification(req,res)
})

router.post('/webhook', function(req,res){
  var col = db.collection('messages')
  // Parse the request body from the POST
  let body = req.body;

  // check the webhook event is from a page subscription
  if(body.entry){
    col.insert({date:Date.now(), message: "PAGE"})
    body.entry.forEach(function(entry){
      // gets the body of the webhook event
      let webhook_event = entry.messaging[0]
      console.log(webhook_event)
      // get the sender PSID
      let sender_psid = webhook_event.sender.id
      console.log("sender id: " + sender_psid)

      // check if the event is a message or postback and pass the event to the appropriate handler function
      if(webhook_event.message){
        processMessage(sender_psid, webhook_event.message)
      }
      else if(webhook_event.postback){
        processPostback(sender_psid, webhook_event.postback)
      }
    })
    // return a '200 OK' response to all events
    res.sendStatus(200)
  }
  else{
    col.insert({date:Date.now(), message: JSON.stringify(body.entry)})
    // return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(200)
  }
})

var processMessage = (senderId, message) => {
  let text = message.text
  sendTextMessage(senderId, text)
}

var processPostback = (senderId, postback) => {}

var FACEBOOK_ACCESS_TOKEN = "EAAFKFFt5q2QBAL3qu8YYFpJhLpXE1sjEd0vq7PHJRvZAUAJlowYNO1fNenOozLaNxbtfLeeh9DWqnEy5W5bC6LRLZAUMgPduYfaNWpnDk2oA5lSlkp0MLT6LZAX9TYLD8eIw6eDdK1jO1s62BKHSTEBUxYAkZB6f1wCRzQCqvAZDZD"

var sendTextMessage = (recipientId, text)=>{
  request({
      url:'https://graph.facebook.com/v2.6/me/messages',
      qs:{'access_token': FACEBOOK_ACCESS_TOKEN },
      method: 'POST',
      json:{
          // "messaging_type": "MESSAGE_TAG",
          recipient: { id:recipientId },
          message: { text: text }
      }
  })
}

router.get('/messages', function(req,res){
  var col = db.collection('messages')
  // var result = col.find()
  if(db){
    var result = "null"
    col.find({}).toArray(function(err, messages){
      if(err) result = "err"
      // else result = messages
      else if(messages) result = messages
      db.collection('messages').count(function(err, count){
        if(result) res.json({count: count, result: result})
        else res.json({count:count, result: result})
      })
    })
  }
  else res.send({messages: "error"})
  // res.render('messages')
})

router.get('/privacy_policy', function(req,res){
  res.render('privacy_policy')
})

router.use(function(req,res){
    res.status(404);
    res.send("Page Not Found!");
});

module.exports = router;

var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , Twit = require('twit')
  , io = require('socket.io').listen(server);

//the following 3 things are required for DynamoDB interaction
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'ap-southeast-2'});;
// Create the DynamoDB service object
ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

var watchList = ['the', 'i', 'a', 'to', 'and', 'is', 'in', 'it', 'you', 'of', 'for', 'on', 'my'];
var T = new Twit({
   consumer_key:         'EdzJjKYk4FKHiy8HPnMpmCbQH'
 , consumer_secret:      'qp4TB7Tqem9NViFwHJ51vpmAWwasc2sI2Ji4Ci12Kcq7mzXqGQ'
 , access_token:         '835238610672574464-a8z7KkpXYMNyfAHpARE8oEKEGrR7sPT'
 , access_token_secret:  'H7A9Dwaef2kkRFE7pk1ayE0LI1wTVPesSTbVWutFwaU62'
});

  //defines what content to stream
    var stream = T.stream('statuses/filter', {track: watchList})

  stream.on('tweet', function (tweet) {
    //io.sockets.emit('stream',tweet.text);
    console.log(tweet.text);
    var params = {
      TableName: 'CloudPersistence',
      Item: {
        'Content' : {S: tweet.text},
      }
    };

    // Call DynamoDB to add incoming tweets to the table
    ddb.putItem(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        //console.log("Item sent to db");
      }
    });
  });

var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , Twit = require('twit')
  , io = require('socket.io').listen(server);

//tokenizer
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();

//sentiment analysis
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");

//the following 3 things are required for DynamoDB interaction
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'ap-southeast-2'});;
// Create the DynamoDB service object
ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

//server to listen on
server.listen(8080);

//which directory to use
app.use(express.static(__dirname + '/routes'));

//routing
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//search term
var T = new Twit({
   consumer_key:         'EdzJjKYk4FKHiy8HPnMpmCbQH'
 , consumer_secret:      'qp4TB7Tqem9NViFwHJ51vpmAWwasc2sI2Ji4Ci12Kcq7mzXqGQ'
 , access_token:         '835238610672574464-a8z7KkpXYMNyfAHpARE8oEKEGrR7sPT'
 , access_token_secret:  'H7A9Dwaef2kkRFE7pk1ayE0LI1wTVPesSTbVWutFwaU62'
});

let watchList;

//turn socket on
io.sockets.on('connection', function (socket) {
  console.log('Connected');
  //defines what content to stream
  let promise1 = new Promise(function(resolve, reject){
    socket.on('search', function(searchTerm){
      //Get the search value from HTML and store it into the variable.
      watchList = searchTerm;
      //Pass the watchList variable to the .then promise
      resolve(watchList);
    }); //end socket
  });

  //Use the resolve variable for twitter streaming from db.
  promise1.then(function(value){
    var stream = T.stream('statuses/filter', { track: value });
    stream.on('tweet', function (tweet) {
      io.sockets.emit('stream',tweet.text);

      var params = {
        TableName: 'CloudPersistence',
        Item: {
          'Content' : {S: tweet.text},
        }
      };

      //console.log(tokenizer.tokenize(tweet.text));
      var tokenizeTweet = tokenizer.tokenize(tweet.text);
      //getSentiment expects an array of strings
      console.log(analyzer.getSentiment(tokenizeTweet));

      // Call DynamoDB to add incoming tweets to the table
      ddb.putItem(params, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          //console.log("Item sent to db");
        }
      });
    }); //End stream
  });


 });
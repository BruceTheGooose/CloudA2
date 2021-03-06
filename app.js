//required packages
var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , Twit = require('twit')
  , io = require('socket.io').listen(server);

//requirements for tokenizer
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
//requirements for sentiment analysis
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");

//the following 3 lines of code are required for DynamoDB interaction
//load the AWS SDK for Node.js
var AWS = require('aws-sdk');
//set the region
AWS.config.update({region: 'ap-southeast-2'});;
//create the DynamoDB service object
ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
//listen on port 3000
server.listen(3000);
//which directory to use
app.use(express.static(__dirname + '/routes'));
//middleware use for styling
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
//display index.html when user loads application
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/*', function (req, res) {
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
let tweetCounter = 0;
let sentimentVal;
let testArray = [];

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
    //Get tweets
    var stream = T.stream('statuses/filter', { track: value });
    //For each tweet
    stream.on('tweet', function (tweet) {
      tweetCounter++;
      //splits tweet up into individual words to be analysed by getSentiment
      var tokenizedTweet = tokenizer.tokenize(tweet.text);
      testArray += tweet.text;
      var splitArray = testArray.split(" ");
      var wordCounts = { };
      var words = testArray.split(/\b/);
      // var top10words = [];
      for(var i = 0; i < words.length; i++) {
        words[i].toLowerCase();
        wordCounts[words[i]] = (wordCounts[words[i]] || 0) + 1;
      }
      //getSentiment determines sentiment value of tweet
      sentimentVal = analyzer.getSentiment(tokenizedTweet);
      //Send tweetCounter to HTML
      io.sockets.emit('stream', {tweet: tweet.text, counter: tweetCounter,
        sentiment: sentimentVal, search: watchList, tokenize: tokenizedTweet});
    }); //End stream
  });
 });
 
module.exports = app;

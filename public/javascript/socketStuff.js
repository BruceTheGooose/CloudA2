//connect to the socket
let socket = io.connect('http://localhost:3000');
let dataset = [];
let tokenizedTweets = [];
let userSearch;
let averageSentimentValArray = [];
let mostPosTweet = 0, mostNegTweet = 0;
let sum = 0;
var mostPosComment = [], mostNegComment = [];
socket.on('stream', function(tweet){
  //values being passed from the server
  let tweetMessage = tweet.tweet;
  let tweetCounter = tweet.counter;
  tokenizedTweets.push(tweet.tokenize);
  userSearch = tweet.search;
  let sentimentVal = parseFloat(Math.round(tweet.sentiment * 100) / 100);
  let sentimentValNum = parseFloat(Math.round(tweet.sentiment * 100) / 100);
  averageSentimentValArray.push(sentimentValNum);
  //Get average
  sum = averageSentimentValArray.reduce((a, b) => a+b, 0);
  let averageSentimentVal = sum / averageSentimentValArray.length;

  if (sentimentVal > parseFloat(Math.round(mostPosTweet * 100) / 100)) {
    $("#positive-list").empty();
    mostPosTweet = sentimentVal;
    mostPosComment.unshift(sentimentVal + "\n" + tweetMessage);
    if (mostPosComment.length > 5) {
      mostPosComment.pop();
    }
    var positiveList = document.getElementById('positive-list');
    for(var i = 0; i < mostPosComment.length; i++) {
        // Create the list item:
        var item = document.createElement('li');
        // Set its contents:
        item.appendChild(document.createTextNode(mostPosComment[i]));

        // Add it to the list:
        positiveList.appendChild(item);
    }
  }
  if (sentimentVal < parseFloat(Math.round(mostNegTweet * 100) / 100)) {
    $("#negative-list").empty();
    mostNegTweet = sentimentVal;
    mostNegComment.unshift(sentimentVal + "\n" + tweetMessage);
    if (mostNegComment.length > 5) {
      mostNegComment.pop();
    }
    var negativeList = document.getElementById('negative-list');
    for(var i = 0; i < mostNegComment.length; i++) {
        // Create the list item:
        var item = document.createElement('li');
        // Set its contents:
        item.appendChild(document.createTextNode(mostNegComment[i]));
        // Add it to the list:
        negativeList.appendChild(item);
    }
  }

  //jQuery commands to update HTML elements
  $('#tweetd').prepend(tweetMessage+'<br>' + "sentiment: " + sentimentVal + "<br><br>");
  //$('#TweetsLbl').text("Tweets (Number of Tweets: " + tweetCounter + ")");
  $('#TweetsLbl').text("Tweets (stream active for '" + userSearch + "')");
  $('#graphLbl').text("Average sentiment for '" + userSearch + "': " + averageSentimentVal.toFixed(10));
  //empty the graph's div
  $("#line-chart").empty();
  //push each incoming tweet to the dataset
  dataset.push([tweetCounter, sentimentVal]);
  //removes values at the beginning of the values
  //can change this if we want more values displaying in the graph
  if (dataset.length > 50) {
    dataset.shift();
  }
  constructLineGraph(dataset);
  $('#most-common-word').text("Most common word is " + mostFreqStr(tokenizedTweets));
});

function mostFreqStr(arr) {
  var obj = {}, mostFreq = 0, which = [];

  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i].length; j++) {
      if (!obj[arr[i][j]]) {
        obj[arr[i][j]] = 1;
      } else {
        obj[arr[i][j]]++;
      }

      if (obj[arr[i][j]] > mostFreq & arr[i][j] != "RT") {
        mostFreq = obj[arr[i][j]];
        which = [arr[i][j]];
      } else if (obj[arr[i][j]] === mostFreq) {
        var whichPush = arr[i][j];
        which.push(whichPush);
      }
    };
  };

  if (which.length > 1) {
    which = `"${which.join(`" and "`)}" have a frequency of: ` + mostFreq + "."
  } else {
    which = `"${which}" and it has occurred ` + mostFreq + " times."
  }

  return which;
}

//send search term to the server
function sendSearchValue() {
    //socket.disconnect();
  let searchValue = $('#searchBar').val();
  socket.emit('search', searchValue);

}

function constructLineGraph() {
  //width, height and margin of the graph
  var svgWidth = 1100, svgHeight = 500;
  var margin = { top: 20, right: 50, bottom: 30, left: 50 };
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;
  //select svg element in html form
  var svg = d3.select('svg')
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //x-axis scaling
  var x = d3.scaleLinear()
    .rangeRound([0, width+500]);
  //y-axis scaling
  var y = d3.scaleLinear()
    .rangeRound([height-140, 0]);
  //draws the line in the graph
  var line = d3.line()
    .x(function(d) {return x(d[0])})
    .y(function(d) {return y(d[1])})
    x.domain(d3.extent(dataset, function(d) {return d[0]}));
    y.domain([-1, 1]);

  let xAxisPos = height-140;
  g.append("g")
    .attr("transform", "translate(0," + xAxisPos + ")")
    .call(d3.axisBottom(x))
    .select(".domain")
    .remove();

  g.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill","#000")
    .attr("transform","rotate(-90)")
    .attr("y",6)
    .attr("dy","0.71em")
    .attr("text-anchor","end");

  g.append("path")
    .datum(dataset)
    .attr("fill","none")
    .attr("stroke","steelblue")
    .attr("stroke-linejoin","round")
    .attr("stroke-linecap","round")
    .attr("stroke-width",1.5)
    .attr("d",line);
}

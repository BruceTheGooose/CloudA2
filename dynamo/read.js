// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'ap-southeast-2'});

// Create the DynamoDB service object
ddb = new AWS.DynamoDB();

var params = {
  TableName: 'CloudPersistence',
  ProjectionExpression: 'Content'
  /*Key: {
    'TweetID' : {N: '1'},
  },
  ProjectionExpression: 'Content'*/
};

// Call DynamoDB to read ALL items from the table specified in params
ddb.scan(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    //log every element that is in the table
    data.Items.forEach(function(element, index, array) {
      console.log(element.Content.S);
    })
  }
});

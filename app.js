var http = require('http');
var express = require("express");
var sessions = require('client-sessions');
var views = require('./renderer');
var queryString = require('querystring');
var AWS = require('aws-sdk');
var FullContact = require('fullcontact');
var bcrypt = require('bcryptjs');
var ejs = require('ejs');
var keys = require('./api_keys');

var app = express();

//middleware
app.use(sessions({
  cookieName: 'authSession', // cookie name dictates the key name added to the request object
  secret: 'laksdfjlaskjf;lakdjsf;laskjf49430020293i3djvnfjkksmxnv', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));

app.use(express.static(__dirname + '/styles'));
app.set("view engine", "ejs");

function requireAuth(request, response, next) {
  if(request.authSession && request.authSession.username) {
    next();
  } else {
    response.redirect("/login");
  }
}

app.get("/", function(request, response){
  views.renderer(response, "header");
  views.renderer(response, "signup_form");
  views.renderer(response, "footer");
  response.end();
});

app.post("/", function(request, response){
  request.on('data', function(postBody){
    var query = queryString.parse(postBody.toString());
    username = query["user[username]"];
    password = query["user[password]"];

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    
    var putParams = {
      TableName: table,
      Item: {
        username: username,
        password_digest: hash,
      },
      ConditionExpression: '#i <> :S',
      ExpressionAttributeNames: {'#i' : 'username'},
      ExpressionAttributeValues: {':S' : username }
    };

    docClient.put(putParams, function(err, data) {
      if (err) {
        if(err.message === "The conditional request failed") {
          // user already exists in db
          views.renderer(response, "header");
          views.renderer(response, "signup_form");
          views.renderer(response, "footer");
          response.write("User Already Exists!");
        } else {
          console.error(err);
        }
        response.end();
      } else {
        // User is saved to the database
        console.log(data);
        request.authSession = {username: username, password_digest: hash};
        response.redirect("/lookup");
        response.end();
      }
    });
  });
});

app.get("/login", function(request, response) {
  views.renderer(response, "header");
  views.renderer(response, "login_form");
  views.renderer(response, "footer");
  response.end();
});

app.post("/login", function(request, response){
  request.on("data", function(postBody){
    var query = queryString.parse(postBody.toString());
    var username = query["user[username]"];
    var password = query["user[password]"];

    var params = {
      TableName: table,
      Key: {username: username},
    };

    docClient.get(params, function(err, data) {
      if(err){
        response.redirect("/login");
        response.end();
        // console.log(err, err.stack); // an error occurred
      } else {
        // success
        if(data.Item && data.Item.username === username && bcrypt.compareSync(password, data.Item.password_digest)){
          request.authSession = data.Item;
          response.redirect("/lookup");
          response.end();
        } else {
          // credentials were not correct
          response.redirect("/login");
          response.end();
        }
      }
      
    });
  });
});

app.get("/lookup", requireAuth, function(request, response){
  views.renderer(response, "header");
  views.renderer(response, "email_lookup_form");
  views.renderer(response, "footer");
  response.end();
});

app.post("/lookup", function(request, response){
  request.on("data", function(postBody){
    var query = queryString.parse(postBody.toString());
    var email = query["lookup[email]"];
    //check to see if email is in the database
    var params = {
      TableName: cache,
      Key: {email: email},
    };

    docClient.get(params, function(err, data) {
      if(err){
        console.log(err); // an error occurred
        response.end();
      } else {
        // success
        if(data.Item && data.Item.lookup_data && data.Item.email === email){
          console.log("Using the cache!");
          response.render("lookup_results", { data: data.Item.lookup_data, email: email });
          response.end();
        } else {
            // no data came back, get data, use that data in templatevar 
            fullcontact = new FullContact(keys.fullContactApiKey);
            fullcontact.person.email(email, function (err, fcData) {
              if(err) {
                response.redirect("/lookup");
              } else {
              var putParams = {
                TableName: cache,
                Item: {
                  email: email,
                  lookup_data: fcData,
                },
              };
              // cache the response
              docClient.put(putParams, function(err, data) {
                if (err) {
                  console.log(err);
                  response.end();
                } else {
                console.log("caching");
                response.render("lookup_results", { data: fcData, email: email });
                response.end();
                }
              });
            }
          });
        }
      }
    });
  });
});

app.post("/logout", function(request, response){
  request.authSession.reset();
  response.redirect("/login");
  response.end();
});

var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;

AWS.config.update({
  region: "us-west-2",
});

var table = "auth_users";
var cache = "full_contact";
var docClient = new AWS.DynamoDB.DocumentClient();

app.listen(3000);
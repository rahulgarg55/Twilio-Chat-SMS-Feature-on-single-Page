require('dotenv').config();

// Node/Express
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');

const router = require('./src/router');
const syncServiceDetails = require('./src/sync_service_details');

// Create Express webapp
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Add body parser for Notify device registration
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(router);

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.trace(err);
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {},
  });
});

// Get Sync Service Details for lazy creation of default service if needed
syncServiceDetails();

// Create http server and run it
const server = http.createServer(app);
const port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log('Express server running on *:' + port);
});

module.exports = app;

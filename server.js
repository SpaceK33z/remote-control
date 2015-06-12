#!/usr/bin/env node
'use strict';
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var exec = require('child_process').exec;

var tokens = require('./api/tokens');
var commands = require('./api/commands');

var staticFolder = path.join(__dirname, 'static');
var tokenFile = path.join(__dirname, 'tokens.json');

// Some basic authentication for unwanted users.
var auth = function(req, res, next) {
  function unauthorized(res) {
    return res.sendStatus(401);
  }

  var currentToken = req.cookies.token;

  if (currentToken && tokens.isAuthorized(currentToken)) {
    return next();
  } else {
    return unauthorized(res);
  }
};

// Load config.
require('dotenv').load({
  path: path.join(__dirname, '.env'),
});

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(cookieParser());

app.get('/', auth, function(req, res) {
  console.log(req.cookies);
  return res.sendFile(path.join(staticFolder, 'index.html'));
});

app.get('/command', auth, function(req, res) {
  return res.json(commands.parse());
});

app.post('/command', auth, function(req, res) {
  console.log('POST to /command.');

  var command = commands.get(req.body.name);

  if (!command) {
    return res.status(404).send('Command not found!');
  }

  var execOptions = {
    cwd: command.dir,
  };

  exec(command.exec, execOptions, function(error, stdout, stderr) {
    if (error !== null || stderr.length) {
      return res.status(400).json({
        code: 'error',
        output: error || stderr,
      });
    }

    return res.json({
      code: 'success',
      output: stdout || null,
    });
  });
});

app.post('/auth', auth, function(req, res) {
  console.log('POST to /auth.');

  if (req.body.token) {
    tokens.insert(req.body.token);

    return res.sendStatus(204);
  }
});

app.use(express.static(__dirname, 'static'));

app.listen(process.env.REMOTE_PORT);

console.log('Starting app at port ' + process.env.REMOTE_PORT);

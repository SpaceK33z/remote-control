#!/usr/bin/env node
'use strict';
var express = require('express');
var basicAuth = require('basic-auth');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var exec = require('child_process').exec;
var _ = require('lodash');

var staticFolder = path.join(__dirname, 'static');
var commandFile = path.join(__dirname, 'commands.json');

// Some basic authentication for unwanted users.
var auth = function(req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  }

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }

  if (
    user.name === process.env.REMOTE_USER &&
    user.pass === process.env.REMOTE_PASS
  ) {
    return next();
  } else {
    return unauthorized(res);
  }
};

// Load config.
require('dotenv').load();

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// Read and parse commands.json to JS objects.
var parseCommands = function() {
  var file = fs.readFileSync(commandFile, 'utf8');

  if (!file) {
    console.log('Error parsing commands.json');
  }

  return JSON.parse(file);
};

// Get a command from commands.json.
var getCommand = function(name) {
  var commands = parseCommands();

  return _.first(_.where(commands, { name: name }));
};

app.get('/', auth, function(req, res) {
  return res.sendFile(path.join(staticFolder, 'index.html'));
});

app.get('/command', auth, function(req, res) {
  var commands = parseCommands();

  return res.json(commands);
});

app.post('/command', auth, function(req, res) {
  console.log('POST to /command.');

  var command = getCommand(req.body.name);

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

app.use(express.static(__dirname, 'static'));

app.listen(process.env.REMOTE_PORT);

console.log('Starting app at port ' + process.env.REMOTE_PORT);

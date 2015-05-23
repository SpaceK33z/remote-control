#!/usr/bin/env node
'use strict';
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var exec = require('child_process').exec;
var _ = require('lodash');

var staticFolder = path.join(__dirname, 'static');
var commandFile = path.join(__dirname, 'commands.json');

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

app.get('/', function(req, res) {
  return res.sendFile(path.join(staticFolder, 'index.html'));
});

app.get('/command', function(req, res) {
  var commands = parseCommands();

  return res.json(commands);
});

app.post('/command', function(req, res) {
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

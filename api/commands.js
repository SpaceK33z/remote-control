var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var commandFile = path.join(__dirname, '../commands.json');

// Read and parse commands.json to JS objects.
exports.parse = function() {
  var file = fs.readFileSync(commandFile, 'utf8');

  if (!file) {
    console.log('Error parsing commands.json');
  }

  return JSON.parse(file);
};

exports.get =  function(name) {
  var commands = this.parse();

  return _.first(_.where(commands, { name: name }));
};

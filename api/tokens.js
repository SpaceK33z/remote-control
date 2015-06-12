var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var tokenFile = path.join(__dirname, '../tokens.json');

function createFile() {
  var contents = '[]';
  fs.writeFile(tokenFile, contents, function(err) {
    if (err) {
      console.log(err);
    }
  });
}

exports.parse = function() {
  try {
    var file = fs.readFileSync(tokenFile, 'utf8');

    return JSON.parse(file);
  } catch (e) {
    console.log('tokens.json not found, creating the file...');
    createFile();

    return [];
  }
};

exports.get = function(token) {
  var tokens = this.parse();

  return _.first(_.where(tokens, { token: token }));
};

exports.insert = function(token) {
  var tokens = this.parse();

  // Token already exists, so don't create a new one.
  if (this.get(token)) {
    return false;
  }

  tokens.push({
    token: token,
    authorize: false,
  });

  fs.writeFile(tokenFile, JSON.stringify(tokens, null, 2), function(err) {
    if (err) {
      console.log(err);
    }
  });
};

exports.isAuthorized = function(token) {
  var obj = this.get(token);

  if (obj) {
    return obj.authorize;
  }

  return false;
};

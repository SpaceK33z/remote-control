var JHR = function(type, url, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.responseJSON = null;

  xhr.open(type, url);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.addEventListener('load', function() {
    xhr.responseJSON = JSON.parse(xhr.responseText);

    callback(xhr.responseJSON, xhr);
  });

  xhr.send(JSON.stringify(data));

  return xhr;
};

(function() {
  var urlRoot = '/';

  var onCommandClick = function(e) {
    var data = {
      name: e.target.innerText,
    };

    if (e.target.dataset.confirm) {
      if (!confirm('Are you sure you want to do this?')) {
        return;
      }
    }

    JHR('POST', urlRoot + 'command', data, function(payload) {
      console.log('Done', payload);
    });
  };

  var loadCommands = function() {
    var commandsDiv = document.querySelector('._commands');

    JHR('GET', urlRoot + 'command', null, function(payload, xhr) {
      payload.forEach(function(item) {
        var nodeItem = document.createElement('div');
        nodeItem.className = 'command-item';

        var nodeLink = document.createElement('a');
        nodeLink.href = '#';
        nodeLink.innerText = item.name;
        nodeLink.className = '_exec';

        if (item.confirm) {
          nodeLink.dataset.confirm = true;
        }

        nodeItem.appendChild(nodeLink);
        commandsDiv.appendChild(nodeItem);
      });

      var links = document.querySelectorAll('._exec');

      console.log(links);

      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', onCommandClick, false);
      }
    });
  };

  loadCommands();
})();

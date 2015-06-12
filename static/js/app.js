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
      // TODO: Display some feedback.
      console.log('Done', payload);
    });
  };

  var loadCommands = function() {
    var commandsDiv = document.querySelector('._commands');

    JHR('GET', urlRoot + 'command', null, function(payload, xhr) {
      payload.forEach(function(item) {
        var nodeItem = document.createElement('a');
        nodeItem.href = '#';
        nodeItem.innerText = item.name;
        nodeItem.className = 'command-item _exec';

        if (item.confirm) {
          nodeItem.dataset.confirm = true;
        }

        commandsDiv.appendChild(nodeItem);
      });

      var links = document.querySelectorAll('._exec');

      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', onCommandClick, false);
      }
    });
  };

  // If no token cookie has been set, a token
  // must be generated and set to the back-end.
  var cookieToken = Cookies.get('token');
  if (!cookieToken) {
    // Generate a unique code to use as token.
    var uuid = generateUUID();

    var data = {
      token: uuid,
    };

    JHR('POST', urlRoot + 'auth', data, function(payload, xhr) {
      console.log('Done', payload, xhr);

      if (xhr.status === 204) {
        // TODO: Show that a request for access is sent.
        Cookies.set('token', uuid);
      }
    });

  } else {
    loadCommands();
  }

})();

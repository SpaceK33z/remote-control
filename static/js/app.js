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

  var hideErrors = function() {
    var errorsDiv = document.querySelector('._errors');

    errorsDiv.innerText = '';
  };

  var showError = function(text) {
    var nodeError = document.createElement('p');
    var errorsDiv = document.querySelector('._errors');

    nodeError.innerText = text;

    errorsDiv.appendChild(nodeError);
    return nodeError;
  };

  var loadCommands = function() {
    var commandsDiv = document.querySelector('._commands');

    JHR('GET', urlRoot + 'command', null, function(payload, xhr) {
      hideErrors();

      if (xhr.status === 401) {
        return showError('You are not authorized for this.');
      };

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
        showError('A token has been generated and sent to the server. After this token is authorized, refresh this page.');
        Cookies.set('token', uuid);
      }
    });

  } else {
    loadCommands();
  }

})();

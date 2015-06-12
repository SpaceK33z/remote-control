/*!
 * JavaScript Cookie v2.0.0-pre
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory(window.jQuery);
		api.noConflict = function () {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = encodeURIComponent(String(value));
				value = value.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure  && '; secure'
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var name = parts[0].replace(rdecode, decodeURIComponent);
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				cookie = converter && converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

				if (this.json) {
					try {
						cookie = JSON.parse(cookie);
					} catch (e) {}
				}

				if (key === name) {
					result = cookie;
					break;
				}

				if (!key) {
					result[name] = cookie;
				}
			}

			return result;
		}

		api.get = api.set = api;
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init();
}));

var JHR = function(type, url, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.responseJSON = null;

  xhr.open(type, url);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.addEventListener('load', function() {
    try {
      xhr.responseJSON = JSON.parse(xhr.responseText);
    } catch (e) {
      xhr.responseJSON = false;
    }

    callback(xhr.responseJSON, xhr);
  });

  xhr.send(JSON.stringify(data));

  return xhr;
};

var generateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

  return uuid;
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

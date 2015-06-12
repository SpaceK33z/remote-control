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

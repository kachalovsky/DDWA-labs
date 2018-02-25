;(function () {

  var methods = {
    GET: "GET",
    PUT: "PUT",
    POST: "POST",
    DELETE: "DELETE"
  };

  function apiHelper(config) {
    this.url = config.url || config.URL;
    var self = this;

    function request(method, config, callback) {
      var xhr = new XMLHttpRequest();

      var url = self.url;
      if (config.uriModifier) {
        url = config.uriModifier(url);
      }
      xhr.open(method, url, true);

      xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
      xhr.send((config.body ? JSON.stringify(config.body) : null));

      xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return;

        if (this.status !== 200) {
          return callback (new Error(xhr.responseText))
        }

        return callback(null, JSON.parse(xhr.responseText))
      }
    }

    this[methods.GET] = function (config, callback) {
      request(methods.GET, config, callback)
    };

    this[methods.POST] = function (body, config, callback) {
      config.body = body;
      request(methods.POST, config, callback)
    };

    this[methods.PUT] = function (body, config, callback) {
      config.body = body;
      request(methods.PUT, config, callback)
    };

    this[methods.DELETE] = function (body, config, callback) {
      config.body = body;
      request(methods.DELETE, config, callback)
    }
  }

  apiHelper.methods = methods;

  window.APIHelper = apiHelper;
})();
const methods = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE'
};

export default class ApiHelper {
    constructor(config) {
      this.url = config.url || config.URL;

      this[methods.GET] = (config) => {
        return this.request(methods.GET, config)
      };

      this[methods.POST] = (body, config) => {
        config.body = body;
        return this.request(methods.POST, config)
      };

      this[methods.PUT] = (body, config) => {
        config.body = body;
        return this.request(methods.PUT, config)
      };

      this[methods.DELETE] = (body, config) => {
        config.body = body;
        return this.request(methods.DELETE, config)
      }
    }


    request(method, config) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        let url = this.url;
        if (config.uriModifier) {
          url = config.uriModifier(url);
        }
        xhr.open(method, url, true);

        xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
        xhr.send((config.body ? JSON.stringify(config.body) : null));
        xhr.onreadystatechange = () => {
          if (xhr.readyState !== 4) return;

          if (xhr.status !== 200) {
            return reject (new Error(xhr.responseText))
          }
          return resolve(JSON.parse(xhr.responseText))
        }
      })
    }
  }


  // apiHelper.methods = methods;
  //
  // window.APIHelper = apiHelper;
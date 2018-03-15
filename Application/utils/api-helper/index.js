const methods = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE'
};

export default class ApiHelper {
    constructor(config = {}) {
      this.url = config.url || config.URL || 'http://192.168.0.108:3000/';

      this[methods.GET] = async (config) => {
        return await this.request(methods.GET, config)
      };

      this[methods.POST] = async (body, config) => {
        config.body = body;
        return await this.request(methods.POST, config)
      };

      this[methods.PUT] = async (body, config) => {
        config.body = body;
        return await this.request(methods.PUT, config)
      };

      this[methods.DELETE] = async (body, config) => {
        config.body = body;
        return await this.request(methods.DELETE, config)
      }
    }


    request(method = methods.GET, config = {}) {
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
  window.APIHelper = ApiHelper;
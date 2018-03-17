const UPDATE_PERIOD = 60000; //milliseconds
const URL = 'http://192.168.207.1:3000/';
let responseHandler;

console.log('WORKER')

function lastUpdate() {
  return new Promise((resolve, reject) => {
    responseHandler = (timestamp => {
      return resolve(timestamp && Number(timestamp));
    });
    postMessage('needTimestamp');
  })
}

function updateTimestamp() {
  postMessage('updateTimestamp');
}

self.addEventListener('message', function(e) {
  responseHandler && responseHandler(Number(e.data));
}, false);

function timedCount() {
  lastUpdate()
  .then(lastUpdateTimestamp => {
    let shouldUpdate = true;
    if (lastUpdateTimestamp) shouldUpdate = (Date.now() - lastUpdateTimestamp) >= UPDATE_PERIOD;
    if (!shouldUpdate) return setTimeout(() => timedCount(),(lastUpdateTimestamp + UPDATE_PERIOD - Date.now()));
    return request("GET", {url: URL})
    .then((products) => {
      products = products || [];
      postMessage(products.length);
      updateTimestamp();
      setTimeout(() => timedCount(), UPDATE_PERIOD);
    });
  });
}

function request(method = "GET", config = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    let url = this.url || config.url;
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


timedCount();


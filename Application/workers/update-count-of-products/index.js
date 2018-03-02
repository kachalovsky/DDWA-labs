;(function() {
  const TIMESTAMP_LS_KEY = 'last_update_count_of_event';
  const COUNT_LS_KEY = 'cached_count_of_event';

  const worker = new Worker("Application/workers/update-count-of-products/worker.js");

  updateLabel(localStorage.getItem(COUNT_LS_KEY));

  worker.addEventListener('message', function (e) {
    console.log('Worker said: ', e.data);

    if (e.data === 'needTimestamp') {
      worker.postMessage(localStorage.getItem(TIMESTAMP_LS_KEY))
    } else if (e.data === 'updateTimestamp') {
      console.log('UPDATING TIMESTAMP');
      localStorage.setItem(TIMESTAMP_LS_KEY, Date.now())
    } else if (!isNaN(Number(e.data))) {
      let count = e.data;
      localStorage.setItem(COUNT_LS_KEY, count);
      updateLabel(count)
    }
  }, false);

  function updateLabel(value) {
    let container = document.getElementById('count-of-products');
    value && (container.innerHTML = `Всего продуктов: ${value}`);
  }

  //worker.addEventListener('error', (d) => console.log(d));
})();
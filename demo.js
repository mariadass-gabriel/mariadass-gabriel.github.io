(function () {
  var API_URL = 'https://price-api-5fhpnacpvq-ew.a.run.app/predict';
  var WAKE_HINT_MS = 2500;   // show the cold-start message after this delay
  var TIMEOUT_MS = 45000;

  var PRESETS = {
    gpu: { name: 'Asus Radeon RX 580 Dual OC 8GB GDDR5', category: 'Tarjetas graficas', brand: 'Asus', shop: 'pccomponentes', score: 8.6, reviews: 23 },
    ram: { name: 'G.Skill Ripjaws V Red DDR4 3000 PC4-24000 8GB 2x4GB CL15', category: 'Memoria RAM', brand: 'G.Skill', shop: 'pccomponentes', score: 9.4, reviews: 53 },
    ssd: { name: 'Gigabyte SSD M.2 512GB 2280 PCIe x2 NVMe', category: 'Discos Duros', brand: 'Gigabyte', shop: 'pccomponentes', score: 9.5, reviews: 40 }
  };

  var form = document.getElementById('demo-form');
  var submit = document.getElementById('submit');
  var statusBox = document.getElementById('status');
  var resultBox = document.getElementById('result');
  var money = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

  function euros(value) { return money.format(value) + ' €'; }

  function showStatus(text, isError) {
    statusBox.textContent = text;
    statusBox.className = 'demo-status' + (isError ? ' is-error' : '');
    statusBox.hidden = false;
  }
  function hideStatus() { statusBox.hidden = true; }

  function fill(preset) {
    form.elements.name.value = preset.name;
    form.elements.category.value = preset.category;
    form.elements.brand.value = preset.brand;
    form.elements.shop.value = preset.shop;
    form.elements.score.value = preset.score;
    form.elements.reviews.value = preset.reviews;
    resultBox.hidden = true;
    hideStatus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-preset]'), function (btn) {
    btn.addEventListener('click', function () { fill(PRESETS[btn.getAttribute('data-preset')]); });
  });

  function readForm() {
    var f = form.elements;
    var name = f.name.value.trim();
    var brand = f.brand.value.trim();
    var score = parseFloat(f.score.value);
    var reviews = parseInt(f.reviews.value, 10);
    if (!name) return { error: 'Please enter the product name.' };
    if (!brand) return { error: 'Please enter the brand.' };
    if (isNaN(score) || score < 0 || score > 10) return { error: 'The customer rating must be between 0 and 10.' };
    if (isNaN(reviews) || reviews < 0) return { error: 'The number of reviews must be 0 or more.' };
    return {
      payload: { company_name: f.shop.value, brand_name: brand, category: f.category.value, name: name, score: score, reviews: reviews }
    };
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var input = readForm();
    if (input.error) { resultBox.hidden = true; showStatus(input.error, true); return; }

    submit.disabled = true;
    submit.textContent = 'Estimating…';
    resultBox.hidden = true;
    showStatus('Estimating the price…', false);
    var wakeTimer = setTimeout(function () {
      showStatus('Waking up the server, ~10 s. The demo runs on free hosting that sleeps when idle.', false);
    }, WAKE_HINT_MS);

    var controller = new AbortController();
    var abortTimer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input.payload),
      signal: controller.signal
    })
      .then(function (response) {
        if (response.status === 422) throw new Error('invalid');
        if (!response.ok) throw new Error('server');
        return response.json();
      })
      .then(function (data) {
        document.getElementById('r-price').textContent = euros(data.price);
        document.getElementById('r-range').textContent = euros(data.low) + ' - ' + euros(data.high);
        hideStatus();
        resultBox.hidden = false;
      })
      .catch(function (err) {
        var message;
        if (err.message === 'invalid') message = 'The server did not accept these values. Please check the fields and try again.';
        else if (err.message === 'server') message = 'The server had a problem. Please try again in a moment.';
        else message = 'Could not reach the server. It may be starting up or unavailable. Please try again in a moment.';
        showStatus(message, true);
      })
      .then(function () {
        clearTimeout(wakeTimer);
        clearTimeout(abortTimer);
        submit.disabled = false;
        submit.textContent = 'Estimate price';
      });
  });
})();

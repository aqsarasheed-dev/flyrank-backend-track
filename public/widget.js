(function () {
  const script = document.currentScript;
  const widgetId = script.getAttribute('data-widget-id');
  const apiBase = script.getAttribute('data-api-base') || window.location.origin;

  if (!widgetId) {
    console.error('[Widget] Missing data-widget-id attribute on script tag.');
    return;
  }

  fetch(`${apiBase}/api/widgets/${widgetId}/config`)
    .then((res) => res.json())
    .then((config) => {
      if (config.error) {
        console.error('[Widget] Failed to load config:', config.error);
        return;
      }
      renderWidget(config, apiBase);
    })
    .catch((err) => console.error('[Widget] Network error:', err));

  function renderWidget(config, apiBase) {
    const container = document.createElement('div');
    container.style.cssText =
      'position:fixed;bottom:20px;right:20px;background:#22335C;color:#fff;padding:16px 20px;border-radius:8px;font-family:sans-serif;max-width:280px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:9999;';

    const headline = document.createElement('div');
    headline.textContent = config.copy.headline || 'Sign up';
    headline.style.cssText = 'font-weight:600;margin-bottom:10px;';
    container.appendChild(headline);

    const form = document.createElement('form');
    (config.fields || []).forEach((fieldName) => {
      const input = document.createElement('input');
      input.name = fieldName;
      input.placeholder = fieldName;
      input.style.cssText = 'display:block;width:100%;margin-bottom:8px;padding:6px;border-radius:4px;border:none;';
      form.appendChild(input);
    });

    const button = document.createElement('button');
    button.textContent = 'Submit';
    button.type = 'submit';
    button.style.cssText = 'background:#B8892B;color:#fff;border:none;padding:8px 14px;border-radius:4px;cursor:pointer;';
    form.appendChild(button);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => (data[key] = value));

      fetch(`${apiBase}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetId: config.id, data }),
      })
        .then((res) => res.json())
        .then((result) => {
          container.innerHTML = '<div>Thanks — you\'re on the list!</div>';
        })
        .catch(() => {
          container.innerHTML = '<div>Something went wrong. Please try again.</div>';
        });
    });

    container.appendChild(form);
    document.body.appendChild(container);
  }
})();
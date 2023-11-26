/* eslint-disable no-console */
if (!navigator.webdriver) {
  const socket = new WebSocket(
    `${(location.protocol === 'http:' ? 'ws://' : 'wss://') + location.host}/`,
  );

  socket.addEventListener('message', (message) => {
    if (!message.data) return;

    const data = JSON.parse(message.data);

    let reload = true;

    // Hot reload stylesheets
    document.querySelectorAll('link[rel=stylesheet]').forEach((el) => {
      if (el.getAttribute('href') === data.url) {
        el.setAttribute('href', data.url);
        reload = false;
      }
    });

    // Hot reload images
    document.querySelectorAll('img').forEach((el) => {
      if (el.getAttribute('src') === data.url) {
        el.setAttribute('src', data.url);
        reload = false;
      }
    });

    // Otherwise, reload page
    if (reload) location.reload();
  });

  socket.addEventListener('close', () => {
    console.warn('Development server disconnected');
  });
}

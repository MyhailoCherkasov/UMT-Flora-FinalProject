const subscribeForm = document.querySelector('[data-subscribe-form]');
const subscribeMessage = document.querySelector('[data-subscribe-message]');

subscribeForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(subscribeForm).entries());

  try {
    await window.floraApi.client.post('/api/subscriptions', payload);
    subscribeMessage.textContent = 'Subscription sent to backend.';
    subscribeForm.reset();
  } catch (error) {
    subscribeMessage.textContent = 'Unable to send subscription. Check that the API server is running.';
  }

  setTimeout(() => {
    subscribeMessage.textContent = '';
  }, 1800);
});

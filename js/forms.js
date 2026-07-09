const subscribeForm = document.querySelector('[data-subscribe-form]');
const subscribeMessage = document.querySelector('[data-subscribe-message]');

const saveLocalSubscription = payload => {
  const subscribers = JSON.parse(localStorage.getItem('flora-subscribers') || '[]');
  subscribers.push({ ...payload, createdAt: new Date().toISOString() });
  localStorage.setItem('flora-subscribers', JSON.stringify(subscribers));
};

subscribeForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(subscribeForm).entries());

  try {
    await window.floraApi.client.post('/api/subscriptions', payload);
    subscribeMessage.textContent = 'Subscription sent to backend.';
  } catch (error) {
    saveLocalSubscription(payload);
    subscribeMessage.textContent = 'Backend unavailable. Subscription saved locally.';
  }

  subscribeForm.reset();

  setTimeout(() => {
    subscribeMessage.textContent = '';
  }, 1800);
});

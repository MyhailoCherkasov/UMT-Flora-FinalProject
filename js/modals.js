const productBackdrop = document.querySelector('[data-product-backdrop]');
const orderBackdrop = document.querySelector('[data-order-backdrop]');
const productContent = document.querySelector('[data-product-content]');
const productClose = document.querySelector('[data-product-close]');
const orderClose = document.querySelector('[data-order-close]');
const orderProductId = document.querySelector('[data-order-product-id]');
const orderForm = document.querySelector('[data-order-form]');
const orderMessage = document.querySelector('[data-order-message]');

const toggleModalLock = () => {
  const openedModal = document.querySelector('.modal-backdrop.is-open');
  document.body.classList.toggle('modal-lock', Boolean(openedModal));
};

const openBackdrop = backdrop => {
  backdrop?.classList.add('is-open');
  backdrop?.setAttribute('aria-hidden', 'false');
  toggleModalLock();
};

const closeBackdrop = backdrop => {
  backdrop?.classList.remove('is-open');
  backdrop?.setAttribute('aria-hidden', 'true');
  toggleModalLock();
};

const closeAllModals = () => {
  closeBackdrop(productBackdrop);
  closeBackdrop(orderBackdrop);
};

const escapeText = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderProductModal = item => {
  if (!productContent) return;

  const modalImage = window.floraCatalog?.renderImage(item) || '';

  productContent.replaceChildren();
  productContent.insertAdjacentHTML('beforeend', `
    ${modalImage.replace('catalog-card__image', 'product-modal__image')}
    <div class="product-modal__info">
      <h2 class="product-modal__title" id="product-modal-title">${escapeText(item.name)}</h2>
      <p class="product-modal__price">$${item.price}</p>
      <p class="product-modal__text body-text">${escapeText(item.description)} Whether you’re celebrating a birthday, sending love, or simply brightening someone’s day, this arrangement is sure to bring warm smiles and lasting impressions.</p>
      <div class="product-modal__actions">
        <button class="lime-button" type="button" data-buy-product="${item.id}">Buy now</button>
        <span class="product-modal__quantity">1</span>
      </div>
    </div>`);
};

const saveLocalOrder = payload => {
  const orders = JSON.parse(localStorage.getItem('flora-orders') || '[]');
  orders.push({ ...payload, createdAt: new Date().toISOString() });
  localStorage.setItem('flora-orders', JSON.stringify(orders));
};

document.addEventListener('click', event => {
  const productButton = event.target.closest('[data-product-open]');
  if (productButton) {
    const product = window.floraCatalog?.findProduct(productButton.dataset.productOpen);
    if (!product) return;
    renderProductModal(product);
    openBackdrop(productBackdrop);
    return;
  }

  const buyButton = event.target.closest('[data-buy-product]');
  if (buyButton) {
    if (orderProductId) orderProductId.value = buyButton.dataset.buyProduct;
    closeBackdrop(productBackdrop);
    openBackdrop(orderBackdrop);
  }
});

productClose?.addEventListener('click', () => closeBackdrop(productBackdrop));
orderClose?.addEventListener('click', () => closeBackdrop(orderBackdrop));

productBackdrop?.addEventListener('click', event => {
  if (event.target === productBackdrop) closeBackdrop(productBackdrop);
});

orderBackdrop?.addEventListener('click', event => {
  if (event.target === orderBackdrop) closeBackdrop(orderBackdrop);
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeAllModals();
});

orderForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(orderForm).entries());

  try {
    await window.floraApi.client.post('/api/orders', payload);
    orderMessage.textContent = 'Order request sent to backend.';
  } catch (error) {
    saveLocalOrder(payload);
    orderMessage.textContent = 'Backend unavailable. Order saved locally.';
  }

  orderForm.reset();

  setTimeout(() => {
    orderMessage.textContent = '';
    closeBackdrop(orderBackdrop);
  }, 1800);
});

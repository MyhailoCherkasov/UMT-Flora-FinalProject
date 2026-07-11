const productBackdrop = document.querySelector('[data-product-backdrop]');
const orderBackdrop = document.querySelector('[data-order-backdrop]');
const productContent = document.querySelector('[data-product-content]');
const productClose = document.querySelector('[data-product-close]');
const orderClose = document.querySelector('[data-order-close]');
const orderProductId = document.querySelector('[data-order-product-id]');
const orderQuantity = document.querySelector('[data-order-quantity]');
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

const escapeModalText = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderProductModal = item => {
  if (!productContent) return;

  const modalImage = window.floraCatalog?.renderImage(item, 'product-modal__image', 520, 520) || '';

  productContent.replaceChildren();
  productContent.insertAdjacentHTML('beforeend', `
    ${modalImage}
    <div class="product-modal__info">
      <h2 class="product-modal__title" id="product-modal-title">${escapeModalText(item.name)}</h2>
      <p class="product-modal__price">$${item.price}</p>
      <p class="product-modal__text body-text">${escapeModalText(item.description)} Whether you’re celebrating a birthday, sending love, or simply brightening someone’s day, this arrangement is sure to bring warm smiles and lasting impressions.</p>
      <div class="product-modal__actions">
        <button class="lime-button" type="button" data-buy-product="${item.id}">Buy now</button>
        <label class="visually-hidden" for="product-quantity">Quantity</label>
        <input class="product-modal__quantity" id="product-quantity" type="number" min="1" max="99" value="1" inputmode="numeric" data-product-quantity>
      </div>
    </div>`);
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
    const quantityInput = productContent?.querySelector('[data-product-quantity]');
    const quantity = Math.max(Number(quantityInput?.value) || 1, 1);
    if (orderProductId) orderProductId.value = buyButton.dataset.buyProduct;
    if (orderQuantity) orderQuantity.value = String(quantity);
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
  payload.productId = Number(payload.productId);
  payload.quantity = Math.max(Number(payload.quantity) || 1, 1);

  try {
    await window.floraApi.client.post('/api/orders', payload);
    orderMessage.textContent = 'Order request sent to backend.';
  } catch (error) {
    orderMessage.textContent = 'Unable to send order. Check that the API server is running.';
    return;
  }

  orderForm.reset();
  if (orderQuantity) orderQuantity.value = '1';

  setTimeout(() => {
    orderMessage.textContent = '';
    closeBackdrop(orderBackdrop);
  }, 1800);
});

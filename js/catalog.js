const topList = document.querySelector('[data-top-list]');
const topStatus = document.querySelector('[data-top-status]');
const feedbackList = document.querySelector('[data-feedback-list]');
const feedbackStatus = document.querySelector('[data-feedback-status]');
const catalogList = document.querySelector('[data-catalog-list]');
const catalogForm = document.querySelector('[data-catalog-filters]');
const loadMoreBtn = document.querySelector('[data-load-more]');
const catalogStatus = document.querySelector('[data-catalog-status]');

const productStore = new Map();

const catalogState = {
  products: [],
  page: 1,
  limit: 4,
  total: 0,
  hasMore: false,
  search: '',
  category: 'all',
  priceMax: 'all',
  loading: false
};

const normalizeProduct = product => ({
  id: product.id,
  name: product.title || product.name,
  title: product.title || product.name,
  category: product.category,
  price: Number(product.price),
  description: product.description,
  image: product.image,
  photoUrl: product.photoUrl || product.photoURL || '',
  alt: product.alt || `${product.title || product.name} bouquet`,
  favorite: Boolean(product.favorite)
});

const escapeText = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const productKey = item => [
  String(item.id || '').trim(),
  String(item.name || item.title || '').trim().toLowerCase(),
  String(item.image || item.photoUrl || '').trim().toLowerCase(),
  String(item.price || '').trim()
].join('|');

const collectProducts = items => {
  items.forEach(item => productStore.set(String(item.id), item));
};

const uniqueByProductKey = items => {
  const seen = new Set();
  return items.filter(item => {
    const key = productKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const resolvePhotoUrl = item => {
  if (!item.photoUrl) return '';
  if (item.photoUrl.startsWith('http')) return item.photoUrl;
  if (item.photoUrl.startsWith('/')) return `${window.floraApi.baseUrl}${item.photoUrl}`;
  return item.photoUrl;
};

const buildImage = (item, className = 'catalog-card__image', width = 250, height = 250) => {
  const uploadedPhoto = resolvePhotoUrl(item);
  const altText = escapeText(item.alt || item.name);

  if (uploadedPhoto) {
    return `<img loading="lazy" src="${escapeText(uploadedPhoto)}" alt="${altText}" width="${width}" height="${height}" class="${className}">`;
  }

  return `
    <picture>
      <source type="image/webp" srcset="./images/${escapeText(item.image)}@X1.webp 1x, ./images/${escapeText(item.image)}@X2.webp 2x">
      <img loading="lazy" src="./images/${escapeText(item.image)}@X1.jpg" srcset="./images/${escapeText(item.image)}@X2.jpg 2x" alt="${altText}" width="${width}" height="${height}" class="${className}">
    </picture>`;
};

const buildCatalogCard = item => `
  <li class="catalog-card" data-product-id="${item.id}">
    <button class="catalog-card__button" type="button" data-product-open="${item.id}" aria-label="Open ${escapeText(item.name)} details">
      ${buildImage(item)}
      <h3 class="catalog-card__title">${escapeText(item.name)}</h3>
      <p class="body-text card-note">${escapeText(item.description)}</p>
      <p class="catalog-card__price">$${item.price}</p>
    </button>
  </li>`;

const buildTopCard = item => `
  <li class="top-card" data-product-id="${item.id}">
    <button class="top-card__button" type="button" data-product-open="${item.id}" aria-label="Open ${escapeText(item.name)} details">
      ${buildImage(item, 'top-card__image', 400, 320)}
      <h3 class="top-card__title">${escapeText(item.name)}</h3>
      <p class="body-text card-note">${escapeText(item.description)}</p>
      <p class="card-price">$${item.price}</p>
    </button>
  </li>`;

const buildFeedbackCard = feedback => `
  <li class="review-card">
    <p class="body-text">${escapeText(feedback.text)}</p>
    <p class="review-card__person">${escapeText(feedback.author)}</p>
  </li>`;

const getBouquetItems = data => {
  const rawItems = Array.isArray(data.items) ? data.items : data.bouquets;
  return Array.isArray(rawItems) ? uniqueByProductKey(rawItems.map(normalizeProduct)) : [];
};

const readFilters = () => {
  const formData = new FormData(catalogForm);
  catalogState.search = String(formData.get('search') || '').trim();
  catalogState.category = String(formData.get('category') || 'all');
  catalogState.priceMax = String(formData.get('priceMax') || 'all');
};

const requestParams = () => ({
  page: catalogState.page,
  limit: catalogState.limit,
  search: catalogState.search,
  category: catalogState.category,
  priceMax: catalogState.priceMax
});

const canLoadMoreBouquets = () => {
  if (!catalogState.hasMore) return false;
  if (catalogState.total > 0 && catalogState.products.length >= catalogState.total) return false;
  return true;
};

const syncLoadMoreVisibility = () => {
  if (!loadMoreBtn) return;

  const shouldShow = canLoadMoreBouquets();

  if (!shouldShow) {
    loadMoreBtn.hidden = true;
    loadMoreBtn.disabled = true;
    loadMoreBtn.setAttribute('aria-hidden', 'true');
    loadMoreBtn.classList.add('is-hidden');
    loadMoreBtn.style.display = 'none';
    return;
  }

  loadMoreBtn.hidden = false;
  loadMoreBtn.disabled = Boolean(catalogState.loading);
  loadMoreBtn.removeAttribute('aria-hidden');
  loadMoreBtn.classList.remove('is-hidden');
  loadMoreBtn.style.removeProperty('display');
};

const updateCatalogStatus = () => {
  if (!catalogStatus) return;

  if (!catalogState.products.length) {
    catalogStatus.textContent = 'No bouquets match selected filters.';
    return;
  }

  catalogStatus.textContent = `Shown ${catalogState.products.length} of ${catalogState.total} bouquets from API.`;
};

const requestBouquets = async params => {
  const { data } = await window.floraApi.client.get('/api/bouquets', { params });
  return {
    items: getBouquetItems(data),
    total: Number(data.total ?? 0),
    hasMore: Boolean(data.hasMore)
  };
};

const renderCatalog = ({ append = false, items = catalogState.products } = {}) => {
  if (!catalogList || !loadMoreBtn) return;
  if (!append) catalogList.replaceChildren();

  if (items.length) {
    catalogList.insertAdjacentHTML('beforeend', items.map(buildCatalogCard).join(''));
  }

  syncLoadMoreVisibility();
  updateCatalogStatus();
};

const loadBouquets = async ({ append = false } = {}) => {
  if (!catalogList || !loadMoreBtn || !catalogStatus || catalogState.loading) return;

  try {
    catalogState.loading = true;
    if (!loadMoreBtn.hidden) loadMoreBtn.disabled = true;
    catalogStatus.textContent = 'Loading bouquets...';

    const result = await requestBouquets(requestParams());
    const existingIds = new Set(catalogState.products.map(item => String(item.id)));
    const freshItems = append ? result.items.filter(item => !existingIds.has(String(item.id))) : result.items;

    catalogState.products = append ? [...catalogState.products, ...freshItems] : freshItems;
    catalogState.products = uniqueByProductKey(catalogState.products);
    catalogState.total = Number(result.total) || catalogState.products.length;

    // Ховаємо Load more одразу після останньої сторінки.
    // Перевіряємо і відповідь API, і фактичну кількість унікальних карток у DOM.
    // Це закриває кейс, коли база/seed повертає дублікати або некоректний hasMore.
    const loadedAllKnownItems = catalogState.total > 0 && catalogState.products.length >= catalogState.total;
    const noNewItemsFromPage = append && freshItems.length === 0;
    const shortLastPage = result.items.length < catalogState.limit;

    catalogState.hasMore = Boolean(result.hasMore)
      && !loadedAllKnownItems
      && !noNewItemsFromPage
      && !shortLastPage;

    collectProducts(freshItems);
    renderCatalog({ append, items: append ? freshItems : catalogState.products });
  } catch (error) {
    catalogList.replaceChildren();
    catalogState.hasMore = false;
    syncLoadMoreVisibility();
    catalogStatus.textContent = 'Unable to load bouquets from backend. Check that the API server is running.';
  } finally {
    catalogState.loading = false;
    syncLoadMoreVisibility();
  }
};

const loadTopBouquets = async () => {
  if (!topList) return;

  try {
    if (topStatus) topStatus.textContent = 'Loading top bouquets...';

    let result = await requestBouquets({ page: 1, limit: 12, favorite: true });
    let items = result.items;

    // Защита от уже существующей Render/PostgreSQL базы без favorite=true.
    // Всё равно берём данные с backend, но не оставляем секцию пустой.
    if (!items.length) {
      result = await requestBouquets({ page: 1, limit: 3 });
      items = result.items.slice(0, 3);
    }

    topList.replaceChildren();
    if (!items.length) {
      if (topStatus) topStatus.textContent = 'Top bouquets are empty.';
      window.floraRefreshSliders?.();
      return;
    }

    collectProducts(items);
    topList.insertAdjacentHTML('beforeend', items.map(buildTopCard).join(''));
    if (topStatus) topStatus.textContent = '';
    window.floraRefreshSliders?.();
  } catch (error) {
    topList.replaceChildren();
    if (topStatus) topStatus.textContent = 'Unable to load top bouquets from backend.';
    window.floraRefreshSliders?.();
  }
};

const loadFeedbacks = async () => {
  if (!feedbackList) return;

  try {
    if (feedbackStatus) feedbackStatus.textContent = 'Loading feedback...';
    const { data } = await window.floraApi.client.get('/api/feedbacks');
    const items = Array.isArray(data.items) ? data.items : data.feedbacks;

    feedbackList.replaceChildren();
    if (!Array.isArray(items) || !items.length) {
      if (feedbackStatus) feedbackStatus.textContent = 'No feedback yet.';
      return;
    }

    feedbackList.insertAdjacentHTML('beforeend', items.map(buildFeedbackCard).join(''));
    if (feedbackStatus) feedbackStatus.textContent = '';
    window.floraRefreshSliders?.();
  } catch (error) {
    feedbackList.replaceChildren();
    if (feedbackStatus) feedbackStatus.textContent = 'Unable to load feedback from backend.';
  }
};

const resetCatalog = () => {
  readFilters();
  catalogState.page = 1;
  catalogState.products = [];
  catalogState.total = 0;
  catalogState.hasMore = false;
  syncLoadMoreVisibility();
  loadBouquets({ append: false });
};

catalogForm?.addEventListener('input', resetCatalog);
catalogForm?.addEventListener('change', resetCatalog);

loadMoreBtn?.addEventListener('click', () => {
  if (!canLoadMoreBouquets() || catalogState.loading) {
    syncLoadMoreVisibility();
    return;
  }

  catalogState.page += 1;
  loadBouquets({ append: true });
});

window.floraCatalog = {
  getItems: () => [...productStore.values()],
  findProduct: id => productStore.get(String(id)) || catalogState.products.find(item => String(item.id) === String(id)),
  renderImage: buildImage
};

loadTopBouquets();
loadBouquets();
loadFeedbacks();

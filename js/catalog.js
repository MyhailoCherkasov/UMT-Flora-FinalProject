const catalogList = document.querySelector('[data-catalog-list]');
const catalogForm = document.querySelector('[data-catalog-filters]');
const loadMoreBtn = document.querySelector('[data-load-more]');
const catalogStatus = document.querySelector('[data-catalog-status]');

const catalogState = {
  products: [],
  page: 1,
  limit: 4,
  total: 0,
  hasMore: false,
  search: '',
  category: 'all',
  priceMax: 'all',
  loading: false,
  usingFallback: false
};

const bouquetKey = item => [
  String(item.name || item.title || '').trim().toLowerCase(),
  String(item.image || item.photoUrl || '').trim().toLowerCase(),
  String(item.price || '').trim(),
  String(item.category || '').trim().toLowerCase()
].join('|');

const getUniqueItems = items => {
  const seen = new Set();

  return items.filter(item => {
    const key = bouquetKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

const resolvePhotoUrl = item => {
  if (!item.photoUrl) return '';
  if (item.photoUrl.startsWith('http')) return item.photoUrl;
  if (item.photoUrl.startsWith('/')) return `${window.floraApi?.baseUrl || 'http://localhost:3000'}${item.photoUrl}`;
  return item.photoUrl;
};

const buildImage = item => {
  const uploadedPhoto = resolvePhotoUrl(item);

  if (uploadedPhoto) {
    return `<img loading="lazy" src="${escapeText(uploadedPhoto)}" alt="${escapeText(item.alt)}" width="250" height="250" class="catalog-card__image">`;
  }

  return `
    <picture>
      <source type="image/webp" srcset="./images/${escapeText(item.image)}@X1.webp 1x, ./images/${escapeText(item.image)}@X2.webp 2x">
      <img loading="lazy" src="./images/${escapeText(item.image)}@X1.jpg" srcset="./images/${escapeText(item.image)}@X2.jpg 2x" alt="${escapeText(item.alt)}" width="250" height="250" class="catalog-card__image">
    </picture>`;
};

const buildCard = item => `
  <li class="catalog-card" data-product-id="${item.id}">
    <button class="catalog-card__button" type="button" data-product-open="${item.id}" aria-label="Open ${escapeText(item.name)} details">
      ${buildImage(item)}
      <h3 class="catalog-card__title">${escapeText(item.name)}</h3>
      <p class="body-text card-note">${escapeText(item.description)}</p>
      <p class="catalog-card__price">$${item.price}</p>
    </button>
  </li>`;

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

const filterFallbackItems = items => {
  const searchValue = catalogState.search.toLowerCase();

  const filtered = items.map(normalizeProduct).filter(item => {
    const nameMatches = !searchValue || item.name.toLowerCase().includes(searchValue);
    const categoryMatches = catalogState.category === 'all' || item.category === catalogState.category;
    const priceMatches = catalogState.priceMax === 'all' || item.price <= Number(catalogState.priceMax);
    return nameMatches && categoryMatches && priceMatches;
  });

  return getUniqueItems(filtered);
};

const requestApiBouquets = async () => {
  const { data } = await window.floraApi.client.get('/api/bouquets', { params: requestParams() });
  const items = Array.isArray(data.items) ? data.items : data.bouquets;
  const normalizedItems = Array.isArray(items) ? items.map(normalizeProduct) : [];

  return {
    items: getUniqueItems(normalizedItems),
    total: Number(data.total ?? normalizedItems.length ?? 0),
    hasMore: Boolean(data.hasMore)
  };
};

const requestFallbackBouquets = async () => {
  const { data } = await window.floraApi.fallbackClient.get('./db.json');
  const filtered = filterFallbackItems(Array.isArray(data.bouquets) ? data.bouquets : []);
  const start = (catalogState.page - 1) * catalogState.limit;
  const items = filtered.slice(start, start + catalogState.limit);

  return {
    items,
    total: filtered.length,
    hasMore: start + items.length < filtered.length
  };
};

const updateStatus = () => {
  if (!catalogStatus) return;

  if (!catalogState.products.length) {
    catalogStatus.textContent = 'No bouquets match selected filters.';
    return;
  }

  const source = catalogState.usingFallback ? 'mock data' : 'API';
  catalogStatus.textContent = `Shown ${catalogState.products.length} of ${catalogState.total} bouquets from ${source}.`;
};

const renderCatalog = ({ append = false, items = catalogState.products } = {}) => {
  if (!catalogList || !loadMoreBtn) return;
  if (!append) catalogList.replaceChildren();

  if (items.length) {
    catalogList.insertAdjacentHTML('beforeend', items.map(buildCard).join(''));
  }

  loadMoreBtn.hidden = !catalogState.hasMore;
  updateStatus();
};

const loadBouquets = async ({ append = false } = {}) => {
  if (!catalogList || !loadMoreBtn || !catalogStatus || catalogState.loading) return;

  try {
    catalogState.loading = true;
    loadMoreBtn.disabled = true;
    catalogStatus.textContent = 'Loading bouquets...';

    let result;
    try {
      result = await requestApiBouquets();
      catalogState.usingFallback = false;
    } catch (error) {
      result = await requestFallbackBouquets();
      catalogState.usingFallback = true;
    }

    const existingKeys = new Set(catalogState.products.map(bouquetKey));
    const freshItems = result.items.filter(item => !existingKeys.has(bouquetKey(item)));

    catalogState.products = append ? [...catalogState.products, ...freshItems] : getUniqueItems(result.items);
    catalogState.total = Math.max(catalogState.products.length, Number(result.total) || 0);
    catalogState.hasMore = Boolean(result.hasMore) && freshItems.length > 0;

    renderCatalog({
      append,
      items: append ? freshItems : catalogState.products
    });
  } catch (error) {
    catalogList.replaceChildren();
    loadMoreBtn.hidden = true;
    catalogStatus.textContent = 'Unable to load bouquets. Please try again later.';
  } finally {
    catalogState.loading = false;
    loadMoreBtn.disabled = false;
  }
};

const resetCatalog = () => {
  readFilters();
  catalogState.page = 1;
  catalogState.products = [];
  loadBouquets({ append: false });
};

catalogForm?.addEventListener('input', resetCatalog);
catalogForm?.addEventListener('change', resetCatalog);

loadMoreBtn?.addEventListener('click', () => {
  catalogState.page += 1;
  loadBouquets({ append: true });
});

window.floraCatalog = {
  getItems: () => [...catalogState.products],
  findProduct: id => catalogState.products.find(item => String(item.id) === String(id)),
  renderImage: buildImage
};

loadBouquets();

(() => {
  const defaultApiUrl = 'http://localhost:3000';
  const savedApiUrl = localStorage.getItem('flora-api-url');
  const apiUrl = window.FLORA_API_URL || savedApiUrl || defaultApiUrl;

  window.floraApi = {
    baseUrl: apiUrl,
    client: axios.create({ baseURL: apiUrl, timeout: 8000 }),
    fallbackClient: axios.create({ timeout: 8000 })
  };
})();

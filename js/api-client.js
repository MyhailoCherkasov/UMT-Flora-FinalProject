(() => {
  const localApiUrl = 'http://localhost:3000';
  const productionApiUrl = 'https://umt-flora-finalproject.onrender.com';
  const savedApiUrl = localStorage.getItem('flora-api-url');
  const isLocalPage = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
  const apiUrl = window.FLORA_API_URL || savedApiUrl || (isLocalPage ? localApiUrl : productionApiUrl);

  window.floraApi = {
    baseUrl: apiUrl.replace(/\/$/, ''),
    client: axios.create({ baseURL: apiUrl.replace(/\/$/, ''), timeout: 12000 })
  };
})();

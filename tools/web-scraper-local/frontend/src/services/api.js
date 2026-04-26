import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 dakika (uzun aramalar için)
});

export const searchAPI = {
  // Yeni arama başlat
  startSearch: (data) => api.post('/search', data),

  // Tüm sorguları getir
  getQueries: (skip = 0, limit = 50) =>
    api.get(`/queries?skip=${skip}&limit=${limit}`),

  // Belirli bir sorguyu getir
  getQuery: (queryId) => api.get(`/queries/${queryId}`),

  // Sorgunun firmalarını getir
  getQueryCompanies: (queryId, includeDuplicates = true) =>
    api.get(
      `/queries/${queryId}/companies?include_duplicates=${includeDuplicates}`
    ),

  // Tüm firmaları getir
  getAllCompanies: (params = {}) => api.get('/companies', { params }),

  // Master liste (tekrar ayıklanmış)
  getMasterList: (params = {}) => api.get('/master-list', { params }),

  // Sorgu sil
  deleteQuery: (queryId) => api.delete(`/queries/${queryId}`),

  // Sorguyu iptal et
  cancelQuery: (queryId) => api.post(`/queries/${queryId}/cancel`),

  // Dışa aktarma
  exportQuery: (queryId, format = 'csv', includeDuplicates = false) =>
    api.get(
      `/export/${queryId}?format=${format}&include_duplicates=${includeDuplicates}`,
      { responseType: 'blob' }
    ),

  exportAll: (format = 'csv', includeDuplicates = false) =>
    api.get(
      `/export-all?format=${format}&include_duplicates=${includeDuplicates}`,
      { responseType: 'blob' }
    ),

  // Master liste dışa aktar (tekrar ayıklanmış)
  exportMaster: (format = 'excel') =>
    api.get(`/export-master?format=${format}`, { responseType: 'blob' }),

  // İstatistikler
  getStats: () => api.get('/stats'),
};

export default api;

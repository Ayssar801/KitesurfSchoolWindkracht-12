// Importeer hulpfuncties voor API-communicatie, token- en gebruikersbeheer
const API_BASE = 'http://127.0.0.1:8000/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

// Centrale fetch-functie voor alle API-verzoeken: voegt automatisch het inlogtoken toe
// en logt de gebruiker uit als de server een 401 (Unauthorized) teruggeeft
export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    removeAuthToken();
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Laravel stuurt validatiefouten in data.errors als een object met arrays
    if (data.errors) {
      const allErrors = Object.values(data.errors).flat().join('\n');
      throw new Error(allErrors);
    }
    throw new Error(data.message || data.error || 'Er is iets misgegaan.');
  }

  return data;
};

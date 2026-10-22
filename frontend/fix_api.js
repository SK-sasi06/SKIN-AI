const fs = require('fs');
const apiCode = const API_BASE = '/api';

export const getStoredToken = () => localStorage.getItem('alskincare_token');
export const setStoredToken = (token) => localStorage.setItem('alskincare_token', token);
export const removeStoredToken = () => localStorage.removeItem('alskincare_token');

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('alskincare_user'));
  } catch {
    return null;
  }
};
export const setStoredUser = (user) => localStorage.setItem('alskincare_user', JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem('alskincare_user');

const authHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: 'Bearer ' + token } : {};
};

export async function loginUser(email, password) {
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function registerUser(email, password, fullName) {
  const res = await fetch(API_BASE + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function analyzeSkin(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch(API_BASE + '/analyze', {
    method: 'POST',
    headers: {
      ...authHeaders()
    },
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Analysis failed');
  }
  return res.json();
}

export async function fetchUserHistory() {
  const res = await fetch(API_BASE + '/history', {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to load analysis history');
  return res.json();
}

export async function deleteAnalysisReport(reportId) {
  const res = await fetch(API_BASE + '/history/' + reportId, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete report');
  return res.json();
}

export async function fetchCatalogProducts(category = '') {
  const url = category ? API_BASE + '/products?category=' + encodeURIComponent(category) : API_BASE + '/products';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}
;
fs.writeFileSync('src/services/api.js', apiCode, 'utf8');
console.log('Fixed api.js strings!');

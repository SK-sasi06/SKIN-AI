const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : (localStorage.getItem('alskincare_api_url') 
      ? `${localStorage.getItem('alskincare_api_url').replace(/\/$/, '')}/api`
      : '/api');


export function getAuthToken() {
  return localStorage.getItem('skincare_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('skincare_token', token);
  } else {
    localStorage.removeItem('skincare_token');
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem('skincare_user');
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('skincare_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('skincare_user');
  }
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Invalid email or password.');
  }
  return res.json();
}

export async function registerUser(email, password, fullName = '') {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password, full_name: fullName.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Password reset request failed' }));
    throw new Error(err.detail || 'Failed to dispatch password reset request.');
  }
  return res.json();
}

export async function resetPassword(email, resetCode, newPassword) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      reset_code: resetCode.trim(),
      new_password: newPassword
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Password reset failed' }));
    throw new Error(err.detail || 'Invalid or expired verification code.');
  }
  return res.json();
}

export async function changePassword(email, currentPassword, newPassword) {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      current_password: currentPassword,
      new_password: newPassword
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Change password failed' }));
    throw new Error(err.detail || 'Failed to update password.');
  }
  return res.json();
}

export async function analyzeSkin(imageFile, skinType = null) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('file', imageFile); // Provide both keys for compatibility
  if (skinType) {
    formData.append('skin_type', skinType);
  }

  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Skin analysis failed' }));
    const errorMsg = typeof err.detail === 'string'
      ? err.detail
      : Array.isArray(err.detail)
        ? err.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
        : 'Skin analysis failed';
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.label) params.append('label', filters.label);
  if (filters.category) params.append('category', filters.category);
  if (filters.skin_type) params.append('skin_type', filters.skin_type);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch product catalog');
  }
  return res.json();
}

export async function fetchHistory() {
  const token = getAuthToken();
  if (!token) return [];

  const res = await fetch(`${API_BASE}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch scan history');
  }
  return res.json();
}

export async function fetchHistoryDetail(reportId) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/history/${reportId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch report details');
  }
  return res.json();
}
export async function deleteHistoryReport(reportId) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/history/${reportId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to delete assessment report');
  }
  return res.json();
}

export async function sendChatMessage(message, options = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload = {
    message,
    history: options.history || [],
    current_page: options.currentPage || null,
    latest_analysis: options.latestAnalysis || null,
  };

  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to communicate with AI Skincare Assistant');
  }

  return res.json();
}

export async function fetchProductPrices(productId) {
  const res = await fetch(`${API_BASE}/products/${productId}/prices`);
  if (!res.ok) {
    throw new Error('Failed to fetch store price comparisons');
  }
  return res.json();
}

export async function comparePrices(query) {
  const res = await fetch(`${API_BASE}/prices/compare?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error('Failed to compare prices');
  }
  return res.json();
}

// --- Skin Journey AI APIs ---
export async function fetchJourneyTimeline(limit = 30) {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/timeline?limit=${limit}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch skin journey timeline');
  return res.json();
}

export async function saveDailyRoutine(routineData) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/routines`, {
    method: 'POST',
    headers,
    body: JSON.stringify(routineData),
  });
  if (!res.ok) throw new Error('Failed to save daily routine');
  return res.json();
}

export async function deleteDailyRoutine(routineId) {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/routines/${routineId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete routine');
  return res.json();
}

export async function fetchJourneyStreak() {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/streak`, { headers });
  if (!res.ok) throw new Error('Failed to fetch routine streak');
  return res.json();
}

export async function fetchJourneyProducts() {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/products`, { headers });
  if (!res.ok) throw new Error('Failed to fetch vanity products');
  return res.json();
}

export async function addJourneyProduct(productData) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error('Failed to add product');
  return res.json();
}

export async function deleteJourneyProduct(productId) {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/products/${productId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function fetchSkinReactions() {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/reactions`, { headers });
  if (!res.ok) throw new Error('Failed to fetch skin reaction logs');
  return res.json();
}

export async function logSkinReaction(reactionData) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/reactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(reactionData),
  });
  if (!res.ok) throw new Error('Failed to log skin reaction');
  return res.json();
}

export async function fetchSkinAnalytics() {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/analytics`, { headers });
  if (!res.ok) throw new Error('Failed to fetch skin improvement analytics');
  return res.json();
}

export async function fetchProductEffectiveness(productId = null) {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = productId ? `${API_BASE}/journey/product-effectiveness?product_id=${productId}` : `${API_BASE}/journey/product-effectiveness`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch product effectiveness data');
  return res.json();
}

export async function fetchJourneySummary() {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/summary`, { headers });
  if (!res.ok) throw new Error('Failed to fetch progress summary');
  return res.json();
}

export async function fetchMonthlyReport(year = 2026, month = 10) {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/monthly-report?year=${year}&month=${month}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch monthly report');
  return res.json();
}

export async function searchJourneyTimeline(query) {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/journey/search?q=${encodeURIComponent(query)}`, { headers });
  if (!res.ok) throw new Error('Failed to search timeline');
  return res.json();
}

export async function deleteUploadedPhoto(filename) {
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/images/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete facial photo');
  return res.json();
}

export async function fetchDbOverview() {
  const res = await fetch(`${API_BASE}/admin/db-overview`);
  if (!res.ok) throw new Error('Failed to fetch database overview');
  return res.json();
}

export async function fetchTableData(table = 'users', limit = 50, offset = 0) {
  const res = await fetch(`${API_BASE}/admin/table-data?table=${encodeURIComponent(table)}&limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch table data');
  return res.json();
}

export async function deleteAdminUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete user' }));
    throw new Error(err.detail || 'Failed to delete user');
  }
  return res.json();
}

export async function resetAdminUserPassword(userId, newPassword) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_password: newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to reset password' }));
    throw new Error(err.detail || 'Failed to reset password');
  }
  return res.json();
}



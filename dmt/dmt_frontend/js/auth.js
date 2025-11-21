/**
 * Authentication Module
 * Handles JWT token management and user authentication
 */

// Using nginx reverse proxy (relative path)
const API_BASE_URL = '/api';

/**
 * Login function - authenticates user and stores token
 */
async function login(employee_number, password) {
    try {
        const formData = new URLSearchParams();
        formData.append('username', employee_number); // OAuth2 uses 'username' field
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.detail || 'Authentication failed'
            };
        }

        const data = await response.json();

        // Store token locally
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);

        // Store session in PHP (REQUIRED)
        await fetch("session_login.php", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                access_token: data.access_token,
                username: data.username, // Backend now returns 'username'
                full_name: data.full_name,
                role: data.role
            })
        });;


        return { success: true };


    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Connection error. Please ensure the API is running.'
        };
    }
}

/**
 * Fetch current user information
 * Note: Backend doesn't have a /me endpoint, so we need to decode JWT or get user info another way
 * For now, we'll extract employee_number from token and fetch user
 */
async function fetchCurrentUser() {
    // For simplicity, we'll need to add user info to the token response in the backend
    // or create a /me endpoint. For now, return null and handle in PHP session
    return null;
}

/**
 * Get auth headers for API requests
 */
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';

    if (!token) {
        return {};
    }

    return {
        'Authorization': `${tokenType} ${token}`,
        'Content-Type': 'application/json'
    };
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return localStorage.getItem('access_token') !== null;
}

/**
 * Logout - clear all stored data
 */
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    sessionStorage.removeItem('user');
    window.location.href = 'index.php';
}

/**
 * API Request wrapper with auth
 */
async function apiRequest(url, options = {}) {
    const headers = {
        ...getAuthHeaders(),
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
        logout();
        return null;
    }

    return response;
}

/**
 * GET request with auth
 */
async function apiGet(url) {
    const response = await apiRequest(url, {
        method: 'GET'
    });

    if (!response) return null;

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
    }

    return await response.json();
}

/**
 * POST request with auth
 */
async function apiPost(url, data) {
    const response = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (!response) return null;

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
    }

    return await response.json();
}

/**
 * PUT request with auth
 */
async function apiPut(url, data) {
    const response = await apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });

    if (!response) return null;

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
    }

    return await response.json();
}

/**
 * PATCH request with auth
 */
async function apiPatch(url, data) {
    const response = await apiRequest(url, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });

    if (!response) return null;

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
    }

    return await response.json();
}

/**
 * DELETE request with auth
 */
async function apiDelete(url) {
    const response = await apiRequest(url, {
        method: 'DELETE'
    });

    if (!response) return null;

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
    }

    return response.status === 204 ? true : await response.json();
}

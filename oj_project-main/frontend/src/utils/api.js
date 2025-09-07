const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Utility function to make API calls with proper error handling
export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        console.log(`Making API call to: ${url}`);
        console.log('Request config:', config);
        
        const response = await fetch(url, config);
        const data = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        return { response, data };
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Specific function for checking authentication
export const checkAuth = async () => {
    return apiCall('/users/me', { method: 'GET' });
};

// Function for creating problems
export const createProblem = async (problemData) => {
    return apiCall('/problems/create', {
        method: 'POST',
        body: JSON.stringify(problemData),
    });
};

// Function for getting user problems
export const getMyProblems = async (page = 1, limit = 10) => {
    return apiCall(`/problems/my-problems?page=${page}&limit=${limit}`, {
        method: 'GET',
    });
};

// Function for getting all problems
export const getAllProblems = async (filters = {}) => {
    const queryParams = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 10,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
    });
    
    return apiCall(`/problems?${queryParams}`, { method: 'GET' });
};

export default { apiCall, checkAuth, createProblem, getMyProblems, getAllProblems };

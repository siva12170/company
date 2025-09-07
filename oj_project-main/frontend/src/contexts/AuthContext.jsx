import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RouteLoader from '../components/RouteLoader';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const checkAuthentication = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
                  
            const result = await response.json();
            
            if (response.ok && result.success && result.data) {
                setIsAuthenticated(true);
                setUser(result.data);
                // Remove localStorage usage for user data - rely only on cookies
                
                // Only redirect to dashboard if user is on auth page
                if (location.pathname === '/auth') {
                    navigate('/', { replace: true });
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
                // Remove localStorage cleanup since we're not using it
                
                // Redirect to auth if trying to access protected routes
                const protectedRoutes = ['/dashboard', '/profile', '/edit-profile', '/problems', '/problem', '/create-problem', '/edit-problem', '/my-problems', '/submissions'];
                const isProtectedRoute = protectedRoutes.some(route => 
                    location.pathname.startsWith(route)
                );
                
                if (isProtectedRoute) {
                    navigate('/auth', { replace: true });
                }
            }
        } catch (error) {
            console.error("Error checking authentication:", error);
            setIsAuthenticated(false);
            setUser(null);
            // Remove localStorage cleanup since we're not using it
        } finally {
            // Add minimum loading time for smooth transition
            setTimeout(() => {
                setIsLoading(false);
            }, 800);
        }
    };

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        // Remove localStorage usage - rely only on cookies
    };

    const logout = async () => {
        try {
            // Call backend logout to clear cookies
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            // Remove localStorage cleanup since we're not using it
            navigate('/auth', { replace: true });
        }
    };

    useEffect(() => {
        checkAuthentication();
    }, [location.pathname]);

    // Show loading screen during authentication check
    if (isLoading) {
        return <RouteLoader message="Verifying authentication..." />;
    }

    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        isLoading,
        setIsLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

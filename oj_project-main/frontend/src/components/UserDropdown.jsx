import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleSuccess, handleError } from '../utils';

const UserDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        setIsOpen(false);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                logout(); // Use auth context logout
                handleSuccess("Logout successful!");
            } else {
                const result = await response.json();
                handleError(result.message || "Logout failed");
            }
        } catch (error) {
            console.error("Error during logout:", error);
            logout(); // Force logout on error
            handleError("Logout failed. Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleLogin = () => {
        navigate('/auth');
    };

    // Get user initials for avatar
    const getUserInitials = (username) => {
        if (!username) return 'U';
        return username.slice(0, 2).toUpperCase();
    };

    if (!isAuthenticated) {
        return (
            <button 
                className="text-black hover:text-gray-600 transition-colors px-4 py-2 rounded-lg border-2 border-black hover:bg-gray-100 font-medium"
                onClick={handleLogin}
            >
                Login
            </button>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* User Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-black hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-300"
            >
                {/* Avatar */}
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden border-2 border-gray-300">
                    {user?.avatar && user.avatar !== "https://www.svgrepo.com/show/452030/avatar-default.svg" ? (
                        <img 
                            src={user.avatar} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : (
                        <span>{getUserInitials(user?.username)}</span>
                    )}
                    {/* Fallback for broken images */}
                    {user?.avatar && user.avatar !== "https://www.svgrepo.com/show/452030/avatar-default.svg" && (
                        <div 
                            className="w-8 h-8 flex items-center justify-center text-white text-sm font-medium"
                            style={{ display: 'none' }}
                        >
                            <span>{getUserInitials(user?.username)}</span>
                        </div>
                    )}
                </div>
                
                {/* Username */}
                <span className="hidden md:block text-sm font-medium">
                    {user?.username || 'User'}
                </span>

                {/* Dropdown Arrow */}
                <svg 
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-black z-50 backdrop-blur-lg">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b-2 border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-medium overflow-hidden border-2 border-gray-300">
                                {user?.avatar && user.avatar !== "https://www.svgrepo.com/show/452030/avatar-default.svg" ? (
                                    <img 
                                        src={user.avatar} 
                                        alt="Avatar" 
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : (
                                    <span>{getUserInitials(user?.username)}</span>
                                )}
                                {/* Fallback for broken images */}
                                {user?.avatar && user.avatar !== "https://www.svgrepo.com/show/452030/avatar-default.svg" && (
                                    <div 
                                        className="w-10 h-10 flex items-center justify-center text-white font-medium"
                                        style={{ display: 'none' }}
                                    >
                                        <span>{getUserInitials(user?.username)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-black truncate">
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/profile');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-gray-800 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Account
                        </button>

                        {/* Problem Management for Problemsetters and Admins */}
                        {(user?.accType === 'Problemsetter' || user?.accType === 'Admin') && (
                            <div className="border-t border-gray-200 mt-1 pt-1">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/my-problems');
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-gray-800 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    My Problems
                                </button>

                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/create-problem');
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-gray-800 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create Problem
                                </button>
                            </div>
                        )}

                        <div className="border-t border-gray-200 mt-1 pt-1">
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className={`flex items-center w-full px-4 py-2 text-sm text-black hover:bg-red-50 hover:text-red-700 transition-colors ${
                                    isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                {isLoggingOut ? 'Logging out...' : 'Log out'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;